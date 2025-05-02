const Deck = require('./Deck');
const Players = require('./Players');

class Game {
    constructor(broadcastGameState) {
        // settings
        this.maxPlayers = 10;
        this.playerHandSize = 7;
        this.replacePlayers = false;
        this.declareLastCardPenalty = 2;
        this.autoPlay = false;
        this.chaining = true;
        this.stacking = true;
        this.jumpIn = true;
        this.sevensAndZeros = false;
        this.drawUntilPlayable = false;
        this.playOnDraw = true;
        this.public = true;
        
        // game state
        this.gameCode = Math.floor(Math.random() * 900000) + 100000;
        // lobby inProgress and gameOver
        this.status = 'lobby'; // at some point spell this wrong then add enumerated type
        this.deck = new Deck();
        this.players = new Players(this);
        this.direction = 1;
        this.autoPlayTimeout = null;
        this.previousPlayer = null;
        this.startTime = null;
        this.drawPending = 0;

        // broadcast function
        this.broadcastGameState = broadcastGameState;
    }

    // keywords used for search
    get keywords() {
        // get the players display names and split them by ' ' to allow for more keywords 
        const displayNames = this.players.players.flatMap(player => player.displayName.split(' '));

        return [
            this.gameCode,
            this.status,
            this.players.players.length,
            this.maxPlayers,
            ...displayNames,
        ]
    }

    get settings() {
        return {
            maxPlayers: this.maxPlayers,
            playerHandSize: this.playerHandSize,
            replacePlayers: this.replacePlayers,
            declareLastCardPenalty: this.declareLastCardPenalty,
            autoPlay: this.autoPlay,
            chaining: this.chaining,
            stacking: this.stacking,
            jumpIn: this.jumpIn,
            sevensAndZeros: this.sevensAndZeros, 
            drawUntilPlayable: this.drawUntilPlayable,
            playOnDraw: this.playOnDraw,
            public: this.public
        };
    };
    
    set settings(settings) {
        if (this.status !== 'lobby') throw new Error('Cannot change settings during a game');

        // validation
        if (typeof settings !== 'object' || settings === null) {
            throw new Error('Settings must be a valid object.');
        }
        if (typeof settings.maxPlayers !== 'number' || settings.maxPlayers < 2 || settings.maxPlayers > 10) {
            throw new Error('maxPlayers must be a number between 2 and 10.');
        }
        if (typeof settings.playerHandSize !== 'number' || settings.playerHandSize < 1) {
            throw new Error('playerHandSize must be a positive number.');
        }
        if (typeof settings.declareLastCardPenalty !== 'number' || settings.declareLastCardPenalty < 1) {
            throw new Error('declareLastCardPenalty must be a positive number.');
        }
        const booleanProperties = ['public', 'replacePlayers', 'chaining', 'stacking', 'jumpIn', 'drawUntilPlayable', 'playOnDraw', 'sevensAndZeros', 'autoPlay'];
        for (const prop of booleanProperties) {
            if (typeof settings[prop] !== 'boolean') {
                throw new Error(`${prop} must be a boolean.`);
            }
        }

        // set the settings
        this.maxPlayers = settings.maxPlayers;
        this.playerHandSize = settings.playerHandSize;
        this.replacePlayers = settings.replacePlayers;
        this.declareLastCardPenalty = settings.declareLastCardPenalty;
        this.autoPlay = settings.autoPlay;
        this.chaining = settings.chaining;
        this.stacking = settings.stacking;
        this.jumpIn = settings.jumpIn;
        this.sevensAndZeros = settings.sevensAndZeros;
        this.drawUntilPlayable = settings.drawUntilPlayable;
        this.playOnDraw = settings.playOnDraw;
        this.public = settings.public;
    }

    async handleAction(action, userId) {
        switch (action.type) {
            case 'gameState':
                return { type: 'gameState', gameState: this.getGameState(userId) };
            case 'deckConfig':
                return { type: 'deckConfig', deckConfig: this.deck.config }
            case 'changeSettings':
                if (userId !== this.players.host.userId) throw new Error("Only the host can change settings")
                this.settings = action.settings;
                this.broadcastGameState(this.gameCode, 'settingsChanged');
                break;
            case 'startGame':
                this.startGame(userId, action.configuration);
                this.broadcastGameState(this.gameCode, 'gameStarted');
                break;
            case 'addAiPlayer':
                this.players.addAiPlayer(userId);
                this.broadcastGameState(this.gameCode, 'playerAdded');
                break;
            case 'removePlayer':
                // user to remove, requesting user
                const hostId = this.players.host.userId;
                if (hostId !== userId && action.userId !== userId) throw new Error('Only the host can remove players');
                this.players.removePlayer(action.userId, userId);
                this.broadcastGameState(this.gameCode, 'playerRemoved');
                break;
            case 'declareLastCard':
                this.declareLastCard(userId);
                this.broadcastGameState(this.gameCode, 'lastCardDeclared');
                break;
            // game state updates at the end of the turn
            case 'drawCard':
                this.drawCard(userId);
                break;
            case 'placeCard':
                this.placeCard(userId, action.cardIndexes, action.wildColour || action.swapUserId);
                break;
            default:
                throw new Error('Invalid action');
        }
    }

    startGame(userId, configuration) {
        // check if the player is allowed to start the game
        if (this.players.host.userId !== userId) throw new Error('Only the host can start the game');
        if (this.players.players.length < 2) throw new Error('Not enough players to start game');
        if (this.status !== 'lobby') throw new Error('Game already in progress');
        
        // start the game
        this.players.selectStartingPlayer();
        this.deck.initialiseDeck(configuration);
        this.players.players.forEach(player => {
            player.hand = this.deck.drawCard(this.playerHandSize);
        });
        this.deck.discardCard(this.deck.drawCard()[0]);
        this.status = 'inProgress';
        this.startTime = Date.now();
        this.startTurn();
    }

    endGame() {
        // reset the game state
        this.status = 'lobby';
        this.deck.cards = [];
        this.deck.discardedCards = [];
        this.direction = 1;
        this.autoPlayTimeout = null;
        this.previousPlayer = null;
        this.startTime = null;
        this.drawPending = 0;
        // empty player hands and calculate scores
        this.players.players.forEach(player => {
            // could add a getter func that does this but then it wouldnt cumulate across rounds
            player.hand.forEach(card => {
                player.score += card.score;
            });
            player.hand = [];
            // save the game stats to the database
        });

        // broadcast the game state
        this.broadcastGameState(this.gameCode, 'gameEnded');
    }

    startTurn() {
        if (this.status !== 'inProgress') throw new Error('Game not in progress 1');
        const player = this.players.currentPlayer;
        player.calledUno = false;

        // handle the drawPending
        if (this.drawPending > 0) {
            if (!this.chaining || !player.hand.some(card => ['drawTwo', 'wildDrawFour'].includes(card.type))) {
                player.hand.push(...this.deck.drawCard(this.drawPending));
                this.drawPending = 0;
                this.endTurn();
                return;
            }
        }

        // play the turn if the player is an AI
        if (player.isAI) {
            // add a random delay to make it seem more human
            setTimeout(() => {
                player.play(this);
                return;
            }, Math.floor(Math.random() * 5000)); // 0-5 seconds
        }

        // set a timeout for the player to play
        if (this.autoPlay) {
            this.autoPlayTimeout = setTimeout(() => {
                player.play(this);
            }, 30000); // 30 seconds
        }
    }

    endTurn() {
        if (this.status !== 'inProgress') throw new Error('Game not in progress 2');
        this.previousPlayer = this.players.currentPlayer;
        this.players.currentPlayer.lastDrawnCard = null;

        // check if the player has won
        if (this.players.currentPlayer.hand.length === 0) {
            this.endGame();
            return;
        }
        this.players.incrementPlayer();

        // broadcast the game state
        this.broadcastGameState(this.gameCode, 'turnEnded');
        
        this.startTurn();
    }

    drawCard(userId) {
        if (this.status !== 'inProgress') throw new Error('Game not in progress 3');

        if (this.drawPending > 0) {
            this.players.currentPlayer.hand.push(...this.deck.drawCard(this.drawPending));
            this.drawPending = 0;
            this.endTurn();
            // end the turn as they its a penalty draw
            return;
        }

        // check if the player is allowed to draw a card
        const player = this.players.currentPlayer;
        if (player.userId !== userId) throw new Error('Not your turn');

        // draw a card
        do {
            var card = this.deck.drawCard()[0];
            player.hand.push(card);
            player.lastDrawnCard = card;
        } while (this.drawUntilPlayable && !card.isPlayable());

        // end the turn if the card is not playable
        if (!this.playOnDraw || !card.isPlayable()) {
            this.endTurn(); 
        } else {
            this.broadcastGameState(this.gameCode, 'playOnDraw');
        }
    }

    placeCard(userId, cardIndexes, input) {
        if (this.status !== 'inProgress') throw new Error('Game not in progress 4');
        const player = this.players.currentPlayer;

        const firstCard = player.hand[cardIndexes[0]]; // will be the only card if not stacking
        if (!firstCard) throw new Error('Card not found');

        if (this.drawPending > 0) {
            if (!['drawTwo', 'wildDrawFour'].includes(firstCard.type)) {
                throw new Error('Must place draw cards');
            }
        }

        // check if a player is jumping in
        if (this.jumpIn && firstCard.colour === this.deck.topCard.colour && firstCard.value === this.deck.topCard.value && typeof firstCard.value === 'number') {
            this.players.currentPlayer = player;
        // check if its the players turn
        } else if (player.userId !== userId) {
            throw new Error('Not your turn');
        }

        // check if the player must play the last drawn card
        if (this.playOnDraw && player.lastDrawnCard) {
            if (firstCard === player.lastDrawnCard) {
                // reset the last drawn card
                player.lastDrawnCard = null;
            } else {
                throw new Error(('Must play the last drawn card'));
            }
        }

        // validate the cards being placed
        // Check if stacking is enabled, the player is not playing a drawn card,  
        // and the first card has the same value as the top card and that value is a number
        if (this.stacking && !player.lastDrawnCard && firstCard.value === this.deck.topCard.value && typeof firstCard.value === 'number') {
            // if sevensAndZeros is enabled 7s and 0s cant be stacked
            if (this.sevensAndZeros && (firstCard.value === 0 || firstCard.value === 7)) {
                return;
            };
            // check if the following cards are the same value
            cardIndexes.forEach(cardIndex => {
                const card = player.hand[cardIndex];
                if (card.value !== firstCard.value) {
                    throw new Error('Cannot stack cards of different values');
                }
            });
        }
        
        // discard the cards
        cardIndexes.forEach(cardIndex => {
            // discard the card this will return an error if the card is not playable
            const card = player.hand[cardIndex];
            this.deck.discardCard(card);
        });

        // remove the cards from the players hand
        // done in this order to avoid index
        player.hand = player.hand.filter((card, index) => !cardIndexes.includes(index));

        // action cards cannot be stacked so the behaviour is only run on the first card
        if (firstCard.behaviour) {
            firstCard.behaviour(this, input);
        }

        // end the turn
        this.endTurn();     
    }

    // when i do frontend write about the fact the button can always be pressed so that users can forget
    declareLastCard(userId) {
        if (this.status !== 'inProgress') throw new Error('Game not in progress 5');
        const player = this.players.currentPlayer;

        // mark the requesting player as having called uno
        const requestingPlayer = this.players.players.find(player => player.userId === userId);
        if (!requestingPlayer) throw new Error('Player not found');
        requestingPlayer.calledUno = true;
        
        // if its not the current player it means they are catching the current player if they didnt call the last card
        if (player.userId !== userId) {
            // check if the previous player has declared last card
            if (this.previousPlayer && !this.previousPlayer.calledUno && this.previousPlayer.hand.length === 1) {
                this.previousPlayer.hand.push(...this.deck.drawCard(this.declareLastCardPenalty));
            }
        }
    }

    getGameState(userId) {
        const player = this.players.players.find(player => player.userId === userId);
        if (!player) throw new Error('Player not found');

        // array of players minus the hand so other players hands arent revealed
        const players = this.players.players.map(player => ({
            displayName: player.displayName,
            handLength: player.hand.length,
            score: player.score,
            isTurn: player === this.players.currentPlayer,
            isHost: player === this.players.host,
            isYou: player.userId === userId,
            isAI: player.isAI,
            userId: player.userId,
        }));

        return {
            gameCode: this.gameCode,
            status: this.status,
            settings: this.settings,
            drawPending: this.drawPending,
            direction: this.direction,
            topCard: this.deck.topCard,
            players: players,
            player: {
                hand: player.hand,
                displayName: player.displayName,
                score: player.score,
                lastDrawnCard: player.lastDrawnCard,
		        isHost: player === this.players.host,
            },
        };
    };
}

module.exports = Game;
