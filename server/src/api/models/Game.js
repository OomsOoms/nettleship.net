const Deck = require('./Deck.js');
const Player = require('./Player.js');

const classicCards = require('./Cards.js');


class Game {
    static games = [];
    static users = [];
    static GameState = {
        LOBBY: 'LOBBY',
        IN_PROGRESS: 'IN_PROGRESS',
        FINISHED: 'FINISHED'
    };
    static findGame(gameCode) {
        const game = Game.games.find(game => game.gameCode === gameCode);
        if (game) {
            return game;
        } else {
            throw new Error('game not found');
        }
    }
    static addGame(game) {
        Game.games.push(game);
    }
    static removeGame(game) {
        const index = Game.games.indexOf(game);
        if (index !== -1) {
            Game.games.splice(index, 1);
        }
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
            password: null
        }
        this.players = [];
        this.deck = new Deck();
    }
    addPlayer(name, uuid, password) {
        if (this.gameState === Game.GameState.LOBBY && this.players.length < 10) {
            if (this.players.length !==0 && this.settings.password) {
                if (password !== this.settings.password) {
                    throw new Error('invalid password');
                }
            } 
            if (Game.users.find(player => player.uuid === uuid)) {
                throw new  Error('already in game');
            }
            let player = Game.users.find(player => player.uuid === uuid);
            if (!player && uuid) {
                throw new Error('invalid uuid');
            } else if (!player) {
                player = new Player(name);
                Game.users.push(player);
            }
            this.players.push(player);
            player.gameCode = this.gameCode;
            return { gameCode: this.gameCode, playerUuid: player.uuid };
        } else {
            throw new Error('game is full');
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
            return { message: 'game started' }
        } else {
            throw new Error('game cannot start');
        }
    }
}

module.exports = Game;
