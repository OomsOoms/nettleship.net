const Card = require('./Card');
const config = require('./cardPresets/unoConfig');

class Deck {
  constructor() {
    this.cards = [];
    this.discardedCards = [];
    this.config = config;
  }

  get topCard() {
    return this.discardedCards[this.discardedCards.length - 1];
  }

  initialiseDeck(customConfig) {
    const config = customConfig || this.config;

    config.forEach((card) => {
      for (let i = 0; i < card.count; i++) {
        try {
          // type, colour, value (only used for number cards)
          this.cards.push(Card.createCard(card.type, card.colour, card.value).setDeck(this));
        } catch {
          // do nothing if the card is invalid and continue to the next card
        }
      }
    });
    this.#shuffle();
  }

  // instead of selecting a random card from the deck, we can shuffle the deck and pop the last card
  #shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  drawCard(count = 1) {
    // check if no cards are left at all
    if (this.cards.length === 0 && this.discardedCards.length === 0) {
      throw new Error('No cards left');
    }
    const cards = [];
    for (let i = 0; i < count; i++) {
      // reshuffle the deck if there are no cards left
      if (this.cards.length === 0) {
        this.cards = this.discardedCards;
        this.discardedCards = [];
        this.#shuffle();
        // reset any wild cards in the deck to null
        this.cards.forEach((card) => {
          if (card.type === 'wild' || card.cotypelour === 'wildDrawFour') {
            card.colour = null;
          }
        });
      }
      // pop the last card from the deck
      cards.push(this.cards.pop());
    }
    return cards;
  }

  discardCard(card) {
    if ((!card) instanceof Card) {
      throw new Error('Invalid card');
    }
    // if the discard pile is empty the first card can be any card
    if (this.discardedCards.length === 0) {
      this.discardedCards.push(card);
      return;
    }
    if (card.isPlayable()) {
      this.discardedCards.push(card);
      return;
    }
    throw new Error('Card is not playable');
  }
}

module.exports = Deck;
