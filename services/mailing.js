const nodemailer = require("nodemailer");

/**
 * This function for sending email
 * @param {string} user_mail User email destination
 * @param {string} subject SUbject for use
 * @param {string} message Message for use
 */
const sendEmail = async (user_mail, subject, message) => {
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_SERVER,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USER, // generated ethereal user
            pass: process.env.MAIL_SECRET, // generated ethereal password
        },
    });

    let info = await transporter.sendMail({
        from: '"Smart Door Service" <no-replay@smartdoorservice.com>', // sender address
        to: user_mail, // list of receivers
        subject,
        html: message,
    });
};

module.exports = { sendEmail };