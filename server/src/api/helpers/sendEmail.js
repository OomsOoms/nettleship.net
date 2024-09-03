const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const { logger } = require('../../config/logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const COMMON_DATA = {
  frontendDomain: process.env.FRONTEND_DOMAIN,
  backendDomain: process.env.BACKEND_DOMAIN,
  cdnDomain: process.env.CDN_DOMAIN,
};

async function sendEmail(to, subject, templateName, templateData) {
  try {
    const templatePath = path.join(__dirname, '../../views', `${templateName}.hbs`);

    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);
    const html = template({ ...COMMON_DATA, ...templateData });

    const mailOptions = {
      from: process.env.FROM_ADDRESS,
      to,
      subject: subject,
      html,
    };
    if (process.env.NODE_ENV === 'test') return;
    if (process.env.NODE_ENV === 'development') {
      logger.debug(
        `Email to ${to}, with the subject ${subject} and template ${templateName} and the data ${JSON.stringify(templateData)}`
      );
      return;
    }
    await transporter.sendMail(mailOptions);
    logger.debug(
      `Email sent to ${to}, with the subject ${subject} and template ${templateName} and the data ${JSON.stringify(templateData)}`
    );
  } catch (error) {
    logger.error(error);
  }
}

module.exports = sendEmail;
