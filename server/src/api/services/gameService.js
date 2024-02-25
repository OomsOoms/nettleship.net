const Game = require('../models/Game');

const createGame = async (name, uuid, password) => {
    const game = new Game();
    Game.addGame(game);
    // should make create and add player in one function
    return result = await game.addPlayer(name, uuid, password);
};

const joinGame = async (gameCode, data) => {
    const game = Game.findGame(gameCode);
    const result = game.addPlayer(data.name, data.uuid, data.password);
    return result;
};

module.exports = {
    createGame,
};