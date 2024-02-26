const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    uuid: {
        type: String,
        required: true,
        unique: true,
    },
    currentGame: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Games',
    }],
}, { collection: 'Users' });

const UserModel = mongoose.model('User', UsersSchema);

module.exports = UserModel;