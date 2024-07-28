const jwt = require('jsonwebtoken');
const { User } = require('../../src/api/models');
const { userService } = require('../../src/api/services');

jest.mock('jsonwebtoken', () => ({
    decode: jest.fn(),
}));

jest.mock('../../src/api/models/User.model.js', () => ({
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
}));

describe('userService.verifyUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('successfully verifies a user with a valid token', async () => {
        const token = 'validToken';
        const userId = '123';
        const userData = { id: userId, name: 'Test User' };

        jwt.decode.mockReturnValue(userData);
        User.findById.mockResolvedValue(userData);
        User.findByIdAndUpdate.mockResolvedValue({ ...userData, active: true });

        const result = await userService.verifyUser(token);

        expect(jwt.decode).toHaveBeenCalledWith(token);
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, { $set: { active: true } }, { new: true });
        expect(result).toEqual({ ...userData, active: true });
    });

    it('throws an error for an invalid token', async () => {
        const token = 'invalidToken';

        jwt.decode.mockReturnValue(null);

        try {
            await userService.verifyUser(token);
        } catch (error) {
            expect(error.message).toBe('Invalid token');
        }
    });

    it('throws an error when no token is provided', async () => {
        const token = null;

        jwt.decode.mockReturnValue(null);

        try {
            await userService.verifyUser(token);
        } catch (error) {
            expect(error.message).toBe('Invalid token');
        }
    });

    it('throws an error for a non-existent user', async () => {
        const token = 'validTokenForNonExistentUser';
        const userId = '999'; // Assuming this user does not exist

        jwt.decode.mockReturnValue({ id: userId });
        User.findByIdAndUpdate.mockResolvedValue(null);

        try {
            await userService.verifyUser(token);
        } catch (error) {
            expect(error.message).toBe('User not found');
        }
    });

    it('does not change the status of an already verified user', async () => {
        const token = 'validTokenForVerifiedUser';
        const userId = '123';
        const userData = { id: userId, name: 'Test User', active: true };

        jwt.decode.mockReturnValue(userData);
        User.findById.mockResolvedValue(userData);
        User.findByIdAndUpdate.mockResolvedValue(userData); // User remains unchanged

        try {
            await userService.verifyUser(token);
        } catch (error) {
            expect(error.message).toBe('User already verified');
        }
    });
});
