const { User } = require('../../src/api/models');
const { verifyUser } = require('../../src/api/services/user.service');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
    decode: jest.fn(),
}));

jest.mock('../../src/api/models/user.model', () => ({
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn(),
}));

describe('userService.verifyUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('successfully verifies a user with a valid token', async () => {
        const token = 'validToken';
        const userId = '123';
        const mockedUser = { id: userId, accountVerified: false };

        jwt.decode.mockReturnValue(mockedUser);
        User.findById.mockResolvedValue(mockedUser);
        User.findByIdAndUpdate.mockResolvedValue({ ...mockedUser, accountVerified: true });

        const result = await verifyUser(token);

        expect(jwt.decode).toHaveBeenCalledWith(token);
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
            $set: { accountVerified: true, unverifiedEmail: '', email: mockedUser.unverifiedEmail } }, { new: true });
        expect(result).toEqual({ ...mockedUser, accountVerified: true });
    });

    it('throws an error for an invalid token', async () => {
        const token = 'invalidToken';

        jwt.decode.mockReturnValue(null);

        await expect(verifyUser(token)).rejects.toThrow('Invalid token');
    });

    it('throws an error when no token is provided', async () => {
        const token = null;

        jwt.decode.mockReturnValue(null);

        await expect(verifyUser(token)).rejects.toThrow('Invalid token');
    });

    it('throws an error for a non-existent user', async () => {
        const token = 'validTokenForNonExistentUser';
        const userId = '999'; // Assuming this user does not exist

        jwt.decode.mockReturnValue({ id: userId });
        User.findById.mockResolvedValue(null);

        await expect(verifyUser(token)).rejects.toThrow('User not found');
    });

    it('does not change the status of an already verified user', async () => {
        const token = 'validTokenForVerifiedUser';
        const mockedUser = { id: '123', name: 'Test User', accountVerified: true };

        jwt.decode.mockReturnValue(mockedUser);
        User.findById.mockResolvedValue(mockedUser);
        User.findByIdAndUpdate.mockResolvedValue(mockedUser); // User remains unchanged

        await expect(verifyUser(token)).rejects.toThrow('User already verified');
    });
});
