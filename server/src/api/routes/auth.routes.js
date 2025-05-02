const router = require('express-promise-router')();

const { authController: ac } = require('../controllers');
const { authValidationRules: avr } = require('../validations');

// /api/auth
router
    // status
    .get('/status', ac.getStatus)

    // auth
    .post('/login', ac.localLogin)
    .get('/google', ac.googleLogin)
    .get('/google/callback', ac.googleCallback)
    
    // logout
    .delete('/logout', ac.logout)
    .delete('/google', avr.unlinkGoogle, ac.unlinkGoogle)

    // reset password
    .post('/reset-password', avr.requestResetPassword, ac.requestResetPassword)
    .put('/reset-password', avr.resetPassword, ac.resetPassword);

module.exports = router;
