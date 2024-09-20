const { User } = require('../../src/api/models');
const { verifyUser } = require('../../src/api/services/user.service');
const { Error } = require('../../src/api/helpers');
const { sendEmail } = require('../../src/api/helpers');

jest.mock('../../src/api/models/user.model', () => ({
    findById: jest.fn(),
}));

jest.mock('../../src/api/helpers/sendEmail', () => jest.fn());

it('should verify user and update email if token is valid and user exists', async () => {
    const mockedUser = {
        id: '123',
        email: 'old@example.com',
        username: 'test',
        newEmail: 'new@example.com',
        save: jest.fn(),
    };

    User.findById.mockResolvedValueOnce(mockedUser);

    await verifyUser('123');

    expect(User.findById).toHaveBeenCalledWith('123');
    expect(mockedUser.email).toBe('new@example.com');
    expect(mockedUser.newEmail).toBe(null);
    expect(mockedUser.save).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
        'old@example.com',
        'Email changed',
        'emailChanged',
        { username: 'test', email: 'new@example.com' }
    );
});

it('should throw an error if user is not found', async () => {
    User.findById.mockResolvedValueOnce(null);

    await expect(verifyUser('123')).rejects.toThrow('User not found or email already verified');
    expect(User.findById).toHaveBeenCalledWith('123');
});

it('should throw an error if user is already verified', async () => {
    const mockedUser = {
        id: '123',
        email: 'old@example.com',
        newEmail: null,
    };

    User.findById.mockResolvedValueOnce(mockedUser);

    await expect(verifyUser('123')).rejects.toThrow('User not found or email already verified');
    expect(User.findById).toHaveBeenCalledWith('123');
});
