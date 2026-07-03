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

    return {
        specialization,
        appointmentDate: appointmentDateStr,
        timeSlot,
        reasonForVisit: textQuery || 'General Checkup',
        patientName
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
        const fromNumber = req.body.From ? req.body.From.replace('whatsapp:', '') : '';
        const bodyText = req.body.Body || '';
        const mediaUrl = req.body.MediaUrl0;
        const mediaContentType = req.body.MediaContentType0;

        console.log(`\n📥 Received WhatsApp Message from: ${fromNumber}`);
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
    "patientName": "patient's name if mentioned, otherwise null"
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

        // ==========================================
        // BOOKING COORDINATION ENGINE
        // ==========================================
        let patientUser = null;
        let doctor = null;
        let hospital = null;
        let tokenNumber = 1;
        let appointmentId = '';

        const dbConnected = mongoose.connection.readyState === 1 && process.env.USE_IN_MEMORY !== 'true';

        if (dbConnected) {
            // MongoDB Mode
            // 1. Resolve Patient
            patientUser = await User.findOne({ mobile: fromNumber });
            if (!patientUser) {
                patientUser = await User.create({
                    name: extracted.patientName || `WhatsApp Patient (${fromNumber.slice(-4)})`,
                    email: `${fromNumber}@whatsapp.com`,
                    mobile: fromNumber,
                    password: new mongoose.Types.ObjectId().toString(), // mock password
                    role: 'patient'
                });
                console.log(`✅ Auto-Registered New Patient: ${patientUser.name}`);
            }

            // 2. Resolve Doctor & Hospital
            doctor = await Doctor.findOne({ specialization: extracted.specialization }).populate('userId');
            if (!doctor) {
                doctor = await Doctor.findOne().populate('userId'); // fallback to first doctor
            }
            
            if (doctor) {
                hospital = await Hospital.findById(doctor.hospitalId);
            }
            if (!hospital) {
                hospital = await Hospital.findOne(); // fallback to first hospital
            }

            if (!doctor || !hospital) {
                return sendTwiMLResponse(res, `Hello! We understood your request for a ${extracted.specialization}, but there are no clinics registered on FlexiBook right now.`);
            }

            // 3. Queue Token Allocation
            const lastApp = await Appointment.findOne({
                doctor: doctor._id,
                hospital: hospital._id,
                appointmentDate: new Date(extracted.appointmentDate)
            }).sort({ tokenNumber: -1 });

            tokenNumber = lastApp ? lastApp.tokenNumber + 1 : 1;

            // 4. Save Appointment
            const appt = await Appointment.create({
                patient: patientUser._id,
                doctor: doctor._id,
                hospital: hospital._id,
                appointmentDate: new Date(extracted.appointmentDate),
                timeSlot: extracted.timeSlot,
                tokenNumber,
                reasonForVisit: extracted.reasonForVisit,
                paymentStatus: 'Pending'
            });
            appointmentId = appt._id;

        } else {
            // In-Memory Fallback Mode
            // 1. Resolve Patient
            patientUser = inMemoryDb.users.find(u => u.mobile === fromNumber);
            if (!patientUser) {
                patientUser = {
                    _id: new mongoose.Types.ObjectId().toString(),
                    name: extracted.patientName || `WhatsApp Patient (${fromNumber.slice(-4)})`,
                    email: `${fromNumber}@whatsapp.com`,
                    mobile: fromNumber,
                    role: 'patient'
                };
                inMemoryDb.users.push(patientUser);
                console.log(`✅ Auto-Registered New Patient (In-Memory): ${patientUser.name}`);
            }

            // 2. Resolve Doctor & Hospital
            doctor = inMemoryDb.doctors.find(d => d.specialization === extracted.specialization);
            if (!doctor) {
                doctor = inMemoryDb.doctors[0]; // fallback
            }

            if (doctor) {
                const docUser = inMemoryDb.users.find(u => u._id === doctor.userId);
                doctor = { ...doctor, userId: docUser }; // simulate populating
                hospital = inMemoryDb.hospitals.find(h => h._id === doctor.hospitalId);
            }
            if (!hospital) {
                hospital = inMemoryDb.hospitals[0]; // fallback
            }

            if (!doctor || !hospital) {
                return sendTwiMLResponse(res, `Hello! We understood your request for a ${extracted.specialization}, but there are no clinics registered on FlexiBook right now.`);
            }

            // 3. Queue Token Allocation
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

            // 4. Save Appointment
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
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // ==========================================
        // COMPOSE WHATSAPP RESPONSE
        // ==========================================
        const doctorName = doctor.userId ? doctor.userId.name : 'Doctor';
        const hospitalName = hospital ? hospital.name : 'FlexiBook Clinic';
        const formattedDate = new Date(extracted.appointmentDate).toDateString();

        const responseText = `*Appointment Confirmed! 🎟️*

Hello *${patientUser.name}*, we have booked your slot using your voice note!

🏥 *Hospital*: ${hospitalName}
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
        return sendTwiMLResponse(res, "Hello, we encountered a technical issue parsing your voice note. Please try writing your appointment request in text.");
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
