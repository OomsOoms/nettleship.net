const { verify } = require('hcaptcha');
const { Error } = require('../helpers');

const HCAPTCHA_SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY;

const verifyCaptcha = async (req, res, next) => {
    const token = req.body.hCaptchaToken;

    verify(HCAPTCHA_SECRET_KEY, token).then((data) => {
        if (data.success === true) {
            next();
        } else {
            // In development the test key is used so the captcha will always pass https://docs.hcaptcha.com/#integration-testing-test-keys
            next(Error.invalidCredentials('Invalid captcha token'));
        }
    });
};

module.exports = verifyCaptcha;
