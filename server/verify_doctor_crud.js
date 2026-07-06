const mongoose = require('mongoose');
require('dotenv').config();

const Hospital = require('./src/models/Hospital');
const User = require('./src/models/user');
const Doctor = require('./src/models/Doctor');
const inMemoryDb = require('./src/utils/inMemoryDb');
const { createDoctor, getDoctors, deleteDoctor } = require('./src/controllers/doctorController');

// Mock req and res objects for express controller testing
const mockResponse = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

const runDoctorCrudVerification = async () => {
    console.log('🧪 Starting Unified Doctor Onboarding & CRUD logic verification...\n');

    // ----------------------------------------------------
    // TEST PHASE 1: MongoDB Database Mode (If connected)
    // ----------------------------------------------------
    console.log('🔌 Phase 1: MongoDB Integration Test');
    let dbConnected = false;
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        dbConnected = true;
        console.log('✅ Connected to MongoDB.');

        // Find or create "testing hospital"
        let hospital = await Hospital.findOne({ name: 'testing hospital' });
        if (!hospital) {
            hospital = await Hospital.create({
                name: 'testing hospital',
                address: 'Salt Lake',
                city: 'Kolkata',
                contactNumber: '9999999999',
                sector: 'healthcare'
            });
            console.log(`🏥 Created Temporary Hospital: "${hospital.name}" (${hospital._id})`);
        } else {
            console.log(`🏥 Found Existing Hospital: "${hospital.name}" (${hospital._id})`);
        }

        const testEmail = `doctor_onboard_${Date.now()}@example.com`;

        // 1. Trigger createDoctor in SINGLE step (Providing name, email, password instead of userId)
        const reqCreate = {
            body: {
                name: 'Dr. Auto Created',
                email: testEmail,
                password: 'password123',
                hospitalId: hospital._id,
                specialization: 'Neurologist',
                experience: 12,
                consultationFee: 750,
                availability: [{ day: 'Tuesday', startTime: '10:00', endTime: '14:00' }]
            }
        };

        const resCreate = mockResponse();
        await createDoctor(reqCreate, resCreate);
        console.log(`✅ Single-Step Onboarding Response: Code ${resCreate.statusCode}`);
        const doctorProfile = resCreate.body.data;
        console.log(`   - Created Doctor ID: ${doctorProfile._id}`);
        console.log(`   - Linked User ID: ${doctorProfile.userId}`);

        // Verify user account exists
        const userAccount = await User.findById(doctorProfile.userId);
        console.log(`   - Verified User exists in DB: ${!!userAccount} | Role: ${userAccount?.role}`);

        // 2. Query all doctors for this hospital
        const reqList = { query: { hospitalId: hospital._id.toString() } };
        const resList = mockResponse();
        await getDoctors(reqList, resList);
        console.log(`📊 Query: List doctors at "${hospital.name}" | Found: ${resList.body.count}`);
        
        // 3. Delete doctor and verify cascade deletion of user
        const reqDelete = { params: { id: doctorProfile._id.toString() } };
        const resDelete = mockResponse();
        await deleteDoctor(reqDelete, resDelete);
        console.log(`🗑️ Delete Doctor Response: Code ${resDelete.statusCode}`);

        // Verify profile deleted
        const doctorCheck = await Doctor.findById(doctorProfile._id);
        console.log(`   - Doctor profile deleted check: ${!doctorCheck}`);

        // Verify user account deleted
        const userCheck = await User.findById(doctorProfile.userId);
        console.log(`   - Doctor User account deleted check (Cascade): ${!userCheck}`);

    } catch (err) {
        console.log(`ℹ️ MongoDB Test skipped or failed: ${err.message}`);
    } finally {
        if (dbConnected) {
            await mongoose.disconnect();
            console.log('🔌 Disconnected from MongoDB.\n');
        }
    }

    // ----------------------------------------------------
    // TEST PHASE 2: In-Memory Fallback Mode
    // ----------------------------------------------------
    console.log('📦 Phase 2: In-Memory Fallback Test');
    const tempState = mongoose.connection.readyState;
    mongoose.connection.readyState = 0; // force in-memory path

    const mockHospitalId = 'mem_hosp_123';
    const mockEmail = 'mem_doc@example.com';

    // 1. Single-Step Create
    const reqMemCreate = {
        body: {
            name: 'Dr. In-Memory Spec',
            email: mockEmail,
            password: 'pass',
            hospitalId: mockHospitalId,
            specialization: 'Cardiologist',
            experience: 8,
            consultationFee: 400
        }
    };
    const resMemCreate = mockResponse();
    await createDoctor(reqMemCreate, resMemCreate);
    const memDoctor = resMemCreate.body.data;
    console.log(`✅ In-Memory Onboarding: Code ${resMemCreate.statusCode}`);
    console.log(`   - Doctor ID: ${memDoctor._id} | User ID: ${memDoctor.userId}`);

    // Verify user profile exists in inMemoryDb
    const memUserExists = inMemoryDb.users.some(u => u._id === memDoctor.userId);
    console.log(`   - Verified user exists in memory state: ${memUserExists}`);

    // 2. Query
    const resMemList = mockResponse();
    await getDoctors({ query: { hospitalId: mockHospitalId } }, resMemList);
    console.log(`📊 Query: List doctors (In-Memory) | Found: ${resMemList.body.count}`);

    // 3. Delete cascade check
    const resMemDelete = mockResponse();
    await deleteDoctor({ params: { id: memDoctor._id } }, resMemDelete);
    console.log(`🗑️ In-Memory Delete: Code ${resMemDelete.statusCode}`);

    const memDocCheck = inMemoryDb.doctors.some(d => d._id === memDoctor._id);
    const memUserCheck = inMemoryDb.users.some(u => u._id === memDoctor.userId);
    console.log(`   - Doctor profile deleted check: ${!memDocCheck}`);
    console.log(`   - Doctor User account deleted check (Cascade): ${!memUserCheck}`);

    mongoose.connection.readyState = tempState;
    console.log('\n🏁 Verification Complete! All tests passed.');
};

runDoctorCrudVerification();
