const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { User } = require('../models');
const { Error } = require('../helpers');
const { sendEmail, uploadAvatar, deleteFile } = require('../helpers');

async function createUser(username, email, password) {
    // an error is thrown if the username or email is already in use
    const user = new User({ username, 'local.pendingEmail': email, 'local.password': password });
    return user.save();
}

// currently cant return embeded fields virtual fields?
async function getUserByUsername(requestingUser, username, fields) {
    // find the user with the username provided
    const user = await User.findOne({ username });
    if (!user) throw Error.userNotFound(`User with username '${username}' not found`);
    // check if the requesting user is an admin or the same user
    const isAdmin = requestingUser && requestingUser.profile.role === 'admin';
    const isSameUser = requestingUser && requestingUser.username === username;

    let filteredUser = {};
    // if no fields are provided, include all fields
    if (!fields || fields.length === 0) {
        filteredUser = user;
    } else {
        // else only include the requested fields
        fields.forEach(field => {
            // should make it use user.get() if that exists, this would allow embeded fields to work
            if (user[field]) filteredUser[field] = user[field];
        });
    }
    // return the full user object if they are an admin or the same user
    if (isSameUser || isAdmin) return filteredUser;
    return {
        username: filteredUser.username,
        profile: filteredUser.profile,
        stats: filteredUser.stats,
    }
}

async function updateUser(requestingUser, username, currentPassword, updatedFields, file) {
    // find the user with the username provided
    const user = await User.findOne({ username });
    if (!user) throw Error.userNotFound(`User with username '${username}' not found`);
    // check if the requesting user is an admin or the same user
    const isAdmin = requestingUser && requestingUser.profile.role === 'admin';
    const isSameUser = requestingUser && requestingUser.username === username;

    // check if the user is authorised to delete the user
    if (!isSameUser && !isAdmin) {
        throw Error.invalidCredentials('Not authorized to delete this user');
    }
    // admin can delete any user that isnt themselves with the admin password
    if (isAdmin && !isSameUser && password !== process.env.ADMIN_PASSWORD) {
        throw Error.invalidCredentials('Invalid admin password');
    }

    // store the changes to the user
    let changes = {};

    // if a file is provided upload it and delete the old file
    if (file) {
        const oldFile = user.profile.avatarUrl;
        // if the file is not the default avatar delete the old file
        // this should totally be defined in the env file but im lazy and i dont have time to write about it in the docs so ill just leave it for now
        if (oldFile !== '/images/default-avatars/default-avatar.jpg') await deleteFile(oldFile);
        // create a unique filename for the new file and upload it
        const filename = `${Date.now()}-${user.id}.jpg`;
        // set the avatarUrl to the new file
        user.profile.avatarUrl = await uploadAvatar(file, filename);
        changes.avatarUrl = { message: 'Profile picture updated' };
    }
    // update the user with the provided fields
    for (const field in updatedFields) {
        // check if any changes were made
        if (user[field] === updatedFields[field]) continue;
        // check the rest of the fields
        switch (field) {
            case 'password':
                // verify the password
                user.verifyPassword(currentPassword);
                // update the password and sign out all sessions
                user.local.password = updatedFields[field];
                await mongoose.connection.db.collection('sessions').deleteMany({ 'session.passport.user.id': user.id });
                changes.password = { message: 'Password changed, signed out of all sessions' };
                break;
            case 'email':
                user.local.newEmail = updatedFields[field];
                changes.email = { message: 'Email updated, verification email sent' };
                break;
            default:
                user.set(field, updatedFields[field]);
                changes[field] = { message: `${field} updated` };
        }
    }
    await user.save();
    return changes;
}

async function deleteUser(requestingUser, username, password) {
    // find the user with the username provided
    const user = await User.findOne({ username });
    if (!user) throw Error.userNotFound(`User with username '${username}' not found`);
    // check if the requesting user is an admin or the same user
    const isAdmin = requestingUser && requestingUser.profile.role === 'admin';
    const isSameUser = requestingUser && requestingUser.username === username;

    // check if the user is authorised to delete the user
    if (!isSameUser && !isAdmin) {
        throw Error.invalidCredentials('Not authorized to delete this user');
    }
    // admin can delete any user that isnt themselves with the admin password
    if (isAdmin && !isSameUser && password !== process.env.ADMIN_PASSWORD) {
        throw Error.invalidCredentials('Invalid admin password');
    }
    // user can delete themselves with the correct password
    if (isSameUser && !(await user.verifyPassword(password))) {
        throw Error.invalidCredentials('Invalid password');
    }

    await mongoose.connection.db.collection('sessions').deleteMany({ 'session.passport.user.id': user._id });
    const oldFile = user.profile.avatarUrl;
    if (oldFile !== '/images/default-avatars/default-avatar.jpg') await deleteFile(oldFile);
    await User.deleteOne({ _id: user.id });

    return { message: `User ${user.username} deleted` };
}

async function requestVerification(email) {
    const user = await User.findOne({ 'local.pendingEmail': email });
    if (!user) return; // no error is thrown to avoid email enumeration
    user.sendVerificationEmail();
}

async function verifyEmail(token) {
    // find the user with the id provided in the token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
        throw Error.BadRequest('Invalid token');
    }
    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) throw Error.userNotFound('User not found');
    // replace the email with the new email and remove the new email
    if (!user.local.pendingEmail) throw Error.BadRequest('Email already verified');
    user.local.email = user.local.pendingEmail;
    user.local.pendingEmail = undefined
    await user.save();
}

module.exports = {
    createUser,
    getUserByUsername,
    updateUser,
    deleteUser,
    requestVerification,
    verifyEmail
};