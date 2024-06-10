const crypto = require('crypto');

const { hashPassword, comparePasswords } = require('../passwordUtils');

const passwordLengths = [10, 100, 1000, 10000, 100000, 1000000];

describe('Performance of hashPassword function', () => {
    passwordLengths.forEach((passwordLength) => {
        test(`Performance for password of length ${passwordLength}`, async () => {
            const password = crypto.randomBytes(passwordLength).toString('hex');
            console.time(`hashPassword for length ${passwordLength}`);
            hashPassword(password);
            console.timeEnd(`hashPassword for length ${passwordLength}`);
        });
    });
});

describe('Performance of comparePasswords function', () => {
    passwordLengths.forEach((passwordLength) => {
        test(`Performance for passwords of length ${passwordLength}`, async () => {
            const password = crypto.randomBytes(passwordLength).toString('hex');
            const hashedPassword = await hashPassword(password);

            console.time(`comparePasswords for length ${passwordLength}`);
            comparePasswords(password, hashedPassword);
            console.timeEnd(`comparePasswords for length ${passwordLength}`);
        });
    });
});


