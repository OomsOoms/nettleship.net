const User = require('../../src/api/models/user.model');
const { registerUser } = require('../../src/api/services/user.service');
const { Error, generateJwt, sendEmail } = require('../../src/api/helpers');

jest.mock('../../src/api/models/user.model');
jest.mock('../../src/api/helpers/generateJwt', () => jest.fn());
jest.mock('../../src/api/helpers/sendEmail', () => jest.fn());

beforeEach(() => {
    jest.clearAllMocks();
});

it('should register a new user', async () => {
    User.findOne.mockResolvedValue(null);
    User.prototype.save = jest.fn().mockResolvedValue({});
    generateJwt.mockReturnValue('mockToken');

    await registerUser('newuser', 'newuser@test.com', 'password');

    expect(User.prototype.save).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith('newuser@test.com', 'Verify your email', 'verifyEmail', { username: 'newuser', token: 'mockToken' });
});

it('should throw an error if the email already exists', async () => {
    const mockError = new Error();
    mockError.code = 11000;
    mockError.keyPattern = { email: 1 };
    User.prototype.save.mockRejectedValue(mockError);

    await expect(registerUser('newuser', 'existingemail@test.com', 'password')).rejects.toThrow('Email already exists');
});

it('should throw an error if the username already exists', async () => {
    const mockError = new Error();
    mockError.code = 11000;
    mockError.keyPattern = { username: 1 };
    User.prototype.save.mockRejectedValue(mockError);

    await expect(registerUser('existinguser', 'newemail@test.com', 'password')).rejects.toThrow('Username already exists');
});
