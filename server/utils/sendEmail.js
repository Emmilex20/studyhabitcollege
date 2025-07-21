// server/utils/sendEmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT, 10),
            // 'secure' should be true if port is 465 (SSL/TLS), false for 2525/587 (STARTTLS)
            secure: process.env.EMAIL_PORT === '465',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: `StudyHabit College <${process.env.EMAIL_FROM}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            // html: options.html, // Uncomment if you want to send HTML emails
        };

        await transporter.sendMail(mailOptions);
        console.log(`[sendEmail] Email sent successfully to ${options.email} (captured by Mailtrap).`);
    } catch (error) {
        console.error(`[sendEmail] Failed to send email to ${options.email}:`, error);
    }
};

export default sendEmail;