const {
    handleLocalStrategy,
    handleGoogleStrategy,
    unlinkGoogle,
    requestResetPassword,
    resetPassword,
    deserializeUser,
} = require('../auth.service');
const { User } = require('../../models');
const { Error } = require('../../helpers');

jest.mock('../../models');
jest.mock('../../helpers');

Error.invalidRequest = jest.fn().mockImplementation((message) => {
    const error = new Error(message);
    error.name = 'InvalidRequestError';
    throw error;
});

describe('handleLocalStrategy', () => {
    let username, password, done;

    beforeEach(() => {
        username = 'testuser';
        password = 'password123';
        done = jest.fn();
    });

    it('should return the user if the username and password are correct', async () => {
        const user = {
            username: 'testuser',
            verifyPassword: jest.fn().mockResolvedValue(true)
        };
        User.findOne.mockResolvedValue(user);

        await handleLocalStrategy(username, password, done);

        expect(User.findOne).toHaveBeenCalledWith({ username });
        expect(user.verifyPassword).toHaveBeenCalledWith(password);
        expect(done).toHaveBeenCalledWith(null, user);
    });

    it('should return false if the user is not found', async () => {
        User.findOne.mockResolvedValue(null);

        await handleLocalStrategy(username, password, done);

        expect(User.findOne).toHaveBeenCalledWith({ username });
        expect(done).toHaveBeenCalledWith(null, false);
    });

    it('should return false if the password is incorrect', async () => {
        const user = {
            username: 'testuser',
            verifyPassword: jest.fn().mockResolvedValue(false)
        };
        User.findOne.mockResolvedValue(user);

        await handleLocalStrategy(username, password, done);

        expect(User.findOne).toHaveBeenCalledWith({ username });
        expect(user.verifyPassword).toHaveBeenCalledWith(password);
        expect(done).toHaveBeenCalledWith(null, false);
    });

    it('should handle errors', async () => {
        const error = new Error('Test error');
        User.findOne.mockRejectedValue(error);

        await handleLocalStrategy(username, password, done);

        expect(done).toHaveBeenCalledWith(error);
    });
});

describe('handleGoogleStrategy', () => {
    let req, accessToken, refreshToken, profile, cb;

    beforeEach(() => {
        req = { isAuthenticated: jest.fn() };
        accessToken = 'accessToken';
        refreshToken = 'refreshToken';
        profile = {
            id: 'googleId',
            email: 'test@example.com',
            displayName: 'Test User',
            picture: 'http://example.com/avatar.jpg'
        };
        cb = jest.fn();
    });

    it('should log the user into the account linked to the google account if it exists', async () => {
        User.findOne.mockResolvedValue({ id: 'existingUserId' });

        await handleGoogleStrategy(req, accessToken, refreshToken, profile, cb);

        expect(User.findOne).toHaveBeenCalledWith({ 'google.id': profile.id });
        expect(cb).toHaveBeenCalledWith(null, { id: 'existingUserId' });
    });

    it('should link the google account to the user\'s account if the user is authenticated', async () => {
        req.isAuthenticated.mockReturnValue(true);
        req.user = { save: jest.fn() };
        User.findOne.mockResolvedValue(null);
        
        await handleGoogleStrategy(req, accessToken, refreshToken, profile, cb);
        
        expect(req.user.google).toEqual({
            id: profile.id,
            email: profile.email,
        });

        expect(req.user.save).toHaveBeenCalled();
        expect(cb).toHaveBeenCalledWith(null, req.user);
    });

    it('should create a new user if the user is not authenticated and no existing user is found', async () => {
        req.isAuthenticated.mockReturnValue(false);
        User.findOne.mockResolvedValue(null);
        User.prototype.save = jest.fn().mockResolvedValue();

        await handleGoogleStrategy(req, accessToken, refreshToken, profile, cb);

        expect(User.findOne).toHaveBeenCalledWith({ 'google.id': profile.id });
        expect(User.findOne).toHaveBeenCalledWith({ username: 'test' });
        expect(User.prototype.save).toHaveBeenCalled();
        expect(cb).toHaveBeenCalledWith(null, expect.any(User));
    });

    it('should handle errors', async () => {
        const error = new Error('Test error');
        User.findOne.mockRejectedValue(error);

        await handleGoogleStrategy(req, accessToken, refreshToken, profile, cb);

        expect(cb).toHaveBeenCalledWith(error);
    });
});

describe('unlinkGoogle', () => {
    let user;

    beforeEach(() => {
        user = {
            google: { id: 'googleId', email: 'test@example.com' },
            local: { password: 'hashedPassword' },
            save: jest.fn().mockResolvedValue(),
        };
    });

    it('should throw an error if the user is not linked to a google account', async () => {
        user.google = null;

        await expect(unlinkGoogle(user)).rejects.toThrow('Google account not linked');
    });

    it('should send a password reset email if the user does not have a local account', async () => {
        user.local.password = null;
        const requestResetPasswordMock = jest.spyOn(require('../helpers'), 'requestResetPassword').mockResolvedValue();

        const result = await unlinkGoogle(user);

        expect(requestResetPasswordMock).toHaveBeenCalledWith(user.google.email);
        expect(user.local.email).toBe(user.google.email);
        expect(user.google.id).toBeNull();
        expect(user.google.email).toBeNull();
        expect(user.save).toHaveBeenCalled();
        expect(result).toBe('Google account unlinked, password reset email sent');
    });

    it('should unlink the google account if the user has a local account', async () => {
        const result = await unlinkGoogle(user);

        expect(user.google.id).toBeNull();
        expect(user.google.email).toBeNull();
        expect(user.save).toHaveBeenCalled();
        expect(result).toBe('Google account unlinked');
    });
});

describe('requestResetPassword', () => {
    let email;

    beforeEach(() => {
        email = 'test@example.com';
    });

    it('should send a password reset email if the user exists', async () => {
        const user = { id: 'userId' };
        User.findOne.mockResolvedValue(user);
        Token.create.mockResolvedValue();
        const sendEmailMock = jest.spyOn(require('../helpers'), 'sendEmail').mockResolvedValue();
        const jwtSignMock = jest.spyOn(require('jsonwebtoken'), 'sign').mockReturnValue('token');

        const result = await requestResetPassword(email);

        expect(User.findOne).toHaveBeenCalledWith({ $or: [{ 'local.email': email }, { 'local.newEmail': email }] });
        expect(Token.create).toHaveBeenCalledWith({ jti: expect.any(String), userId: user.id });
        expect(jwtSignMock).toHaveBeenCalledWith({ userId: user.id, jti: expect.any(String) }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        expect(sendEmailMock).toHaveBeenCalledWith(email, 'Password Reset', 'resetPassword', { link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=token` });
        expect(result).toBe('Password reset email sent');
    });

    it('should return a generic message if the user does not exist', async () => {
        User.findOne.mockResolvedValue(null);

        const result = await requestResetPassword(email);

        expect(User.findOne).toHaveBeenCalledWith({ $or: [{ 'local.email': email }, { 'local.newEmail': email }] });
        expect(result).toBe('Password reset email sent');
    });
});

describe('resetPassword', () => {
    let token, password;

    beforeEach(() => {
        token = 'token';
        password = 'newPassword';
    });

    it('should reset the password if the token is valid', async () => {
        const decoded = { userId: 'userId', jti: 'jti' };
        const user = { local: { password: '' }, save: jest.fn().mockResolvedValue() };
        jwt.verify = jest.fn().mockReturnValue(decoded);
        Token.findOne.mockResolvedValue({ jti: decoded.jti });
        Token.deleteOne.mockResolvedValue();
        User.findById.mockResolvedValue(user);

        await resetPassword(token, password);

        expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET_KEY);
        expect(Token.findOne).toHaveBeenCalledWith({ jti: decoded.jti });
        expect(Token.deleteOne).toHaveBeenCalledWith({ jti: decoded.jti });
        expect(User.findById).toHaveBeenCalledWith(decoded.userId);
        expect(user.local.password).toBe(password);
        expect(user.save).toHaveBeenCalled();
    });

    it('should throw an error if the token is invalid', async () => {
        jwt.verify = jest.fn().mockImplementation(() => { throw new Error('Invalid token'); });

        await expect(resetPassword(token, password)).rejects.toThrow('Invalid token');
    });

    it('should throw an error if the token does not exist', async () => {
        const decoded = { userId: 'userId', jti: 'jti' };
        jwt.verify = jest.fn().mockReturnValue(decoded);
        Token.findOne.mockResolvedValue(null);

        await expect(resetPassword(token, password)).rejects.toThrow('Invalid token');
    });
});

describe('deserializeUser', () => {
    it('should return the user if found', async () => {
        const serializedUser = { id: 'userId' };
        const user = { id: 'userId', username: 'test' };
        User.findById.mockResolvedValue(user);

        const result = await deserializeUser(serializedUser);

        expect(User.findById).toHaveBeenCalledWith(serializedUser.id);
        expect(result).toBe(user);
    });

    it('should return an error if the user is not found', async () => {     refreshToken = 'refreshToken';
        profile = {
            id: 'googleId',
            email: 'test@example.com',
            displayName: 'Test User',
            picture: 'http://example.com/avatar.jpg'
        };
        cb = jest.fn();
    });

    it('should log the user into the account linked to the google account if it exists', async () => {
        User.findOne.mockResolvedValue({ id: 'existingUserId' });

        await handleGoogleStrategy(req, accessToken, refreshToken, profile, cb);

        expect(User.findOne).toHaveBeenCalledWith({ 'google.id': profile.id });
        expect(cb).toHaveBeenCalledWith(null, { id: 'existingUserId' });
    });

    it('should link the google account to the user\'s account if the user is authenticated', async () => {
        req.isAuthenticated.mockReturnValue(true);
        req.user = { save: jest.fn() };
        User.findOne.mockResolvedValue(null);
        
        await handleGoogleStrategy(req, accessToken, refreshToken, profile, cb);
        
        expect(req.user.google).toEqual({
            id: profile.id,
            email: profile.email,
        });

        expect(req.user.save).toHaveBeenCalled();
        expect(cb).toHaveBeenCalledWith(null, req.user);
    });

    it('should create a new user if the user is not authenticated and no existing user is found', async () => {
        req.isAuthenticated.mockReturnValue(false);
        User.findOne.mockResolvedValue(null);
        User.prototype.save = jest.fn().mockResolvedValue();

        await handleGoogleStrategy(req, accessToken, refreshToken, profile, cb);

        expect(User.findOne).toHaveBeenCalledWith({ 'google.id': profile.id });
        expect(User.findOne).toHaveBeenCalledWith({ username: 'test' });
        expect(User.prototype.save).toHaveBeenCalled();
        expect(cb).toHaveBeenCalledWith(null, expect.any(User));
    });

    it('should handle errors', async () => {
        const error = new Error('Test error');
        User.findOne.mockRejectedValue(error);

        await handleGoogleStrategy(req, accessToken, refreshToken, profile, cb);

        expect(cb).toHaveBeenCalledWith(error);
    });
});
