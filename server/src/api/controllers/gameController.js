const gameService = require('../services/gameService');

const createGame = async (req, res) => {
    try {
        const { name, uuid, password } = req.body;
        const result = await gameService.createGame({ name, uuid, password });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const joinGame = async (req, res) => {
    try {
        const gameCode = req.params.id;
        const result = await gameService.joinGame(gameCode, req.body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const startGame = (req, res) => {
    try {
        const game = Game.findGame(req.body.gameCode);
        const result = game.startGame(req.body.uuid);
        return res.status(200).json( result );
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const findPublicGames = (req, res) => {
    const publicGames = Game.games.filter(game => !game.settings.password);
    const reducedGamesInfo = publicGames.map(game => {
        return {
            gameMode: game.settings.gameMode,
            numberOfPlayers: game.players.length,
            gameCode: game.gameCode
        };
    });
    res.status(200).json(reducedGamesInfo);
};

const getGame = (req, res) => {
    try {
        const game = Game.findGame(req.query.gameCode);
        res.status(200).json(game);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

module.exports = {
    createGame,
    joinGame,
    startGame,
    findPublicGames,
    getGame
};
