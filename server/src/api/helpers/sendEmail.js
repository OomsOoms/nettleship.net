const nodemailer = require('nodemailer');
const path = require('path');
const { logger } = require('../../config/logger');

require('dotenv').config();

async function sendEmail(to, template, data) {
    const hbs = await import('nodemailer-express-handlebars');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    transporter.use('compile', hbs.default({
        viewEngine: {
            extName: '.hbs',
            partialsDir: path.join(__dirname, 'templates'),
            defaultLayout: false,
        },
        viewPath: path.join(__dirname, '../../views'),
        extName: '.hbs',
    }));

    const subjects = {
        resetPassword: 'Reset Your Password',
        passwordChanged: 'Your Password Has Been Changed',
        emailChanged: 'Your Email Has Been Changed',
        verifyEmail: 'Verify Your Email',
        welcome: 'Welcome to Our App',
        welcomeVerifyEmail: 'Welcome to Our App - Verify Your Email',
    };

    const subject = subjects[template]
    if (!subject) return;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: subjects[template] || 'No Subject',
        template,
        context: data,
    };

    if (process.env.NODE_ENV !== 'production') {
        logger.debug(
            `DEVELOPMENT: Email to ${to} using template "${template}" and data ${JSON.stringify(data)} would be sent.`
        );
        return;
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            logger.debug(
                `PRODUCTION: Email sent to ${to} using template "${template}" and data ${JSON.stringify(data)}`
            );
        }
    });
}

module.exports = sendEmail;
