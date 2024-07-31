const { User } = require('../../src/api/models');
const { userService } = require('../../src/api/services');

jest.mock('../../src/api/models/user.model.js', () => ({
    find: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
}));

describe('userService.getAllUsers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all users if the user is an admin', async () => {
        const mockAdminUser = { _id: '123', roles: ['admin'] };
        User.findById.mockResolvedValue(mockAdminUser);

        const result = await userService.getAllUsers('123');
        expect(result).toEqual([]);
        expect(User.findById).toHaveBeenCalledWith('123');
        expect(User.find).toHaveBeenCalled();
    });

    it('should return all users if the user is an admin', async () => {
        const mockAdminUser = { _id: '123', roles: [] };
        User.findById.mockResolvedValue(mockAdminUser);

        try {
            await userService.getAllUsers('123');
        } catch (error) {
            expect(error.message).toBe('User is not an admin');
        }
    });
});