require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendMail = async (email,subject,text) => {
    
    const mailOptions = {
        from: `"Talkie" <${process.env.EMAIL_FROM}>`,
        to:email,
        subject,
        text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, message: "Email sent successfully" };
    } catch (error) {
        return { success: false, error: error.message };
    }
};



module.exports = sendMail
