const Error = require('./customError');
const sendEmail = require('./sendEmail');

module.exports = {
    Error,
    sendEmail,
    ...require('./fileUpload'),
};
