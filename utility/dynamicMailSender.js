const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const techDetails = {
    host: 'smtp.sendgrid.net',
    port: 465,
    secure: true,
    auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY
    }
};

const transporter = nodemailer.createTransport(techDetails);

async function emailSender(to, subject, html, text) {
    try {
        console.log(process.env.SENDER_EMAIL, "subject", subject, "text", text);

        let emailObject = {
            to: to,
            from: process.env.SENDER_EMAIL,
            subject: subject,
            text: text,
            html: html,
        };
        await transporter.sendMail(emailObject);
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
}

async function sendEmailHelper(otp, htmlTemplate, userName, to) {
    const nameUpdatedHtml = htmlTemplate.replace("#{user}", userName);
    const finalHTMLCode = nameUpdatedHtml.replace("#{OTP}", otp);
    const text = `Hi ${userName},\nYour OTP to reset your password is ${otp}`;
    const subject = "RESET PASSWORD Verification OTP";
    await emailSender(to, subject, finalHTMLCode, text);
}

module.exports = sendEmailHelper;
