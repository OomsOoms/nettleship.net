const { User } = require('../../src/api/models');
const { getAllUsers } = require('../../src/api/services/user.service');

jest.mock('../../src/api/models/user.model', () => ({
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

        const result = await getAllUsers('123');
        expect(result).toEqual([]);
        expect(User.findById).toHaveBeenCalledWith('123');
        expect(User.find).toHaveBeenCalled();
    });

    it('should throw an error if the user is not an admin', async () => {
        const mockUser = { _id: '123', roles: [] };
        User.findById.mockResolvedValue(mockUser);
        await expect(getAllUsers('123')).rejects.toThrow('User is not an admin');
    });
});
