const { User } = require('../../src/api/models');
const { requestVerification } = require('../../src/api/services/user.service');
const sendEmail = require('../../src/api/helpers/sendEmail');

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockImplementation(() => 'mockedToken'),
}));

jest.mock('../../src/api/models/user.model', () => ({
    findOne: jest.fn(),
}));

jest.mock('../../src/api/helpers/sendEmail', () => jest.fn());

describe('userService.requestVerification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should send an email with verification link if user exists and not verified', async () => {
        const mockedUser = { _id: '123', unverifiedEmail: 'test@example.com', accountVerified: false };
        User.findOne.mockResolvedValueOnce(mockedUser);
        const verificationLink = 'http://localhost:4000/api/users/verify?token=mockedToken';

        await requestVerification('test@example.com');

        expect(User.findOne).toHaveBeenCalledWith({ unverifiedEmail: 'test@example.com' });
        expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'Verify your email', verificationLink);
    });

    it('should throw an error if user not found', async () => {
        User.findOne.mockResolvedValueOnce(null);

        await expect(requestVerification('test@example.com')).rejects.toThrow('User not found');
    });

    it('should throw an error if user is already verified', async () => {
        const mockedUser = { _id: '123', email: 'test@example.com', accountVerified: true };
        User.findOne.mockResolvedValueOnce(mockedUser);
        
        await expect(requestVerification('test@example.com')).rejects.toThrow('User already verified');
    });
});
