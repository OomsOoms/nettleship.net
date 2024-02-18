const express = require('express');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 8000;

const Game = require('./game');
const Player = require('./player');

// Store this in a database
const players = [];



app.use(morgan('dev'));
app.use(express.json()); // Add this line to parse JSON bodies

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/api', (req, res) => {
    res.send('API Online');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const createGameValidationRules = [
    body('uuid').optional().isString(),
    body('name').isString(),
];
const joinGameValidationRules = [
    body('uuid').optional().isString(),
    body('name').isString(),
    body('gameCode').isString().isLength({ min: 4, max: 4 }),
];

const startGameValidationRules = [
    body('uuid').isString(),
    body('gameCode').isString().isLength({ min: 4, max: 4 }),
];

// Middleware function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const findPlayer = (name, uuid) => {
    let player = players.find(player => player.uuid === uuid);
    if (!player && uuid) {
        return false;
    } else if (!player) {
        player = new Player(name);
        players.push(player);
    }
    return player;
}

app.post('/api/create-game', createGameValidationRules, handleValidationErrors, (req, res) => {
    const game = new Game();
    Game.addGame(game);

    const player = findPlayer(req.body.name, req.body.uuid);
    if (!player) {
        return res.status(400).json({ message: 'Invalid uuid' });
    } else if (game.addPlayer(player)) {
        return res.status(200).json({ gameCode: game.gameCode, playerUuid: player.uuid });
    } else {
        return res.status(409).json({ message: 'Cannot create game, already in a game' });
    }
});

app.post('/api/join-game', joinGameValidationRules, handleValidationErrors, (req, res) => {
    const game = Game.findGame(req.body.gameCode);
    if (!game) {
        return res.status(404).json({ message: 'Game not found' });
    } else if (game.gameState !== Game.GameState.LOBBY) {
        return res.status(409).json({ message: 'Game already in progress' });
    } else if (game.players.length >= 4) {
        return res.status(403).json({ message: 'Game is full' });
    }

    const player = findPlayer(req.body.name, req.body.uuid);
    if (!player) {
        return res.status(400).json({ message: 'Invalid uuid' });
    } else if (game.addPlayer(player)) {
        return res.status(200).json({ gameCode: game.gameCode, playerUuid: player.uuid });
    } else {
        return res.status(409).json({ message: 'Cannot join game, already in a game' });
    }
});

app.post('/api/start-game', startGameValidationRules, handleValidationErrors, (req, res) => {
    const game = Game.findGame(req.body.gameCode);

    if (!game) {
        return res.status(404).json({ message: 'Game not found' });
    }

    if (game.startGame(req.body.uuid)) {
        return res.status(200).json({ message: 'Game started' });
    } else {
        return res.status(403).json({ message: 'Cannot start game' });
    }
});


app.get('/api/game', function (req, res) {
    const game = Game.findGame(req.query.gameCode);
    if (!game) {
        return res.status(404).json({ message: 'Game not found' });
    }
    res.status(200).json(game);
});
