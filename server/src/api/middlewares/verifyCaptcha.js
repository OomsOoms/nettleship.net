const { verify } = require('hcaptcha');

const HCAPTCHA_SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY;

const verifyCaptcha = async (req, res, next) => {
  const token = req.body.hCaptchaToken;

  verify(HCAPTCHA_SECRET_KEY, token)
    .then((data) => {
      if (data.success === true) {
        next();
      } else {
        console.log(process.env.NODE_ENV);
        if (process.env.NODE_ENV === 'development') {
          next(); // Skip captcha verification in development
        } else {
          res.status(400).json({ message: 'Captcha verification failed' });
        }
      }
    })
    .catch(console.error);
};

module.exports = verifyCaptcha;
