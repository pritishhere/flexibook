const https = require('https');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/user');
const inMemoryDb = require('../utils/inMemoryDb');

// Initialize Gemini SDK safely
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Local fallback engine to understand text requests if Gemini fails/offline
const parseVoiceRequestLocal = (textQuery) => {
    const text = (textQuery || '').toLowerCase();
    
    // 1. Resolve Specialization
    let specialization = 'General Physician';
    if (text.includes('heart') || text.includes('cardio') || text.includes('bp') || text.includes('chest')) {
        specialization = 'Cardiologist';
    } else if (text.includes('skin') || text.includes('allergy') || text.includes('rash') || text.includes(' खुजली')) {
        specialization = 'Dermatologist';
    } else if (text.includes('pet') || text.includes('gastro') || text.includes('stomach') || text.includes('gas')) {
        specialization = 'Gastroenterologist';
    } else if (text.includes('brain') || text.includes('headache') || text.includes('migraine') || text.includes('sir dard')) {
        specialization = 'Neurologist';
    } else if (text.includes('child') || text.includes('baccha') || text.includes('pediatric')) {
        specialization = 'Pediatrician';
    } else if (text.includes('bone') || text.includes('joint') || text.includes('fracture') || text.includes(' हड्डी')) {
        specialization = 'Orthopedic';
    }

    // 2. Resolve Date (Today vs Tomorrow)
    const appointmentDate = new Date();
    if (text.includes('kal') || text.includes('tomorrow') || text.includes('subah') || text.includes('shokal')) {
        appointmentDate.setDate(appointmentDate.getDate() + 1); // tomorrow
    }
    const appointmentDateStr = appointmentDate.toISOString().split('T')[0];

    // 3. Resolve Time Slot
    let timeSlot = '10:00 AM - 12:00 PM';
    if (text.includes('evening') || text.includes('shaam') || text.includes('bikol')) {
        timeSlot = '05:00 PM - 07:00 PM';
    } else if (text.includes('afternoon') || text.includes('dopahar') || text.includes('dupur')) {
        timeSlot = '02:00 PM - 04:00 PM';
    }

    // 4. Resolve Name
    let patientName = null;
    const nameMatch = textQuery.match(/(?:naam|name is|naam hai)\s+([A-Za-z]+)/i);
    if (nameMatch && nameMatch[1]) {
        patientName = nameMatch[1];
    }

    // 5. Resolve Specific Hospital name if requested
    let hospitalName = null;
    if (text.includes('aiims')) {
        hospitalName = 'AIIMS';
    } else if (text.includes('apollo')) {
        hospitalName = 'Apollo';
    } else if (text.includes('metro')) {
        hospitalName = 'Metro';
    } else if (text.includes('kolkata')) {
        hospitalName = 'Kolkata';
    }

    // 6. Resolve Age & Gender
    let patientAge = null;
    const ageMatch = text.match(/(\d+)\s*(?:saal|years|yr|age)/i);
    if (ageMatch && ageMatch[1]) {
        patientAge = parseInt(ageMatch[1]);
    }

    let patientGender = null;
    if (text.includes('female') || text.includes('ladki') || text.includes('mahila') || text.includes('women')) {
        patientGender = 'female';
    } else if (text.includes('male') || text.includes('ladka') || text.includes('purush') || text.includes('man')) {
        patientGender = 'male';
    }

    return {
        specialization,
        appointmentDate: appointmentDateStr,
        timeSlot,
        reasonForVisit: textQuery || 'General Checkup',
        patientName,
        hospitalName,
        patientAge,
        patientGender
    };
};

// Helper function to download audio from Twilio into a buffer
const downloadAudio = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download audio: ${res.statusCode}`));
                return;
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject);
    });
};

// @desc    Process incoming WhatsApp message (Voice or Text)
// @route   POST /api/voice-queue/whatsapp
// @access  Public (Webhook)
exports.handleIncomingWhatsAppMessage = async (req, res) => {
    try {
        // Handle case-insensitivity of incoming webhook request fields
        const fromField = req.body.From || req.body.from || '';
        const bodyText = req.body.Body || req.body.body || '';
        const mediaUrl = req.body.MediaUrl0 || req.body.mediaUrl0;
        const mediaContentType = req.body.MediaContentType0 || req.body.mediaContentType0;

        const fromNumber = fromField ? fromField.replace('whatsapp:', '').trim() : '';
        // If empty (e.g. key missing in Postman), auto-allocate a valid mock mobile for testing safety
        const testMobile = fromNumber || `9883769${Math.floor(1000 + Math.random() * 9000)}`;

        console.log(`\n📥 Received WhatsApp Message from: ${fromNumber || 'Postman Client (Mocked: ' + testMobile + ')'}`);
        if (mediaUrl) {
            console.log(`   - Audio Attached: ${mediaUrl} (${mediaContentType})`);
        } else {
            console.log(`   - Text Message Content: "${bodyText}"`);
        }

        let extracted = null;

        if (genAI) {
            try {
                // Get current date context for Gemini parsing
                const today = new Date();
                const todayStr = today.toDateString();

                // Use the correct gemini-2.5-flash model
                const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

                const prompt = `
You are an AI receptionist for FlexiBook clinic queue management.
Analyze the patient's request (which may be a voice recording or a text message in English, Hindi, or Bengali).
Extract the details and return them STRICTLY in the following JSON format:
{
    "specialization": "one of: Cardiologist, Dermatologist, Gastroenterologist, General Physician, Neurologist, Pediatrician, Orthopedic",
    "appointmentDate": "YYYY-MM-DD format. Parse relative days like 'kal' (tomorrow), 'aaj' (today), relative to current date: ${todayStr}",
    "timeSlot": "morning, afternoon, or evening mapped to: '10:00 AM - 12:00 PM', '02:00 PM - 04:00 PM', or '05:00 PM - 07:00 PM'",
    "reasonForVisit": "short English summary of symptoms (e.g. 'Stomach pain', 'Cold')",
    "patientName": "patient's name if mentioned, otherwise null",
    "hospitalName": "name of a specific clinic or hospital if mentioned (e.g. 'AIIMS', 'Metro', 'Apollo'), otherwise null",
    "patientAge": "patient's age as integer if mentioned, otherwise null",
    "patientGender": "one of: male, female, other if mentioned, otherwise null"
}
Ensure the output is ONLY a valid JSON object. Do not wrap in markdown backticks or blockquotes.
`;

                let geminiResponseText = '';

                if (mediaUrl) {
                    // Audio input
                    console.log('- Downloading audio attachment...');
                    const audioBuffer = await downloadAudio(mediaUrl);
                    console.log('- Sending audio to Gemini for multimodal understanding...');

                    const result = await model.generateContent([
                        {
                            inlineData: {
                                data: audioBuffer.toString('base64'),
                                mimeType: mediaContentType || 'audio/ogg'
                            }
                        },
                        prompt
                    ]);
                    geminiResponseText = result.response.text();
                } else {
                    // Text input
                    console.log('- Sending text input to Gemini...');
                    const result = await model.generateContent([prompt, bodyText]);
                    geminiResponseText = result.response.text();
                }

                // Clean JSON response
                const cleanJsonStr = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
                console.log(`   - Extracted JSON (Gemini): ${cleanJsonStr}`);
                extracted = JSON.parse(cleanJsonStr);

            } catch (geminiError) {
                console.log(`ℹ️ Gemini AI parser failed. Falling back to local engine: ${geminiError.message}`);
                extracted = parseVoiceRequestLocal(bodyText);
            }
        } else {
            console.log('ℹ️ Gemini SDK not configured. Running local keyword engine.');
            extracted = parseVoiceRequestLocal(bodyText);
        }

        // Ensure we have resolved properties
        if (!extracted) {
            extracted = parseVoiceRequestLocal(bodyText);
        }

        // Sanitize testMobile (remove spaces, +, and special characters) for database format safety
        const sanitizedFrom = testMobile.replace(/[^0-9]/g, ''); 

        // ==========================================
        // BOOKING COORDINATION ENGINE
        // ==========================================
        let patientUser = null;
        let doctor = null;
        let hospital = null;
        let tokenNumber = 1;
        let appointmentId = '';

        const dbConnected = mongoose.connection.readyState === 1 && process.env.USE_IN_MEMORY !== 'true';

        const finalName = extracted.patientName || `WhatsApp Patient (${sanitizedFrom.slice(-4)})`;

        if (dbConnected) {
            // MongoDB Mode
            // 1. Resolve Patient User Account
            patientUser = await User.findOne({ mobile: sanitizedFrom });
            if (!patientUser) {
                patientUser = await User.create({
                    name: finalName,
                    email: `${sanitizedFrom}@whatsapp.com`,
                    mobile: sanitizedFrom,
                    password: new mongoose.Types.ObjectId().toString(), // mock password
                    role: 'patient'
                });
                console.log(`✅ Auto-Registered New Patient Account: ${patientUser.name}`);
            }

            // 2. Resolve Hospital
            if (extracted.hospitalName) {
                hospital = await Hospital.findOne({ name: { $regex: extracted.hospitalName, $options: 'i' } });
            }
            if (!hospital) {
                hospital = await Hospital.findOne(); // default to first hospital
            }

            // 3. Resolve Doctor matching specialization at this hospital
            if (hospital) {
                doctor = await Doctor.findOne({ specialization: extracted.specialization, hospitalId: hospital._id }).populate('userId');
            }
            if (!doctor) {
                doctor = await Doctor.findOne({ specialization: extracted.specialization }).populate('userId'); // fallback search anywhere
            }
            if (!doctor) {
                doctor = await Doctor.findOne().populate('userId'); // ultimate fallback
            }

            // Recheck hospital matching the allocated doctor's workspace
            if (doctor && (!hospital || hospital._id.toString() !== doctor.hospitalId.toString())) {
                hospital = await Hospital.findById(doctor.hospitalId);
            }

            if (!doctor || !hospital) {
                return sendTwiMLResponse(res, `Hello! We understood your request for a ${extracted.specialization}, but there are no clinics registered on FlexiBook right now.`);
            }

            // 4. Queue Token Allocation
            const lastApp = await Appointment.findOne({
                doctor: doctor._id,
                hospital: hospital._id,
                appointmentDate: new Date(extracted.appointmentDate)
            }).sort({ tokenNumber: -1 });

            tokenNumber = lastApp ? lastApp.tokenNumber + 1 : 1;

            // 5. Save Appointment with clinical details
            const appt = await Appointment.create({
                patient: patientUser._id,
                doctor: doctor._id,
                hospital: hospital._id,
                appointmentDate: new Date(extracted.appointmentDate),
                timeSlot: extracted.timeSlot,
                tokenNumber,
                reasonForVisit: extracted.reasonForVisit,
                paymentStatus: 'Pending',
                patientName: finalName,
                patientAge: extracted.patientAge || null,
                patientGender: extracted.patientGender || null
            });
            appointmentId = appt._id;

        } else {
            // In-Memory Fallback Mode
            // 1. Resolve Patient User Account
            patientUser = inMemoryDb.users.find(u => u.mobile === sanitizedFrom);
            if (!patientUser) {
                patientUser = {
                    _id: new mongoose.Types.ObjectId().toString(),
                    name: finalName,
                    email: `${sanitizedFrom}@whatsapp.com`,
                    mobile: sanitizedFrom,
                    role: 'patient'
                };
                inMemoryDb.users.push(patientUser);
                console.log(`✅ Auto-Registered New Patient (In-Memory): ${patientUser.name}`);
            }

            // 2. Resolve Hospital
            if (extracted.hospitalName) {
                hospital = inMemoryDb.hospitals.find(h => h.name.toLowerCase().includes(extracted.hospitalName.toLowerCase()));
            }
            if (!hospital) {
                hospital = inMemoryDb.hospitals[0];
            }

            // 3. Resolve Doctor
            if (hospital) {
                doctor = inMemoryDb.doctors.find(d => d.specialization === extracted.specialization && d.hospitalId === hospital._id);
            }
            if (!doctor) {
                doctor = inMemoryDb.doctors.find(d => d.specialization === extracted.specialization);
            }
            if (!doctor) {
                doctor = inMemoryDb.doctors[0];
            }

            if (doctor) {
                const docUser = inMemoryDb.users.find(u => u._id === doctor.userId);
                doctor = { ...doctor, userId: docUser }; // simulate populating docUser object
            }

            if (doctor && (!hospital || hospital._id !== doctor.hospitalId)) {
                hospital = inMemoryDb.hospitals.find(h => h._id === doctor.hospitalId);
            }

            if (!doctor || !hospital) {
                return sendTwiMLResponse(res, `Hello! We understood your request for a ${extracted.specialization}, but there are no clinics registered on FlexiBook right now.`);
            }

            // 4. Queue Token Allocation
            const targetDateStr = new Date(extracted.appointmentDate).toDateString();
            const sameDayApps = inMemoryDb.appointments.filter(a =>
                a.doctor === doctor._id &&
                new Date(a.appointmentDate).toDateString() === targetDateStr
            );

            let maxToken = 0;
            sameDayApps.forEach(a => {
                if (a.tokenNumber > maxToken) maxToken = a.tokenNumber;
            });
            tokenNumber = maxToken + 1;

            // 5. Save Appointment
            appointmentId = new mongoose.Types.ObjectId().toString();
            inMemoryDb.appointments.push({
                _id: appointmentId,
                patient: patientUser._id,
                doctor: doctor._id,
                hospital: hospital._id,
                appointmentDate: new Date(extracted.appointmentDate),
                timeSlot: extracted.timeSlot,
                tokenNumber,
                reasonForVisit: extracted.reasonForVisit,
                status: 'Pending',
                paymentStatus: 'Pending',
                patientName: finalName,
                patientAge: extracted.patientAge || null,
                patientGender: extracted.patientGender || null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // ==========================================
        // COMPOSE WHATSAPP RESPONSE
        // ==========================================
        const doctorName = doctor.userId ? doctor.userId.name : 'Doctor';
        const hospitalName = hospital ? hospital.name : 'FlexiBook Clinic';
        const hospitalAddress = hospital ? (hospital.address || hospital.city || 'Kolkata') : 'Kolkata';
        const formattedDate = new Date(extracted.appointmentDate).toDateString();
        
        // Clickable Google Maps URL
        const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospitalName + ', ' + hospitalAddress)}`;

        const sourceWord = mediaUrl ? 'voice note' : 'message';

        // Styled patient demographics
        let patientProfileStr = `*${finalName}*`;
        if (extracted.patientAge || extracted.patientGender) {
            const parts = [];
            if (extracted.patientAge) parts.push(`Age: ${extracted.patientAge}`);
            if (extracted.patientGender) parts.push(extracted.patientGender.toUpperCase());
            patientProfileStr += ` (${parts.join(', ')})`;
        }

        const responseText = `*Appointment Confirmed! 🎟️*

Hello, we have booked your slot using your ${sourceWord}!

👤 *Patient*: ${patientProfileStr}
🏥 *Hospital*: ${hospitalName}
📍 *Address*: ${hospitalAddress}
🗺️ *Navigate (Google Maps)*: ${gmapsLink}
👨‍⚕️ *Doctor*: ${doctorName} (${extracted.specialization})
📅 *Date*: ${formattedDate}
🕒 *Time Slot*: ${extracted.timeSlot}
🔢 *Your Queue Token*: *#${tokenNumber}*
🗒️ *Symptoms*: ${extracted.reasonForVisit}

---
💳 *Consultation Fee*: ₹${doctor.consultationFee || 500}
👉 *Payment Link*: https://checkout.flexibook.com/pay/${appointmentId}
_(Please pay online to confirm your checked-in status in the live queue!)_`;

        return sendTwiMLResponse(res, responseText);

    } catch (error) {
        console.error('WhatsApp Webhook Error:', error);
        return sendTwiMLResponse(res, "Hello, we encountered a technical issue parsing your voice request. Please try writing your appointment details directly.");
    }
};

// Helper function to return XML payload in Twilio format
const sendTwiMLResponse = (res, messageText) => {
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${messageText}</Message>
</Response>`);
};


