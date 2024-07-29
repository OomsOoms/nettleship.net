const { User } = require('../../src/api/models');
const { userService } = require('../../src/api/services');

jest.mock('../../src/api/models/User.model.js', () => ({
    findOne: jest.fn(),
}));

describe('userService.getUserByUsername', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully retrieve a user by username', async () => {
        const mockUser = { username: 'testUser', email: 'test@example.com' };
        User.findOne.mockResolvedValue(mockUser);

        const result = await userService.getUserByUsername('testUser');
        expect(result).toEqual(mockUser);
        expect(User.findOne).toHaveBeenCalledWith({ username: 'testUser' });
    });

    it('should throw an error if the user does not exist', async () => {
        User.findOne.mockResolvedValue(null);

        try {
            await userService.getUserByUsername('testUser');
        } catch (error) {
            expect(error.message).toBe("User with username 'testUser' not found");
        }
    });
});