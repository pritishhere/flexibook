const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const inMemoryDb = require('../utils/inMemoryDb');

let GoogleGenerativeAI;
try {
    GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
    // Safe fallback, will use local engine if not installed
}

// Offline local keyword fallback mapping
const analyzeSymptomsLocal = (symptomsText) => {
    const text = symptomsText.toLowerCase();

    const mappings = [
        {
            specialty: 'Cardiologist',
            keywords: ['heart', 'chest pain', 'palpitation', 'breathless', 'cardio', 'valve', 'bp', 'blood pressure']
        },
        {
            specialty: 'Neurologist',
            keywords: ['brain', 'headache', 'migraine', 'nerve', 'stroke', 'paralysis', 'seizure', 'epilepsy', 'dizzy']
        },
        {
            specialty: 'Dermatologist',
            keywords: ['skin', 'rash', 'acne', 'itch', 'eczema', 'hair', 'nail', 'allergy']
        },
        {
            specialty: 'Orthopedic',
            keywords: ['bone', 'joint', 'muscle', 'fracture', 'back pain', 'knee', 'spine', 'sprain', 'injury']
        },
        {
            specialty: 'Dentist',
            keywords: ['tooth', 'gum', 'teeth', 'cavity', 'oral', 'mouth pain']
        },
        {
            specialty: 'General Physician',
            keywords: ['fever', 'cold', 'cough', 'flu', 'fatigue', 'weakness', 'vomit', 'stomach', 'diarrhea', 'sore throat']
        }
    ];

    for (const mapping of mappings) {
        for (const keyword of mapping.keywords) {
            if (text.includes(keyword)) {
                return {
                    specialty: mapping.specialty,
                    reason: `Matched keyword "${keyword}" to ${mapping.specialty} (Offline Local Engine)`
                };
            }
        }
    }

    return {
        specialty: 'General Physician',
        reason: 'No specific keywords matched; referred to General Physician as safe fallback (Offline Local Engine)'
    };
};

// Gemini API Symptom Analyzer using the official SDK
const analyzeSymptomsWithGemini = async (symptomsText) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('key_here')) {
        throw new Error('Gemini API Key is not configured');
    }

    if (!GoogleGenerativeAI) {
        throw new Error('@google/generative-ai package is not installed');
    }

    // Initialize GoogleGenerativeAI from the SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    Patient Symptoms: "${symptomsText}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResponse = response.text().trim();

    // Strip out markdown code fences if Gemini accidentally returned them
    if (textResponse.includes('```')) {
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(textResponse);
    return {
        specialty: parsed.specialty,
        reason: `${parsed.reason} (Powered by Google Gemini AI SDK)`
    };
};

// @desc    Analyze symptoms and recommend matching doctors
// @route   POST /api/ai/symptom-check
// @access  Public
exports.checkSymptoms = async (req, res) => {
    try {
        const { symptoms, city } = req.body;

        if (!symptoms) {
            return res.status(400).json({
                success: false,
                message: 'Symptoms text is required'
            });
        }

        let analysis;
        try {
            // Attempt Gemini analysis first
            analysis = await analyzeSymptomsWithGemini(symptoms);
        } catch (geminiError) {
            // Fall back to rule-based mapping silently
            console.log('ℹ️ Gemini AI check bypassed or failed. Falling back to local engine:', geminiError.message);
            analysis = analyzeSymptomsLocal(symptoms);
        }

        const suggestedSpecialty = analysis.specialty;
        let recommendations = [];

        // Fetch doctors matching suggested specialty and filter by city
        if (inMemoryDb.isDbConnected()) {
            // MongoDB Logic
            const doctors = await Doctor.find({
                specialization: { $regex: suggestedSpecialty, $options: 'i' }
            })
            .populate('userId', 'name email')
            .populate('hospitalId', 'name address city contactNumber rating');

            recommendations = doctors.filter(doc => {
                if (!city) return true;
                return doc.hospitalId && doc.hospitalId.city.toLowerCase() === city.toLowerCase();
            });

            recommendations = recommendations.map(doc => ({
                doctor: {
                    _id: doc._id,
                    name: doc.userId ? doc.userId.name : 'Unknown Doctor',
                    email: doc.userId ? doc.userId.email : '',
                    specialization: doc.specialization,
                    experience: doc.experience,
                    fees: doc.fees,
                    availability: doc.availability,
                    isAvailable: doc.isAvailable
                },
                hospital: doc.hospitalId || null
            }));

        } else {
            // In-Memory Fallback Logic
            let doctors = inMemoryDb.doctors.filter(d => 
                d.specialization && d.specialization.toLowerCase().includes(suggestedSpecialty.toLowerCase())
            );

            doctors.forEach(d => {
                const user = inMemoryDb.users.find(u => u._id === d.userId);
                const hospital = inMemoryDb.hospitals.find(h => h._id === d.hospitalId);

                if (!city || (hospital && hospital.city.toLowerCase() === city.toLowerCase())) {
                    recommendations.push({
                        doctor: {
                            _id: d._id,
                            name: user ? user.name : 'Unknown Doctor',
                            email: user ? user.email : '',
                            specialization: d.specialization,
                            experience: d.experience,
                            fees: d.fees,
                            availability: d.availability,
                            isAvailable: d.isAvailable
                        },
                        hospital: hospital || null
                    });
                }
            });
        }

        res.status(200).json({
            success: true,
            suggestedSpecialty,
            reason: analysis.reason,
            count: recommendations.length,
            recommendations
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to complete symptom check',
            error: error.message
        });
    }
};
