// bot.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// WhatsApp Client Initialize (LocalAuth দিয়ে সেশন সেভ থাকবে)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
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

// Logs-এ QR Code দেখাবে (Render-এ স্ক্যান করার জন্য)
client.on('qr', (qr) => {
    console.log('নিচের QR Code টি আপনার WhatsApp অ্যাপ দিয়ে স্ক্যান করুন:');
    qrcode.generate(qr, { small: true });
});

// WhatsApp কানেক্ট হলে
client.on('ready', () => {
    console.log('✅ WhatsApp Bot প্রস্তুত এবং কানেক্টেড আছে!');
});

// PHP থেকে রিকোয়েস্ট পাওয়ার জন্য API Endpoint
app.post('/send-ticket-notification', async (req, res) => {
    const { numbers, group_id, message } = req.body;

    try {
        // ১. যদি হোয়াটসঅ্যাপ গ্রুপে পাঠাতে চান
        if (group_id && group_id.trim() !== "") {
            await client.sendMessage(group_id, message);
            console.log(`[Group Sent] Message sent to group: ${group_id}`);
        }

        // ২. যদি একাধিক নম্বরে পাঠাতে চান (Array of numbers)
        if (numbers && Array.isArray(numbers)) {
            for (let number of numbers) {
                let formattedNumber = number.replace(/[^0-9]/g, '');
                if (formattedNumber.length === 11 && formattedNumber.startsWith('01')) {
                    formattedNumber = '88' . formattedNumber;
                }
                const chatId = formattedNumber + '@c.us';
                await client.sendMessage(chatId, message);
                console.log(`[Direct Sent] Message sent to: ${formattedNumber}`);
            }
        }

        res.status(200).json({ status: 'success', message: 'WhatsApp message sent successfully!' });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Render-এর দেওয়া PORT অনুযায়ী সার্ভার চালু করা
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Node.js WhatsApp Bot listening on port ${PORT}`);
});

client.initialize();
