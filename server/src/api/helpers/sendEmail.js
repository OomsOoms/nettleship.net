const nodemailer = require('nodemailer');

const { logger } = require('../../config/logger');

module.exports = function (to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.FROM_ADDRESS, // If not set, it will be sent from the default email of the gmail account
    to: to,
    subject: subject,
    text: text,
  };
  // If in development mode, do not send email
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Email sent: ', mailOptions);
  } else {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error('Error sending email: ', error);
      } else {
        logger.debug('Email sent: ', info.response);
        info.response;
      }
    });
  }
};
