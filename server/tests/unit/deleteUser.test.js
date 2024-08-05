const { User } = require('../../src/api/models');
const { deleteUser } = require('../../src/api/services/user.service');
const { comparePasswords } = require('../../src/api/helpers/passwordUtils');

jest.mock('../../src/api/models/user.model', () => ({
    findById: jest.fn(),
    deleteOne: jest.fn(),
}));

jest.mock('../../src/api/helpers/passwordUtils', () => ({
    comparePasswords: jest.fn(),
}));

describe('userService.deleteUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should delete the user if the password is correct', async () => {
        const mockUser = { _id: '123', password: 'password' };
        User.findById.mockResolvedValue(mockUser);
        comparePasswords.mockResolvedValue(true);

        await deleteUser('123', 'password');
        expect(User.findById).toHaveBeenCalledWith('123');
        expect(User.deleteOne).toHaveBeenCalledWith({ _id: '123' });
    });

    it('should throw an error if the user is not found', async () => {
        User.findById.mockResolvedValue(null);
        await expect(deleteUser('123', 'password')).rejects.toThrow('User not found');
    });

    it('should throw an error if the password is incorrect', async () => {
        const mockUser = { _id: '123', password: 'password' };
        User.findById.mockResolvedValue(mockUser);
        comparePasswords.mockResolvedValue(false);
        await expect(deleteUser('123', 'wrongpassword')).rejects.toThrow('Invalid password');
    });
});
