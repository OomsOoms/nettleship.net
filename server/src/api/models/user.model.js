const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { sendEmail } = require('../helpers');

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },
        // sparse allows fields to be unique and null
        google: {
            id: {
                type: String,
                sparse: true,
                unique: true,
            },
            email: {
                type: String,
                sparse: true,
                unique: true,
            },
        },
        // sparse allows fields to be unique and null
        local: {
            email: {
                type: String,
                sparse: true,
                unique: true,
            },
            pendingEmail: {
                type: String,
                sparse: true,
                unique: true,
            },
            password: {
                type: String,
            },
        },
        profile: {
            displayName: {
                type: String,
                default: '',
            },
            bio: {
                type: String,
                default: '',
            },
            avatarUrl: {
                type: String,
                default: '/images/default-avatars/default-avatar.jpg',
            },
            role: {
                type: String,
                enum: ['user', 'admin'],
                default: 'user',
            },
        },
        stats: {
            wins: {
                type: Number,
                default: 0,
            },
            gamesPlayed: {
                type: Number,
                default: 0,
            },
            timePlayed: {
                type: Number,
                default: 0,
            },
            winStreak: {
                type: Number,
                default: 0,
            },
        },
    }, {
        // collection name
        collection: 'users',
        // timestamps for createdAt and updatedAt
        timestamps: true,
        // increment version number on update
        optimisticConcurrency: true,
        versionKey: 'version',
    }
);

// Add the compound index
UserSchema.index({
    'local.email': 1,
    'local.pendingEmail': 1
}, {
    unique: true,
    sparse: true,
});

// virtual fields
UserSchema.virtual('email').get(function () {
    return this.local.pendingEmail || this.local.email || this.google.email;
});

UserSchema.virtual('displayName').get(function () {
    return this.profile.displayName;
});

UserSchema.virtual('avatarUrl').get(function () {
    return this.profile.avatarUrl;
});

UserSchema.virtual('role').get(function () {
    return this.profile.role;
});

UserSchema.virtual('bio').get(function () {
    return this.profile.bio;
});

// Run when a document is saved with await user.save()
UserSchema.pre('save', async function (next) {
    // to be used in the post save hook
    this.wasNew = this.isNew;
    if (this.isModified('local.pendingEmail')) this.emailModified = true; 
    if (this.isModified('local.password')) this.passwordModified = true;

    // Hash the password if it has been modified or is new
    if (this.isModified('local.password')) {
        this.local.password = await bcryptjs.hash(this.local.password, process.env.SALT_ROUNDS || 10);
    }

    // set the users display name if the document is new
    if (this.isNew) {
        this.profile.displayName = this.username;
    }
    next();
});

UserSchema.methods.verifyPassword = async function (password) {
    return bcryptjs.compare(password, this.local.password);
};

UserSchema.methods.sendVerificationEmail = async function () {
    // if the user has a google email
    if (this.google.id && this.wasNew) {
        sendEmail(this.google.email, 'welcome', { username: this.username })
    }
    
    // generate a verification link
    const token = jwt.sign({ userId: this.id }, process.env.JWT_SECRET_KEY,  {expiresIn: '1d',});
    const link = `${process.env.FRONTEND_DOMAIN}/verify-email?token=${token}`;

    // if the user has a pending email and is new
    if (this.local.pendingEmail && this.wasNew) {
        sendEmail(this.local.pendingEmail, 'welcomeVerifyEmail', { link, username: this.username });
    // if the user has updated their email
    } else if (this.local.pendingEmail) {
        sendEmail(this.local.pendingEmail, 'verifyEmail', { link, username: this.username });
    }
};''

// there would be a lot to write about because this includes jwi so itll stay in the auth service for now so i dont have to write about it
// UserSchema.methods.sendResetPasswordEmail = async function () {
// };

UserSchema.post('save', async function (doc, next) {
    // attempt to send the verification email if it was modified
    this.sendVerificationEmail();
    // notify the user if their password has changed
    if (this.passwordModified && !this.wasNew) sendEmail(this.local.email || this.local.pendingEmail, 'passwordChanged', { username: this.username });
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
