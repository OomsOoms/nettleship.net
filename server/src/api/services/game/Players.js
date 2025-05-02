const { HumanPlayer, AIPlayer } = require('./Player');

class Players {
    #currentPlayerIndex = 0;
    #game;
    
    constructor(game) {
        this.players = [];
        this.#game = game;
    }

    get currentPlayer() {
        return this.players[this.#currentPlayerIndex];
    }

    set currentPlayer(player) {
        this.#currentPlayerIndex = this.players.indexOf(player);
    }

    get host() {
        return this.players.find(player => player instanceof HumanPlayer);
    }

    incrementPlayer() {
        this.#currentPlayerIndex = (this.#currentPlayerIndex + this.#game.direction) % this.players.length;
        if (this.#currentPlayerIndex < 0) {
            this.#currentPlayerIndex = this.players.length - 1;
        }
    }

    selectStartingPlayer() {
        this.#currentPlayerIndex = Math.floor(Math.random() * this.players.length);
    }

    addPlayer(userId, displayName, ws) {
        // check if the player is already in the game
        const player = this.players.find(player => player.userId === userId);
        if (player) {
            // replace the ai player with the human player
            if (player instanceof AIPlayer) {
                const humanPlayer = new HumanPlayer(userId, displayName, ws);
                humanPlayer.score = player.score;
                humanPlayer.hand = player.hand;
                this.players[this.players.indexOf(player)] = humanPlayer;
                return;
            }
            // if the player is already in the game do nothing
            // this is because the player may have disconnected and reconnected
            console.log(`Player ${userId} already in game`);
            // replace the websocket with the new one
            player.ws = ws;
            return;
        }
        // this would be where guest users are added
        if (this.#game.status !== 'lobby') {
            throw new Error('Game has already started');
        }
        if (this.players.length >= this.#game.maxPlayers) {
            throw new Error('Game is full');
        }
        this.players.push(new HumanPlayer(userId, displayName, ws));
    }

    addAiPlayer(userId) {
        if (this.host.userId !== userId) {
            throw new Error('Only the host can add AI players');
        }
        if (this.#game.status !== 'lobby') {
            throw new Error('Game has already started');
        }
        if (this.players.length >= 10) {
            throw new Error('Game is full');
        }
        const aiUserId = `aiUser_${Math.random().toString(36).substring(7)}`;
        this.players.push(new AIPlayer(aiUserId));
    }

    removePlayer(userId, requestingUserId = null) {
        // find the index of the player
        const playerIndex = this.players.findIndex(player => player.userId === userId);
        if (playerIndex === -1) {
            throw new Error('Player not found');
        }
        const player = this.players[playerIndex];
        
        // if replacePlayers is true replace the player with an AI player
        if (this.#game.replacePlayers) {
            // maintains the same user ID so the player can reconnect
            const newPlayer = new AIPlayer(player.userId);
            // copy user data to new AIPlauer
            newPlayer.score = this.players[playerIndex].score;
            newPlayer.hand = this.players[playerIndex].hand;
            this.players[playerIndex] = newPlayer;
        } else {
            // if current player is removed, increment the player index
            if (this.#currentPlayerIndex === playerIndex) {
                this.incrementPlayer();
            }
            // then remove the player from the game
            this.players.splice(playerIndex, 1);
            // discard their hand
            player.hand.forEach(card => this.#game.deck.discardedCards.push(card));
            
            // then adjust for index changes
            if (playerIndex < this.#currentPlayerIndex) {
                this.#currentPlayerIndex--;
            }
        }
    }
}

module.exports = Players;
