const nodemailer = require('nodemailer');

const email = (to, subject, text, html) => {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS
            }
        });

        let mailOptions = {
            from: `"PSLEOnline" <${process.env.EMAIL}>`,
            to: to,
            subject: subject,
            text: text,
            html: html
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                reject();
            }
            else {
                console.log('Message %s sent: %s', info.messageId, info.response);
                resolve('Message %s sent: %s', info.messageId, info.response)
            }
        });
    })
}


module.exports = email;