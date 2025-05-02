class Player {
  constructor(userId, displayName, ws) {
    this.userId = userId;
    this.displayName = displayName;
    this.hand = [];
    this.score = 0;
    this.lastDrawnCard = null;
    this.calledUno = false;
    this.ws = ws;
  }

  play(game) {
    // get the first playable card index
    let card = this.hand.find((card) => card.isPlayable());
    let cardIndex = this.hand.indexOf(card);

    if (cardIndex === -1) {
      // if no card is playable draw a card
      game.drawCard(this.userId);
      // lastDrawnCard is only set if the player has drawn a card
      if (this.lastDrawnCard && game.playOnDraw) {
        // find the index of the lastDrawnCard
        cardIndex = this.hand.indexOf(this.lastDrawnCard);
        card = this.lastDrawnCard;
      } else {
        return;
      }
    }

    if ((card && card.type === 'wild') || card.type === 'wildDrawFour') {
      // if the card is a wild card, set the colour to the most common colour in the hand
      const colours = this.hand.reduce((acc, card) => {
        if (card.colour) {
          acc[card.colour] = acc[card.colour] ? acc[card.colour] + 1 : 1;
        }
        return acc;
      }, {});
      const mostCommonColour = Object.keys(colours).reduce((a, b) => (colours[a] > colours[b] ? a : b));
      game.placeCard(this.userId, [cardIndex], mostCommonColour);
      return;
    }

    if (game.sevensAndZeros && card.score === 7) {
      const players = game.players.players.filter((p) => p.userId !== this.userId);
      const targetPlayer = players.reduce(
        (minPlayer, player) => (player.hand.length < minPlayer.hand.length ? player : minPlayer),
        players[0]
      );

      game.placeCard(this.userId, [cardIndex], targetPlayer.userId);
      return;
    }

    if (game.drawPending !== 0) {
      // find a draw card
      const drawCard = this.hand.find((card) => card.type === 'drawTwo' || card.type === 'wildDrawFour');
      if (drawCard) {
        game.placeCard(this.userId, [this.hand.indexOf(drawCard)]);
        return;
      }
      // do nothing as the game only expects a draw card to be placed if one is available
    }

    // TODO
    // If they player is an AI player some additional conditions must be checked.
    // An ai player must be able to jump in, declare their last card, catch other
    // players out on declaring their last card, and stacking cards.

    // if none of the above conditions are met, play the first playable card
    game.placeCard(this.userId, [cardIndex]);
  }
}

class HumanPlayer extends Player {
  constructor(userId, displayName, ws) {
    super(userId, displayName, ws);
  }
}

class AIPlayer extends Player {
  constructor(userId) {
    const displayName = AIPlayer.generateName();
    super(userId, displayName);
    this.isAI = true;
  }

  static generateName() {
    const firstNames = [
      'Walter',
      'Jesse',
      'Tony',
      'Bruce',
      'Frodo',
      'Arthur',
      'Sherlock',
      'Hannibal',
      'Mario',
      'Darth',
      'Luke',
      'Indiana',
      'Bilbo',
      'Vincent',
      'Don',
      'Rick',
      'Morty',
      'Jon',
      'Arya',
      'Neo',
      'James',
      'Emily',
      'Michael',
      'Sarah',
      'David',
      'Emma',
      'John',
      'Olivia',
      'Daniel',
      'Sophia',
      'Alice',
      'Bob',
      'Charlie',
      'David',
      'Eve',
      'Grace',
      'Henry',
      'Isabella',
      'Jack',
      'Liam',
    ];

    const lastNames = [
      'White',
      'Pinkman',
      'Stark',
      'Wayne',
      'Baggins',
      'Dent',
      'Holmes',
      'Lecter',
      'Mario',
      'Vader',
      'Skywalker',
      'Jones',
      'Baggins',
      'Vega',
      'Corleone',
      'Sanchez',
      'Smith',
      'Lannister',
      'Targaryen',
      'Anderson',
      'Brown',
      'Taylor',
      'Wilson',
      'Moore',
      'Clark',
      'Jackson',
      'Lee',
      'Martin',
      'Thompson',
      'Harris',
      'Garcia',
      'Miller',
      'Davis',
      'Roberts',
      'Adams',
      'Nelson',
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
  }
}

module.exports = {
  HumanPlayer,
  AIPlayer,
};
