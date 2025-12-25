const { Client, LocalAuth, Poll } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const express = require('express');
const qrImage = require('qr-image');
const fs = require('fs');

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
    // This saves the QR code as a file named "qr.png" in your project folder
    const code = qrImage.image(qr, { type: 'png' });
    code.pipe(fs.createWriteStream('qr.png'));
    
    console.log('QR Code received! Visit your-app-url.onrender.com/qr to see it.');
});

// Add this route to your Express server section
app.get('/qr', (req, res) => {
    res.sendFile(__dirname + '/qr.png');
});

client.on('ready', () => {
    console.log('WhatsApp Bot is logged in and ready!');

    // SCHEDULE: Thursday at 08:00
    cron.schedule('0 8 * * 4', async () => {
        const chatId = 'FEUcUIHjJj32cALByDJ9EU@g.us'; // Make sure this is correct
        try {
            await client.sendMessage(chatId, new Poll('Weekly Poll Title', ['Option 1', 'Option 2']));
            console.log('Poll sent!');
        } catch (err) {
            console.error('Poll failed:', err);
        }
    });
});

client.initialize();
