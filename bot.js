// 🟢 ১. নতুন টিকিট তৈরি হলে টিমকে নোটিফিকেশন পাঠানোর API
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

        const message = `🚨 *নতুন টিকিট অ্যালার্ট (Work Team)*\n\n` +
                        `🆔 *টিকিট নম্বর:* #${ticket_id || 'N/A'}\n` +
                        `👤 *কাস্টমারের নাম:* ${name || 'N/A'}\n` +
                        `📝 *সমস্যা / বিষয়:* ${issue || 'N/A'}\n\n` +
                        `⚠️ দ্রুত সমস্যাটি সমাধান করার অনুরোধ করা হচ্ছে।`;

        await client.sendMessage(chatId, message);
        console.log(`Notification sent to ${formattedPhone}`);
        res.json({ status: 'success', message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// 🟢 ২. টিকিট ক্লোজ হলে টিমকে নোটিফিকেশন পাঠানোর API
app.post('/send-ticket-close-notification', async (req, res) => {
    const { phone, name, ticket_id } = req.body;

    if (!phone) {
        return res.status(400).json({ status: 'error', message: 'Phone number is required' });
    }

    try {
        let formattedPhone = phone.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('01')) {
            formattedPhone = '88' + formattedPhone;
        }
        const chatId = `${formattedPhone}@c.us`;

        const message = `🎉 *টিকিট সমাধান সম্পূর্ণ হয়েছে (Work Team)*\n\n` +
                        `🆔 *টিকিট নম্বর:* #${ticket_id || 'N/A'}\n` +
                        `👤 *কাস্টমারের নাম:* ${name || 'N/A'}\n\n` +
                        `✅ এই টিকিটের কাজ সফলভাবে ক্লোজ করা হয়েছে।`;

        await client.sendMessage(chatId, message);
        console.log(`Close Notification sent to ${formattedPhone}`);
        res.json({ status: 'success', message: 'Close Message sent successfully' });
    } catch (error) {
        console.error('Error sending close message:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});
