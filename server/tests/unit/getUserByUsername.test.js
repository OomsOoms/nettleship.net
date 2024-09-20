const { User } = require('../../src/api/models');
const { getUserByUsername } = require('../../src/api/services/user.service');

jest.mock('../../src/api/models/user.model', () => ({
    findOne: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

it('should return the full user object if the requesting user is the same as the found user', async () => {
    const mockUser = { id: '123', username: 'testuser', profile: { roles: ['user'] } };
    User.findOne.mockResolvedValue(mockUser);

    const result = await getUserByUsername('123', 'testuser');

    expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
    expect(result).toEqual(mockUser);
});

it('should return a partial user object if the requesting user is different from the found user', async () => {
    const mockUser = { id: '123', username: 'testuser', profile: { roles: ['user'] } };
    User.findOne.mockResolvedValue(mockUser);

    const result = await getUserByUsername('456', 'testuser');

    expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
    expect(result).toEqual({ username: 'testuser', profile: mockUser.profile });
});

it('should throw an error if the user is not found', async () => {
    User.findOne.mockResolvedValue(null);

    await expect(getUserByUsername('123', 'nonexistentuser')).rejects.toThrow("User with username 'nonexistentuser' not found");
});
