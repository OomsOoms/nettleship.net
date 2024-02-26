const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    gameCode: {
        type: String,
        required: true,
        unique: true,
    },
    gameState: {
        type: String,
        enum: ['LOBBY', 'IN_PROGRESS', 'COMPLETED'],
        default: 'LOBBY',
    },
    currentPlayerIndex: {
        type: Number,
        default:  0,
    },
    settings: {
        gameMode: {
            type: String,
            default: 'classic',
        },
        password: {
            type: String,
            default: null,
        },
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    }],
    deck: {
        cards: [{
            type: mongoose.Schema.Types.Mixed,
            default: [],
        }],
        discards: [{
            type: mongoose.Schema.Types.Mixed,
            default: [],
        }],
    },  
}, { collection: 'Games' });

const GameModel = mongoose.model('Game', GameSchema);

module.exports = GameModel;