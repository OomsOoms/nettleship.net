class Card {
    #deck;

    constructor(type, colour, score, behaviour) {
        this.type = type;
        this.colour = colour;
        this.score = score;
        this.behaviour = behaviour;
        this.#deck = null;
    }

    toString() {
        return `${this.colour} ${this.type} ${this.score}`;
    }

    setDeck(deck) {
        this.#deck = deck;
        return this;
    }

    isPlayable() {
        // coloured cards
        if (this.colour === this.#deck.topCard.colour) {
            return true;
        }
        // number cards
        if (this.type === 'number' && this.score === this.#deck.topCard.score) {
            return true;
        }
        // action cards
        if (this.type !== 'number' && this.type === this.#deck.topCard.type) {
            return true;
        }
        
        // wild cards
        if (this.colour === null) {
            return true;
        }
        return false;
    }

    static createCard(type, colour, value = null) {
        // validate the card colour
        const validColours = ['red', 'yellow', 'green', 'blue'];
        if (colour && !validColours.includes(colour)) throw new Error('Invalid card');
        
        // validate the card type
        switch (type) {
            case 'number':
                // validate the value
                if (value < 0 || value > 9) throw new Error('Invalid card');
                return Card.#number(colour, value);
            case 'skip':
                return Card.#skip(colour);
            case 'reverse':
                return Card.#reverse(colour);
            case 'drawTwo':
                return Card.#drawTwo(colour);
            case 'wild':
                return Card.#wild();
            case 'wildDrawFour':
                return Card.#wildDrawFour();
            default:
                throw new Error('Invalid card');
        }
    }

    // private static method to create a number card   
    static #number(colour, number) {
        // allows game state manipulation in the behaviour function
        function behaviour(game, swapUserId) {
            if (game.sevensAndZeros) {
                if (this.score === 0) {
                    // all hands must be passed to the next player in the direction
                    const hands = game.players.players.map(player => player.hand);           

                    // Rotate hands based on the direction
                    for (let i = 0; i < hands.length; i++) {
                        const nextIndex = (i + game.direction + hands.length) % hands.length;
                        game.players.players[nextIndex].hand = hands[i];
                    }
                } else if (this.score === 7) {
                    // swap hands with another player
                    const player = game.players.players.find(player => player.userId === swapUserId);
                    if (!player) throw new Error('Player not found');
                    if (player.userId === game.players.currentPlayer.userId) throw new Error('Cannot swap hands with yourself');
                    
                    // sawp hands with the current player
                    const tempHand = player.hand;
                    player.hand = game.players.currentPlayer.hand;
                    game.players.currentPlayer.hand = tempHand;
                }
            }
            return;
        };
        // type, colour, score, behaviour
        return new Card('number', colour, number, behaviour);
    }

    static #skip(colour) {
        function behaviour(game) {
            game.players.incrementPlayer();
            return;
        }
        return new Card('skip', colour, 20, behaviour);
    }

    static #reverse(colour) {
        function behaviour(game) {
            game.direction *= -1;
            return;
        }
        return new Card('reverse', colour, 20, behaviour);
    }

    static #drawTwo(colour) {
        function behaviour(game) {
            game.drawPending += 2;
            return;
        }
        return new Card('drawTwo', colour, 20, behaviour);
    }

    static #wild() {
        function behaviour(game, colour) {
            if (!['red', 'yellow', 'green', 'blue'].includes(colour)) {
                throw new Error('Invalid colour');
            }
            this.colour = colour;
            return;
        }
        return new Card('wild', null, 50, behaviour);
    }

    static #wildDrawFour() {
        function behaviour(game, colour) {
            // check if its a valid colour this should so be done with an enum
            if (!['red', 'yellow', 'green', 'blue'].includes(colour)) {
                throw new Error('Invalid colour');
            }
            this.colour = colour;
            game.drawPending += 4;
            return;
        }
        return new Card('wildDrawFour', null, 50, behaviour);
    }
}

module.exports = Card;
