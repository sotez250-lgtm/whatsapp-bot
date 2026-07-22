const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const bodyParser = require('body-parser');
const QRCode = require('qrcode'); // ছবির মতো QR দেখানোর জন্য

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let latestQR = '';

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
    console.log('⚡ নতুন QR Code তৈরি হয়েছে! /qr লিংকে গিয়ে স্ক্যান করুন।');
    latestQR = qr;
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot প্রস্তুত এবং কানেক্টেড আছে!');
    latestQR = ''; // কানেক্ট হয়ে গেলে QR মুছে যাবে
});

// ব্রাউজারে সুন্দর QR Code দেখানোর জন্য রাউট
app.get('/qr', async (req, res) => {
    if (!latestQR) {
        return res.send(`
            <div style="text-align:center; padding-top:50px; font-family:sans-serif;">
                <h2>✅ বোট ইতিমধ্যে কানেক্টেড আছে অথবা QR তৈরি হয়নি!</h2>
                <p>নতুন QR দেখতে চাইলে বোট রিস্টার্ট দিন বা কিছুক্ষণ অপেক্ষা করুন।</p>
            </div>
        `);
    }

    try {
        const qrImage = await QRCode.toDataURL(latestQR);
        res.send(`
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background-color: #f4f6f8;">
                <h2>📱 WhatsApp QR Code</h2>
                <p>হোয়াটসঅ্যাপ থেকে <b>Linked Devices</b> এ গিয়ে এটি স্ক্যান করুন</p>
                <img src="${qrImage}" alt="WhatsApp QR Code" style="border: 10px solid white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 300px; height: 300px;"/>
            </div>
        `);
    } catch (err) {
        res.status(500).send('Error generating QR Code image');
    }
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

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Node.js WhatsApp Bot listening on port ${port}`);
});
