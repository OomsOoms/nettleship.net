const mongoose = require('mongoose');

const { User } = require('../../src/api/models');
const { deleteUser } = require('../../src/api/services/user.service');
const { comparePasswords } = require('../../src/api/helpers/passwordUtils');
const { deleteFile } = require('../../src/api/helpers');

jest.mock('../../src/api/models/user.model', () => ({
    findById: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
}));

jest.mock('../../src/api/helpers/passwordUtils', () => ({
    comparePasswords: jest.fn(),
}));

jest.mock('../../src/api/helpers/s3', () => ({
    deleteFile: jest.fn(),
}));

const mockUser = {
    id: '123',
    username: 'test',
    profile: {
        roles: ['user'],
        profilePicture: 'path/to/picture.jpg',
    }
};
const mockAdminUser = {
    id: '456',
    username: 'testadmin',
    profile: {
        roles: ['admin'],
        profilePicture: 'path/to/picture.jpg',
    }
};

let userToDelete, requestingUser;
beforeEach(() => {
    jest.clearAllMocks();
});
describe('User attempts to delete their own account', () => {
    beforeEach(() => {
        userToDelete = mockUser;
        requestingUser = mockUser;
        User.findOne.mockResolvedValue(userToDelete);
    });

    it('should delete themselves if the password is correct', async () => {
        mongoose.connection.db = { collection: jest.fn().mockReturnValue({ deleteMany: jest.fn() }) };
        comparePasswords.mockResolvedValue(true); // correct password

        await deleteUser(requestingUser, userToDelete.username, mockUser.password);

        expect(mongoose.connection.db.collection).toHaveBeenCalledWith('sessions');
        expect(mongoose.connection.db.collection('sessions').deleteMany).toHaveBeenCalledWith({ 'session.userId': userToDelete.id });
        expect(User.deleteOne).toHaveBeenCalledWith({ id: userToDelete.id });
        expect(deleteFile).toHaveBeenCalledWith(userToDelete.profile.profilePicture);
    });

    it('should throw an error if the user tries to delete themselves with the wrong password', async () => {
        comparePasswords.mockResolvedValue(false); // wrong password

        await expect(deleteUser(requestingUser, userToDelete.username, 'wrong password')).rejects.toThrow('Invalid password');

        expect(User.deleteOne).not.toHaveBeenCalled();
        expect(mongoose.connection.db.collection('sessions').deleteMany).not.toHaveBeenCalled();
        expect(deleteFile).not.toHaveBeenCalled();
    });
});
describe('Admin attempts to delete a user account', () => {
    beforeEach(() => {
        userToDelete = mockAdminUser;
        requestingUser = mockAdminUser;
    });

    it('should let an admin delete another user with the admin password', async () => {
        const userToDelete = mockUser;
        const requestingUser = mockAdminUser;
        User.findOne.mockResolvedValue(userToDelete); // user to delete
        mongoose.connection.db = { collection: jest.fn().mockReturnValue({ deleteMany: jest.fn() }) };
        comparePasswords.mockResolvedValue(true); // admin password
    
        await deleteUser(requestingUser, userToDelete.username, process.env.ADMIN_PASSWORD);
    
        expect(mongoose.connection.db.collection).toHaveBeenCalledWith('sessions');
        expect(mongoose.connection.db.collection('sessions').deleteMany).toHaveBeenCalledWith({ 'session.userId': userToDelete.id });
        expect(User.deleteOne).toHaveBeenCalledWith({ id: userToDelete.id });
        expect(deleteFile).toHaveBeenCalledWith(userToDelete.profile.profilePicture);
    });
        
    it('should throw an error if the admin tries to delete themselves with the admin password', async () => {
        const userToDelete = mockAdminUser;
        const requestingUser = mockAdminUser;
        User.findOne.mockResolvedValue(userToDelete); // user to delete
        comparePasswords.mockResolvedValue(false); // wrong password

        await expect(deleteUser(requestingUser, userToDelete.username, process.env.ADMIN_PASSWORD)).rejects.toThrow('Invalid password');

        expect(User.deleteOne).not.toHaveBeenCalled();
        expect(mongoose.connection.db.collection('sessions').deleteMany).not.toHaveBeenCalled();
        expect(deleteFile).not.toHaveBeenCalled();
    });

    it('should throw an error if the user is not found', async () => {
        const userToDelete = mockAdminUser;
        const requestingUser = mockAdminUser;
        User.findOne.mockResolvedValue(null); // user to delete
        comparePasswords.mockResolvedValue(false); // wrong password

        await expect(deleteUser(requestingUser, userToDelete.username, process.env.ADMIN_PASSWORD)).rejects.toThrow(`User with username '${ userToDelete.username }' not found`);

        expect(User.deleteOne).not.toHaveBeenCalled();
        expect(mongoose.connection.db.collection('sessions').deleteMany).not.toHaveBeenCalled();
        expect(deleteFile).not.toHaveBeenCalled();
    });
});

