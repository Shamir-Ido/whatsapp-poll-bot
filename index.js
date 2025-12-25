const { Client, LocalAuth, Poll } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const qrImage = require('qr-image'); // New tool
const fs = require('fs');
const cron = require('node-cron');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// 1. A page to view the QR code image
app.get('/qr', (req, res) => {
    if (fs.existsSync('qr.png')) {
        res.sendFile(__dirname + '/qr.png');
    } else {
        res.send('QR code not generated yet. Please wait or check logs.');
    }
});

app.get('/', (req, res) => res.send('Bot is running! View QR at /qr'));

app.listen(port, () => console.log(`Server listening on port ${port}`));

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    // Generate the image file
    const code = qrImage.image(qr, { type: 'png' });
    code.pipe(fs.createWriteStream('qr.png'));
    
    // Still print it in logs just in case
    qrcode.generate(qr, { small: true });
    console.log('QR Received! View it at: https://whatsapp-poll-bot.onrender.com/qr');
});

client.on('ready', async () => {
    console.log('WhatsApp Bot is logged in!');

    // LOG GROUP IDs: This helps you find the right group
    const chats = await client.getChats();
    const groups = chats.filter(chat => chat.isGroup);
    console.log("--- YOUR GROUPS ---");
    groups.forEach(g => console.log(`Name: ${g.name} | ID: ${g.id._serialized}`));

    // SCHEDULE: Thursday at 08:00
    cron.schedule('0 8 * * 4', async () => {
        const chatId = 'FEUcUIHjJj32cALByDJ9EU@g.us'; 
        try {
            await client.sendMessage(chatId, new Poll('Weekly Poll', ['Yes', 'No']));
            console.log('Poll sent!');
        } catch (err) {
            console.error('Failed to send:', err);
        }
    });
});

client.initialize();
