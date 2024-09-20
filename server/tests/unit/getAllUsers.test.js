const { User } = require('../../src/api/models');
const { getAllUsers } = require('../../src/api/services/user.service');

jest.mock('../../src/api/models/user.model', () => ({
    find: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

it('should return all users if the user is an admin', async () => {
    expect(await getAllUsers()).toEqual([]);
    expect(User.find).toHaveBeenCalled();
});

