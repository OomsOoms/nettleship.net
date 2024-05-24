const nodemailer = require('nodemailer');

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
  console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
  const mailOptions = {
    //from: "", // If not set, it will be sent from the default email of the gmail account
    to: to,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email: ', error);
    } else {
      console.log('Email sent: ', info.response);
    }
  });
};
