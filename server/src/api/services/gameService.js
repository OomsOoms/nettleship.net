const { v4: uuidv4 } = require('uuid');

const GameModel = require('../models/game');
const PlayerModel = require('../models/player');

class GameService {

    static async canJoinGame(username, userUuid, gameCode) {
        const user = await PlayerModel.findOne({ uuid: userUuid });
        const game = await GameModel.findOne({ gameCode: gameCode });

        if (game && game.gameState === 'LOBBY' && game.users.length < 10) {
            if (user && user.currentGame === game._id) {
                
            } 
        };

    };

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
    };

    static async findPublicGames() {
        const publicGames = await GameModel.find({ gameState: 'LOBBY', password: null });
        const reducedGamesInfo = publicGames.map(game => {
            return {
                gameMode: game.settings.gameMode,
                numberOfPlayers: game.users.length,
                gameCode: game.gameCode
            };
        });
        return reducedGamesInfo;
    }
};

module.exports = GameService;