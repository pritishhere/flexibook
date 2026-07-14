// c:\Users\priti\OneDrive\Desktop\BACKEND\flexibook\server\start_whatsapp_only.js
require('dotenv').config();
const { startWhatsAppClient } = require('./src/services/whatsappClient');

console.log('🔄 STARTING WHATSAPP AUTHENTICATION TOOL...');
console.log('   - This tool will print your pairing code or QR code in this window.');
console.log('   - Once you link your device successfully, you can close this tool.\n');

startWhatsAppClient();
