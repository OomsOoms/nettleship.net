const { User } = require('../../src/api/models');
const { getUserByUsername } = require('../../src/api/services/user.service');

jest.mock('../../src/api/models/user.model', () => ({
    findOne: jest.fn(),
}));

describe('userService.getUserByUsername', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully retrieve a user by username', async () => {
        const mockUser = { username: 'testUser', email: 'test@example.com' };
        User.findOne.mockResolvedValue(mockUser);

        const result = await getUserByUsername('testUser');
        expect(result).toEqual(mockUser);
        expect(User.findOne).toHaveBeenCalledWith({ username: 'testUser' });
    });

    it('should throw an error if the user does not exist', async () => {
        User.findOne.mockResolvedValue(null);

        await expect(getUserByUsername('testUser')).rejects.toThrow("User with username 'testUser' not found");
    });
});
