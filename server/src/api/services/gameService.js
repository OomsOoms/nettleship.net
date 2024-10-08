const GameModel = require('../models/game');
const PlayerModel = require('../models/user');

class GameService {
  static async canJoinGame(username, userUuid, gameCode) {
    const user = await PlayerModel.findOne({ uuid: userUuid });
    const game = await GameModel.findOne({ gameCode: gameCode });

    if (game && game.gameState === 'LOBBY' && game.users.length < 10) {
      if (user && user.currentGame === game._id) {
        // Do nothing, intentionally empty block
      }
    }
  }

  static async createGame(hostName, hostUuid, gamePassword) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let gameCode = '';
    for (let i = 0; i < 4; i++) {
      gameCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const newGame = new GameModel({
      gameCode,
      gamePassword,
    });

    await newGame.save();
    return newGame;
  }

  static async findPublicGames() {
    const publicGames = await GameModel.find({
      gameState: 'LOBBY',
      password: null,
    });
    const reducedGamesInfo = publicGames.map((game) => ({
      gameMode: game.settings.gameMode,
      numberOfPlayers: game.users.length,
      gameCode: game.gameCode,
    }));
    return reducedGamesInfo;
  }
}

module.exports = GameService;
