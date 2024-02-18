const Deck = require('./deck.js');
const classicCards = require('./cards.js');

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
        this.gameState = Game.GameState.LOBBY;
        this.currentPlayerIndex = 0;
        this.settings = {
            gameMode: 'classic',
        }
        this.players = [];
        this.deck = new Deck();

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
    startGame(uuid) {
        if (this.gameState === Game.GameState.LOBBY && this.players[0].uuid === uuid && this.players.length >= 2) {
            this.gameState = Game.GameState.IN_PROGRESS;
            this.currentPlayerIndex = Math.floor(Math.random() * this.players.length);
            switch (this.settings.gameMode) {
            case 'classic':
                this.deck.cards = classicCards;
                break;
            }
            // deal hands
            // pick start card
            return true;
        }
    }
}

module.exports = Game;
