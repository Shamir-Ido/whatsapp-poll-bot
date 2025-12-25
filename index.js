const { Client, LocalAuth, Poll } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// 1. Keep-alive Web Server
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(port, () => console.log(`Server listening on port ${port}`));

// 2. Initialize WhatsApp Client with headless fixes
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    // This will print the QR code in the Render "Logs" tab
    qrcode.generate(qr, { small: true });
    console.log('SCAN THIS QR CODE IN YOUR RENDER LOGS');
});

client.on('ready', () => {
    console.log('WhatsApp Bot is logged in and ready!');

    // SCHEDULE: Thursday at 08:00
    cron.schedule('0 8 * * 4', async () => {
        const chatId = 'YOUR_GROUP_ID@g.us'; // Make sure this is correct
        try {
            await client.sendMessage(chatId, new Poll('Weekly Poll Title', ['Option 1', 'Option 2']));
            console.log('Poll sent!');
        } catch (err) {
            console.error('Poll failed:', err);
        }
    });
});

client.initialize();
