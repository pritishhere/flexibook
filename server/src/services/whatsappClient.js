let Client = null;
let LocalAuth = null;
let qrcodeTerminal = { generate: () => {} };

try {
    ({ Client, LocalAuth } = require('whatsapp-web.js'));
} catch (error) {
    console.log('⚠️ whatsapp-web.js is not installed. WhatsApp Web booking listener is disabled.');
}

try {
    qrcodeTerminal = require('qrcode-terminal');
} catch (error) {
    console.log('⚠️ qrcode-terminal is not installed. WhatsApp QR display is disabled.');
}

const fs = require('fs');
const path = require('path');
const { handleIncomingWhatsAppMessage } = require('../controllers/voiceQueueController');

let clientInstance = null;

/**
 * Initializes the free self-hosted WhatsApp Web client.
 */
const startWhatsAppClient = () => {
    if (!Client || !LocalAuth) {
        console.log('ℹ️ Skipping WhatsApp Web Client startup.');
        return;
    }

    console.log('🔄 Initializing WhatsApp Web Client...');

    clientInstance = new Client({
        authStrategy: new LocalAuth({
            dataPath: path.join(__dirname, '../../.wwebjs_auth')
        }),
        puppeteer: {
            handleSIGINT: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        }
    });

    let pairingCodeRequested = false;

    // Event: QR Code received (needed for initial setup scan)
    clientInstance.on('qr', async (qr) => {
        const phone = process.env.WHATSAPP_PHONE_NUMBER;
        if (phone && !pairingCodeRequested) {
            pairingCodeRequested = true;
            console.log(`\n📱 Attempting to request pairing code for phone number: ${phone}...`);
            try {
                // Request the pairing code (digits only)
                const code = await clientInstance.requestPairingCode(phone.replace(/[^0-9]/g, ''));
                console.log('\n🔑 ========================================== 🔑');
                console.log('  WHATSAPP LINKING PAIRING CODE GENERATED');
                console.log(`  YOUR CODE: ${code}`);
                console.log('  Instructions:');
                console.log('  1. Open WhatsApp on your mobile phone');
                console.log('  2. Go to Linked Devices > Link a Device');
                console.log('  3. Select "Link with phone number instead"');
                console.log(`  4. Enter the code above: ${code}`);
                console.log('🔑 ========================================== 🔑\n');
            } catch (err) {
                console.error('❌ Failed to request pairing code, falling back to QR Code:', err.message);
                qrcodeTerminal.generate(qr, { small: true });
            }
        } else if (!phone) {
            console.log('\n📱 ========================================== 📱');
            console.log('  WHATSAPP WEB LOGIN REQUIRED FOR FREE BOOKING  ');
            console.log('  Scan the QR code below using your WhatsApp app:');
            console.log('  (Open WhatsApp > Linked Devices > Link a Device)');
            console.log('📱 ========================================== 📱\n');
            
            qrcodeTerminal.generate(qr, { small: true });
        }
    });

    // Event: Authentication successful
    clientInstance.on('authenticated', () => {
        console.log('✅ WhatsApp Web Client: Authentication Successful.');
    });

    // Event: Client is ready to send/receive messages
    clientInstance.on('ready', () => {
        console.log('🌟 WhatsApp Web Client is connected and READY for free booking! 🌟');
    });

    // Event: Incoming Message
    clientInstance.on('message', async (msg) => {
        try {
            // Ignore groups, newsletters, and broadcast channels (allows @c.us and @lid personal chats)
            if (msg.from.endsWith('@g.us') || msg.from.endsWith('@newsletter') || msg.from.endsWith('@broadcast')) {
                return;
            }

            console.log(`📥 WhatsApp Web Message from [${msg.from}]: "${msg.body || 'Media Attachment'}"`);

            let mediaUrl = null;
            let mediaContentType = null;

            // Handle voice notes / audio messages
            if (msg.hasMedia) {
                try {
                    const media = await msg.downloadMedia();
                    if (media && media.data) {
                        // Ensure uploads folder exists
                        const uploadsDir = path.join(__dirname, '../../uploads');
                        if (!fs.existsSync(uploadsDir)) {
                            fs.mkdirSync(uploadsDir, { recursive: true });
                        }

                        // Generate a safe unique filename
                        const ext = media.mimetype.split('/')[1] || 'ogg';
                        const filename = `wa_voice_${Date.now()}.${ext}`;
                        const filepath = path.join(uploadsDir, filename);

                        // Save media data
                        fs.writeFileSync(filepath, Buffer.from(media.data, 'base64'));

                        // Expose file link via local server uploads URL
                        const PORT = process.env.PORT || 3000;
                        mediaUrl = `http://localhost:${PORT}/uploads/${filename}`;
                        mediaContentType = media.mimetype;

                        console.log(`   - Saved voice note attachment to: ${filepath}`);
                        console.log(`   - Exposed Media URL: ${mediaUrl}`);
                    }
                } catch (mediaErr) {
                    console.error('❌ Failed to download WhatsApp media attachment:', mediaErr.message);
                }
            }

            // Extract pure phone digits (stripping suffix like @c.us) to match database query format
            const sanitizedPhone = msg.from.split('@')[0];

            // Mock Express req & res to interface directly with our existing controller logic
            const req = {
                body: {
                    From: `whatsapp:+${sanitizedPhone}`, // Format matching controller expectation
                    Body: msg.body || '',
                    MediaUrl0: mediaUrl,
                    MediaContentType0: mediaContentType
                }
            };

            const res = {
                set: () => {},
                send: (xmlResponse) => {
                    // Extract reply body content from TwiML XML markup
                    const match = xmlResponse.match(/<Message>([\s\S]*?)<\/Message>/);
                    if (match && match[1]) {
                        // Unescape XML entities for user output formatting
                        const cleanReply = match[1]
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&apos;/g, "'");

                        clientInstance.sendMessage(msg.from, cleanReply);
                        console.log(`📤 Dispatched booking reply to [${msg.from}] for FREE!`);
                    }
                }
            };

            // Process message details via voiceQueueController
            await handleIncomingWhatsAppMessage(req, res);

        } catch (error) {
            console.error('❌ Error handling message via WhatsApp Web Client:', error.message);
        }
    });

    // Event: Connection failure/re-auth needed
    clientInstance.on('auth_failure', (msg) => {
        console.error('❌ WhatsApp Web Client: Authentication failure:', msg);
    });

    clientInstance.on('disconnected', (reason) => {
        console.log('⚠️ WhatsApp Web Client disconnected. Reason:', reason);
    });

    // Start initialization
    clientInstance.initialize().catch((err) => {
        console.error('❌ Failed to initialize WhatsApp Client:', err.message);
    });
};

module.exports = { startWhatsAppClient };
