const { Server } = require('socket.io');

let io; // Global instance

const initSocket = (server) => {
    // 1. Socket.io ko humare HTTP server ke upar mount karna
    io = new Server(server, {
        cors: {
            origin: "*", // Yahan apne Frontend ka URL daalna in production (e.g., React App)
            methods: ["GET", "POST"]
        }
    });

    // 2. Jab koi naya patient app kholda hai
    io.on('connection', (socket) => {
        console.log(`🔌 New Device Connected: ${socket.id}`);

        // 3. Room Logic: Patient specific doctor ke 'Virtual Room' mein join karega
        socket.on('join_doctor_queue', (doctorId) => {
            socket.join(doctorId);
            console.log(`🏥 Socket ${socket.id} joined Doctor Room: ${doctorId}`);
        });

        // 4. Jab patient app band kar de
        socket.on('disconnect', () => {
            console.log(`❌ Device Disconnected: ${socket.id}`);
        });
    });

    return io;
};

// Kisi bhi API Controller se Live Alert bhejne ke liye is function ko use karenge
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io engine abhi start nahi hua hai!");
    }
    return io;
};

module.exports = { initSocket, getIO };