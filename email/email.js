const nodemailer = require('nodemailer');
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const email = (to, subject, text, html) => {
    return new Promise((resolve, reject) => {
        try {
            let transporter = nodemailer.createTransport({
                host: 'mail.hover.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASS
                }
            });

            const source = fs.readFileSync(path.join(__dirname, html), "utf8");
            const compiledTemplate = handlebars.compile(source);

            let mailOptions = {
                from: `"PSLEOnline" <${process.env.EMAIL}>`,
                to: to,
                subject: subject,
                html: compiledTemplate(text)
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    throw error
                }
                else {
                    console.log('Message %s sent: %s', info.messageId, info.response);
                    resolve('Message %s sent: %s', info.messageId, info.response)
                }
            });
        }
        catch (err) {
            reject(err);
        }

    })
}


module.exports = email;