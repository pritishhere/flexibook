// src/controllers/queueController.js
const { getIO } = require('../config/socket');
const Appointment = require('../models/Appointment');

// ==========================================
// 🔄 1 & 2: NEXT PATIENT CALL (Queue Update + Your Turn Alert)
// ==========================================
// Doctor apne dashboard par "Call Next Patient" button dabayega, tab yeh chalega
exports.callNextPatient = async (req, res) => {
    try {
        const { doctorId, currentServingToken } = req.body;

        const io = getIO();

        // 🔄 A. Poore room ko batao ki queue aage badh gayi hai
        io.to(doctorId).emit('queue_update', {
            message: `Queue is moving! Now doctor is seeing token #${currentServingToken}`,
            currentToken: currentServingToken
        });

        // 🚨 B. Kisi specific patient ko alert bhejo jiska yeh token number hai
        // Frontend isko check karega, agar token match hua toh pop-up dikha dega
        io.to(doctorId).emit('your_turn_alert', {
            tokenNumber: Number(currentServingToken),
            message: `🚨 It's your turn! Please proceed to the Doctor's cabin immediately.`
        });

        res.status(200).json({ 
            success: true, 
            message: `Live WebSocket alerts sent for Token #${currentServingToken}` 
        });

    } catch (error) {
        console.error("WebSocket Emit Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 📢 3: EMERGENCY BROADCAST
// ==========================================
// Admin ya Doctor jab emergency button dabayenge, tab yeh chalega
exports.triggerEmergency = async (req, res) => {
    try {
        const { message } = req.body;

        const io = getIO();

        // 🔥 .to() nahi lagaya, matlab poori website par jitne bhi log online hain, sabko dikhega!
        io.emit('emergency_broadcast', {
            type: 'CRITICAL_ALERT',
            message: message || "Attention! Dr. is called for an emergency surgery. Delay expected.",
            timestamp: new Date()
        });

        res.status(200).json({ 
            success: true, 
            message: "Emergency broadcast sent successfully to all connected website clients!" 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};