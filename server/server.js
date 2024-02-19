const express = require('express');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 8000;

const Game = require('./game');

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
    body('uuid').optional().isUUID(),
    body('name').isString(),
];
const joinGameValidationRules = [
    body('uuid').optional().isUUID(),
    body('name').isString(),
    body('gameCode').isString().isLength({ min: 4, max: 4 }),
    body('password').optional().isString()
];
const startGameValidationRules = [
    body('uuid').isUUID(),
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

app.post('/api/create-game', createGameValidationRules, handleValidationErrors, (req, res) => {
    const game = new Game();
    Game.addGame(game);
    try {
        const result = game.addPlayer(req.body.name, req.body.uuid, req.body.password);
        return res.status(200).json( result );
    } catch (error) {
        Game.removeGame(game);
        return res.status(400).json({ error: error.message });
    }
});

app.post('/api/join-game', joinGameValidationRules, handleValidationErrors, (req, res) => {
    try {
        const game = Game.findGame(req.body.gameCode);
        const result = game.addPlayer(req.body.name, req.body.uuid, req.body.password);
        return res.status(200).json( result );
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

app.post('/api/start-game', startGameValidationRules, handleValidationErrors, (req, res) => {
    try {
        const game = Game.findGame(req.body.gameCode);
        const result = game.startGame(req.body.uuid);
        return res.status(200).json( result );
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

app.get('/api/public-games', function (req, res) {
    const publicGames = Game.games.filter(game => !game.settings.password);
    const reducedGamesInfo = publicGames.map(game => {
        return {
            gameMode: game.settings.gameMode,
            numberOfPlayers: game.players.length,
            gameCode: game.gameCode
        };
    });
    res.status(200).json(reducedGamesInfo);
});

app.get('/api/game', function (req, res) {
    const game = Game.findGame(req.query.gameCode);
    if (!game) {
        return res.status(404).json({ message: 'Game not found' });
    }
    res.status(200).json(game);
});
