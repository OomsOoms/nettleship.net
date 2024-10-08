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
        `DEVELOPMENT: Email to ${to} with subject "${subject}" using template "${templateName}" and data ${JSON.stringify(templateData)} would be sent.`
      );
      return;
    }
    await transporter.sendMail(mailOptions);
    logger.debug(
      `PRODUCTION: Email successfully sent to ${to} with subject "${subject}" using template "${templateName}".`
    );
  } catch (error) {
    logger.error(error);
  }
}

module.exports = sendEmail;
