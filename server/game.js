const games = [];

class Game {
    static GameState = {
        LOBBY: 'LOBBY',
        IN_PROGRESS: 'IN_PROGRESS',
        FINISHED: 'FINISHED'
    };

    static findGame(gameCode) {
        return games.find(game => game.gameCode === gameCode);
    }
    static addGame(game) {
        games.push(game);
    }

    constructor() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let gameCode = '';
        for (let i = 0; i < 4; i++) {
            gameCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        this.gameCode = gameCode;
        this.players = [];
        this.gameState = Game.GameState.LOBBY;
    }

    addPlayer(player) {
        if (games.some(game => game.gameCode === player.gameCode)) {
            return false;
        } else {
            this.players.push(player);
            player.gameCode = this.gameCode;
            return true;
        }
    }
}

module.exports = Game;
