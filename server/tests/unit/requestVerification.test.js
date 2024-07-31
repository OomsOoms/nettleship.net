const jwt = require('jsonwebtoken');
const { User } = require('../../src/api/models');
const { userService } = require('../../src/api/services');

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockImplementation(() => 'mockedToken'),
}));

jest.mock('../../src/api/models/user.model.js', () => ({
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
}));

const sendEmail = require('../../src/api/helpers/sendEmail');

jest.mock('../../src/api/helpers/sendEmail', () => jest.fn());

describe('userService.requestVerification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset the mock implementation to return a controlled value
        jwt.sign.mockImplementation(() => 'mockedToken');
    });

    it('should throw an error if user not found or already verified', async () => {
        User.findOne.mockResolvedValueOnce(null);
        try {
            await userService.requestVerification('test@example.com');
        } catch (error) {
            expect(error.message).toBe('User not found');
        }
    });

    it('should throw an error if user is already verified', async () => {
        const user = { _id: '123', email: 'test@example.com', active: true };
        User.findOne.mockResolvedValueOnce(user);
        try {
            await userService.requestVerification('test@example.com')
        } catch (error) {
            expect(error.message).toBe('User already verified');
        }
    });

    it('should send an email with verification link if user exists and not verified', async () => {
        const user = { _id: '123', email: 'test@example.com', active: false };
        User.findOne.mockResolvedValueOnce(user);
        const verificationLink = 'http://localhost:4000/api/users/verify?token=mockedToken';

        await userService.requestVerification('test@example.com');

        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'Verify your email', verificationLink);
    });
});
