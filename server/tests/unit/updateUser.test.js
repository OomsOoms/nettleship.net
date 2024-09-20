const mongoose = require('mongoose');
const { User } = require('../../src/api/models');
const { updateUser } = require('../../src/api/services/user.service');
const { comparePasswords, uploadFile } = require('../../src/api/helpers');

jest.mock('../../src/api/models/user.model', () => ({
    findOne: jest.fn(),
    save: jest.fn(),
}));

jest.mock('../../src/api/helpers/passwordUtils', () => ({
    comparePasswords: jest.fn(),
}));

jest.mock('../../src/api/helpers/s3', () => ({
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
}));

jest.mock('../../src/api/helpers/sendEmail', () => jest.fn());

jest.mock('../../src/api/helpers/generateJwt', () => jest.fn());

mongoose.connection.db = {
    collection: jest.fn().mockReturnValue({
        deleteMany: jest.fn().mockResolvedValue({}),
    }),
}; 

const mockUser = {
    id: '123',
    username: 'test',
    password: 'hashedPassword',
    profile: {
        displayName: 'Test User',
        roles: ['user'],
        profilePicture: 'path/to/picture.jpg',
    },
    get: jest.fn(),
    set: jest.fn(),
    save: jest.fn(),
};

const mockAdminUser = {
    id: '456',
    username: 'admin',
    password: 'hashedPassword',
    profile: {
        displayName: 'Test User',
        roles: ['admin'],
        profilePicture: 'path/to/picture.jpg',
    },
    get: jest.fn(),
    set: jest.fn(),
    save: jest.fn(),
};

let userToUpdate, requestingUser;
beforeEach(() => {
    jest.clearAllMocks();
});

describe('Update own user profile', () => {
    beforeEach(() => {
        userToUpdate = mockUser;
        requestingUser = mockUser;
        User.findOne.mockResolvedValue(userToUpdate);
    });

    it('should update the requesting users own profile picture', async () => {
        uploadFile.mockResolvedValue({ key: 'new/path/to/picture.jpg' });
        const updatedFields = { profilePicture: 'new/path/to/picture.jpg' };
    
        await updateUser(requestingUser, userToUpdate.username, null, updatedFields, 'file');
    
        expect(User.findOne).toHaveBeenCalledWith({ username: userToUpdate.username });
        expect(uploadFile).toHaveBeenCalledWith('file', 'path/to/picture.jpg');
        expect(userToUpdate.set).toHaveBeenCalledWith('profile.profilePicture', 'new/path/to/picture.jpg');
        expect(userToUpdate.save).toHaveBeenCalled();
    });

    it('should update the requesting users own username', async () => {
        const updatedFields = { username: 'new_username' };
    
        await updateUser(requestingUser, userToUpdate.username, null, updatedFields, null);
    
        expect(User.findOne).toHaveBeenCalledWith({ username: userToUpdate.username });
        expect(userToUpdate.set).toHaveBeenCalledWith('username', 'new_username' );
        expect(userToUpdate.save).toHaveBeenCalled();
    });
    
    it('should update the requesting users own email', async () => {
        const updatedFields = { email: 'newemail@test.com' };
        
        await updateUser(requestingUser, userToUpdate.username, null, updatedFields, null);
        
        expect(User.findOne).toHaveBeenCalledWith({ username: userToUpdate.username });
        expect(userToUpdate.set).toHaveBeenCalledWith('newEmail', 'newemail@test.com' );
        expect(userToUpdate.save).toHaveBeenCalled();
    });
    
    // no need to test the bio as it is the same as the display name
    it('should update the requesting users own display name', async () => {
        const updatedFields = { 'profile.displayName': 'new name' };
    
        await updateUser(requestingUser, userToUpdate.username, null, updatedFields, null);
    
        expect(User.findOne).toHaveBeenCalledWith({ username: userToUpdate.username });
        expect(userToUpdate.set).toHaveBeenCalledWith('profile.displayName', 'new name' );
        expect(userToUpdate.save).toHaveBeenCalled();
    });
});

describe('Update User Password', () => {
    beforeEach(() => {
        userToUpdate = mockUser;
        requestingUser = mockUser;
        User.findOne.mockResolvedValue(userToUpdate);
    });

    it('should update the requesting users own password', async () => {
        comparePasswords.mockResolvedValue(true);
      
        const updatedFields = { password: 'newPassword' };
    
        const result = await updateUser(requestingUser, userToUpdate.username, 'correctPassword', updatedFields, null);

        expect(result.destroySessions).toBe(true);
        expect(User.findOne).toHaveBeenCalledWith({ username: userToUpdate.username });
        expect(userToUpdate.set).toHaveBeenCalledWith('password', 'newPassword' );
        expect(userToUpdate.save).toHaveBeenCalled();
    });
    
    it('should update another users password with the correct admin password from an admin', async () => {
        requestingUser = mockAdminUser;
        comparePasswords.mockResolvedValue(true);
      
        const updatedFields = { password: 'newPassword' };
    
        const result = await updateUser(requestingUser, userToUpdate.username, process.env.ADMIN_PASSWORD, updatedFields, null);

        expect(result.destroySessions).toBe(false);
        expect(User.findOne).toHaveBeenCalledWith({ username: userToUpdate.username });
        expect(userToUpdate.set).toHaveBeenCalledWith('password', 'newPassword' );
        expect(userToUpdate.save).toHaveBeenCalled();
    });

    it('should throw an error when updating the password with the invalid current password', async () => {
        comparePasswords.mockResolvedValue(false);
        const updatedFields = { password: 'new password' };
    
        await expect(updateUser(requestingUser, userToUpdate.username, 'wrongPassword', updatedFields, null))
            .rejects
            .toThrow('Invalid password');
        
        expect(User.findOne).toHaveBeenCalledWith({ username: userToUpdate.username });
        expect(userToUpdate.set).not.toHaveBeenCalled();
        expect(userToUpdate.save).not.toHaveBeenCalled();
    });
});

describe('admin operations', () => {
    beforeEach(() => {
        userToUpdate = mockUser;
        requestingUser = mockAdminUser;
        User.findOne.mockResolvedValue(userToUpdate);
    });

    it('should update the another users profile picture using the admin password', async () => {
        uploadFile.mockResolvedValue({ key: 'new/path/to/picture.jpg' });
        const updatedFields = { profilePicture: 'new/path/to/picture.jpg' };

        await updateUser(requestingUser, userToUpdate.username, process.env.ADMIN_PASSWORD, updatedFields, 'file');

        expect(User.findOne).toHaveBeenCalledWith({ username: userToUpdate.username });
        expect(uploadFile).toHaveBeenCalledWith('file', 'path/to/picture.jpg');
        expect(userToUpdate.set).toHaveBeenCalledWith('profile.profilePicture', 'new/path/to/picture.jpg');
        expect(userToUpdate.save).toHaveBeenCalled();
    });
    
    it('should throw error on incorrect admin password', async () => {
        const updatedFields = { email: 'newemail@example.com' };

        await expect(updateUser(requestingUser, userToUpdate.username, 'wrongAdminPassword', updatedFields, null))
            .rejects
            .toThrow('Invalid admin password');

        expect(User.findOne).toHaveBeenCalledWith({ username: userToUpdate.username });
        expect(userToUpdate.set).not.toHaveBeenCalled();
        expect(userToUpdate.save).not.toHaveBeenCalled();
    });

    it('should throw error on unauthorized access', async () => {
        const userToUpdate = mockAdminUser; // doesnt have to be an admin, just any other user
        const requestingUser = mockUser;
        User.findOne.mockResolvedValue(userToUpdate); // user to update
        const updatedFields = { email: 'newemail@example.com' };

        await expect(updateUser(requestingUser, userToUpdate.username, 'wrongAdminPassword', updatedFields, null))
            .rejects
            .toThrow('Not authorized to delete this user');

        expect(User.findOne).toHaveBeenCalledWith({ username: userToUpdate.username });
        expect(userToUpdate.set).not.toHaveBeenCalled();
        expect(userToUpdate.save).not.toHaveBeenCalled();
    });
});

it('should throw an error if the user to be updated is not found', async () => {
    const userToUpdate = null;
    const requestingUser = mockAdminUser;
    User.findOne.mockResolvedValue(userToUpdate);
    const updatedFields = { email: 'newemail@example.com' };

    await expect(updateUser(requestingUser, 'nonexistentUser', null, updatedFields, null))
        .rejects
        .toThrow(`User with username 'nonexistentUser' not found`);

    expect(User.findOne).toHaveBeenCalledWith({ username: 'nonexistentUser' });
    expect(mockUser.set).not.toHaveBeenCalled();
    expect(mockUser.save).not.toHaveBeenCalled();
});
