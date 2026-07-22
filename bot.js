const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('--- QR CODE ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot প্রস্তুত এবং কানেক্টেড আছে!');
});

app.post('/send-ticket-notification', async (req, res) => {
    const { phone, name, ticket_id, issue } = req.body;

    if (!phone) {
        return res.status(400).json({ status: 'error', message: 'Phone number is required' });
    }

    try {
        let formattedPhone = phone.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('01')) {
            formattedPhone = '88' + formattedPhone;
        }
        const chatId = `${formattedPhone}@c.us`;

        const message = `🎟️ *নতুন সাপোর্ট টিকিট*\n\n` +
                        `👤 নাম: ${name || 'N/A'}\n` +
                        `🔢 টিকিট আইডি: #${ticket_id || 'N/A'}\n` +
                        `📝 সমস্যা: ${issue || 'N/A'}\n\n` +
                        `আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করবে।`;

        await client.sendMessage(chatId, message);
        console.log(`Notification sent to ${formattedPhone}`);
        res.json({ status: 'success', message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('WhatsApp Bot is running!');
});

client.initialize();

app.listen(port, () => {
    console.log(`🚀 Node.js WhatsApp Bot listening on port ${port}`);
});

client.initialize();

app.listen(port, () => {
    console.log(`🚀 Node.js WhatsApp Bot listening on port ${port}`);
});
