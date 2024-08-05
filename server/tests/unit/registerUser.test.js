const User = require('../../src/api/models/user.model');
const { registerUser } = require('../../src/api/services/user.service');
const { generateJwt, sendEmail } = require('../../src/api/helpers');

jest.mock('../../src/api/models/user.model');

jest.mock('../../src/api/helpers/decodeJwt', () => jest.fn());
jest.mock('../../src/api/helpers/generateJwt', () => jest.fn());
jest.mock('../../src/api/helpers/sendEmail', () => jest.fn());


describe('userService.registerUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user', async () => {
        User.findOne.mockResolvedValue(null);

        await registerUser('newuser', 'newuser@test.com', 'password');
        expect(User.findOne).toHaveBeenCalledWith({ $or: [{ email: 'newuser@test.com' }, { username: 'newuser' }] });
        expect(generateJwt).toHaveBeenCalled();
        expect(sendEmail).toHaveBeenCalledWith('newuser@test.com', 'Verify your email', expect.any(String));
        // should probably check if user.save() is called but im not sure how to do that
    });

    it('should throw an error if the email already exists', async () => {
        const mockUser = { username: 'test', email: 'test@example.com', password: 'test123' };
        User.findOne.mockResolvedValue(mockUser);

        await expect(registerUser(mockUser.username, mockUser.email, mockUser.password)).rejects.toThrow('Email already exists');
    });
    
    it('should throw an error if the username already exists', async () => {
        const mockUser = { username: 'test', email: 'test@example.com', password: 'test123' };
        User.findOne.mockResolvedValue(mockUser);

        await expect(registerUser(mockUser.username, 'different@email.com', mockUser.password)).rejects.toThrow('Username already exists');
    });

});
