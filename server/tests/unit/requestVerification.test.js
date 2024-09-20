const { User } = require('../../src/api/models');
const { requestVerification } = require('../../src/api/services/user.service');
const sendEmail = require('../../src/api/helpers/sendEmail');
const generateJwt = require('../../src/api/helpers/generateJwt');

jest.mock('../../src/api/models/user.model', () => ({
    findOne: jest.fn(),
}));

jest.mock('../../src/api/helpers/sendEmail', () => jest.fn());

jest.mock('../../src/api/helpers/generateJwt', () => jest.fn());

beforeEach(() => {
    jest.clearAllMocks();
});

it('should send an email with verification link if user exists and not verified', async () => {
    const mockedUser = { _id: '123', username: 'testuser', newEmail: 'test@example.com', id: '123' };
    User.findOne.mockResolvedValueOnce(mockedUser);
    generateJwt.mockReturnValueOnce('mockedToken');

    await requestVerification('test@example.com');

    expect(User.findOne).toHaveBeenCalledWith({ newEmail: 'test@example.com' });
    expect(generateJwt).toHaveBeenCalledWith({ id: mockedUser.id }, { expiresIn: '24h' });
    expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'Verify your email', 'verifyEmail', { username: mockedUser.username, token: 'mockedToken' });
});

it('should throw an error if user not found', async () => {
    User.findOne.mockResolvedValueOnce(null);

    await expect(requestVerification('test@example.com')).rejects.toThrow('User not found or email already verified');
});

it('should throw an error if user is already verified', async () => {
    const mockedUser = { _id: '123', username: 'testuser', newEmail: '' };
    User.findOne.mockResolvedValueOnce(mockedUser);

    await expect(requestVerification('test@example.com')).rejects.toThrow('User not found or email already verified');
});
