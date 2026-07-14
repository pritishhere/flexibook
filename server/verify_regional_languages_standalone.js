// c:\Users\priti\OneDrive\Desktop\BACKEND\flexibook\server\verify_regional_languages_standalone.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const runAudit = async () => {
    console.log('🔄 STARTING REGIONAL LANGUAGES COMPATIBILITY AUDIT (GEMINI AI & WHATSAPP ENGINE)...');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('key_here')) {
        console.error('\n❌ AUDIT ABORTED: Gemini API Key is not configured in your .env file.');
        console.log('Please ensure GEMINI_API_KEY is configured before running this audit.');
        process.exit(1);
    }

    console.log('✅ Gemini API Key found. Connecting to Google Gemini API (gemini-2.5-flash)...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // ==========================================================
    // TEST 1: FLEXICARE AI SYMPTOM CHECKER (TEXT REGIONAL TRANSLATION)
    // ==========================================================
    console.log('\n[TEST 1] Testing Flexicare AI Symptom Checker with Regional Languages...');

    const symptomsTestCases = [
        {
            lang: 'Hindi',
            input: 'मेरे पेट में बहुत तेज़ दर्द हो रहा है और उल्टी जैसा लग रहा है।', // Severe stomach pain and vomiting
            expectedSpecialty: 'General Physician'
        },
        {
            lang: 'Bengali',
            input: 'আমার বুকে খুব ব্যাথা করছে আর বাম হাতটা ভারী লাগছে।', // Chest pain and left arm feeling heavy
            expectedSpecialty: 'Cardiologist'
        },
        {
            lang: 'Tamil',
            input: 'எனது பற்களில் கடுமையான வலி உள்ளது மற்றும் ஈறுகளில் இரத்தம் வருகிறது.', // Severe toothache and bleeding gums
            expectedSpecialty: 'Dentist'
        }
    ];

    for (const testCase of symptomsTestCases) {
        console.log(`\n👉 Sending ${testCase.lang} Input: "${testCase.input}"`);
        
        const prompt = `
        Analyze the following patient symptoms (which may be written in English or any Indian regional language such as Hindi, Bengali, Tamil, Telugu, Kannada, Marathi, Gujarati, Malayalam, Odia, Punjabi, etc. Translate them to English if needed) and match them to the most suitable medical specialty from this list:
        - Cardiologist
        - Neurologist
        - Dermatologist
        - Orthopedic
        - Dentist
        - General Physician

        Return ONLY a raw JSON object containing the mapped specialty and a short clinical explanation (written in English) of why it fits. 
        Do not add markdown formatting or backticks. Follow this exact structure:
        {
          "specialty": "SpecialtyName",
          "reason": "Short clinical reason why these symptoms fit this specialty."
        }

        Patient Symptoms: "${testCase.input}"
        `;

        try {
            const result = await model.generateContent(prompt);
            let responseText = result.response.text().trim();
            
            if (responseText.includes('```')) {
                responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            }

            const parsed = JSON.parse(responseText);
            console.log(`   - Mapped Specialty: ${parsed.specialty}`);
            console.log(`   - Translated Reason: "${parsed.reason}"`);

            if (parsed.specialty.toLowerCase() === testCase.expectedSpecialty.toLowerCase()) {
                console.log(`   ✅ PASSED: Successfully mapped to ${testCase.expectedSpecialty}`);
            } else {
                console.log(`   ⚠️ WARNING: Expected ${testCase.expectedSpecialty} but got ${parsed.specialty}`);
            }
        } catch (error) {
            console.error(`   ❌ Failed to process ${testCase.lang} symptoms: ${error.message}`);
        }
    }

    // ==========================================================
    // TEST 2: WHATSAPP BOOKING PARSER (TEXT/VOICE NLP TRANSCRIPTION & CONTEXT)
    // ==========================================================
    console.log('\n[TEST 2] Testing WhatsApp Booking Parser with Regional NLP contexts...');

    const today = new Date();
    const todayStr = today.toDateString();

    const whatsappTestCases = [
        {
            lang: 'Hinglish (Hindi written in English alphabets)',
            input: 'Mujhe kal subah ek dentist se checkup karwana hai',
            expectedSpecialization: 'Dentist',
            expectedRelativeDays: 1 // Tomorrow
        },
        {
            lang: 'Bengali',
            input: 'আমি আজ দুপুরে একজন কার্ডিওলজিস্ট দেখাতে চাই', // I want to see a cardiologist today afternoon
            expectedSpecialization: 'Cardiologist',
            expectedRelativeDays: 0 // Today
        }
    ];

    for (const testCase of whatsappTestCases) {
        console.log(`\n👉 Sending ${testCase.lang} request: "${testCase.input}"`);

        const prompt = `
        You are an AI receptionist for FlexiBook clinic queue management.
        Analyze the patient's request (which may be a voice recording or a text message in English or any Indian regional language such as Hindi, Bengali, Tamil, Telugu, Kannada, Marathi, Gujarati, Malayalam, Odia, Punjabi, etc.).
        Extract the details and return them STRICTLY in the following JSON format:
        {
            "specialization": "one of: Cardiologist, Dermatologist, Gastroenterologist, General Physician, Neurologist, Pediatrician, Orthopedic, Dentist",
            "appointmentDate": "YYYY-MM-DD format. Parse relative days like 'kal' (tomorrow), 'aaj' (today), relative to current date: ${todayStr}",
            "timeSlot": "morning, afternoon, or evening mapped to: '10:00 AM - 12:00 PM', '02:00 PM - 04:00 PM', or '05:00 PM - 07:00 PM'",
            "reasonForVisit": "short English summary of symptoms (e.g. 'Stomach pain', 'Cold')",
            "patientName": "patient's name if mentioned, otherwise null",
            "hospitalName": "name of a specific clinic or hospital if mentioned (e.g. 'AIIMS', 'Metro', 'Apollo'), otherwise null",
            "patientAge": "patient's age as integer if mentioned, otherwise null",
            "patientGender": "one of: male, female, other if mentioned, otherwise null"
        }
        Ensure the output is ONLY a valid JSON object. Do not wrap in markdown backticks or blockquotes.
        
        Patient Request: "${testCase.input}"
        `;

        try {
            const result = await model.generateContent(prompt);
            let responseText = result.response.text().trim();
            
            if (responseText.includes('```')) {
                responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            }

            const parsed = JSON.parse(responseText);
            console.log(`   - Extracted Specialization: ${parsed.specialization}`);
            console.log(`   - Extracted Date: ${parsed.appointmentDate}`);
            console.log(`   - Extracted Slot: ${parsed.timeSlot}`);
            console.log(`   - Extracted Reason (Translated): "${parsed.reasonForVisit}"`);

            if (parsed.specialization.toLowerCase() === testCase.expectedSpecialization.toLowerCase()) {
                console.log(`   ✅ PASSED: Successfully mapped specialization to ${testCase.expectedSpecialization}`);
            } else {
                console.log(`   ⚠️ WARNING: Expected ${testCase.expectedSpecialization} but got ${parsed.specialization}`);
            }
        } catch (error) {
            console.error(`   ❌ Failed to process ${testCase.lang} booking: ${error.message}`);
        }
    }

    console.log('\n🌟🌟🌟 REGIONAL LANGUAGES COMPATIBILITY AUDIT COMPLETED! 🌟🌟🌟');
};

runAudit();
