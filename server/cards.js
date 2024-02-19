class Card {
    static Colour = {
        RED: "Red",
        BLUE: "Blue",
        GREEN: "Green",
        YELLOW: "Yellow",
    };
    static ActionType = {
        NUMBER: "Number",
        SKIP: "Skip",
        DRAW: "Reverse",
        WILD: "DrawTwo",
        REVERSE: "Wild",
    };
    constructor(actionType, actionName, Colour, Behaviour, Score) {
        this.actionType = actionType;
        this.actionName = actionName;
        this.Colour = Colour;
        this.Behaviour = Behaviour;
        this.Score = Score;
    };
    static number(colour, number) {
        function behaviour(gameObject) {
            console.log(`Behavious of ${number} ${colour} running`)
        }
        return new Card(Card.ActionType.NUMBER, number.toString(), colour, behaviour, number)
    }
    static skip(colour) {
        function behaviour(gameObject) {
            console.log(`Behavious of skip ${colour} running`)
            gameObject.nextPlayer()
        }
        return new Card(Card.ActionType.SKIP, 'Skip', colour, behaviour, 20)
    }
    static reverse(colour) {
        function behaviour(gameObject) {
            console.log(`Behavious of reverse ${colour} running`)
            gameObject.direction = gameObject.direction * -1
            gameObject.nextPlayer(2)
        }
        return new Card(Card.ActionType.REVERSE, 'Reverse', colour, behaviour, 20)
    }
    static draw(colour, number) {
        function behaviour(gameObject) {
            console.log(`Behavious of draw ${number} ${colour} running`)
            for (let i = 0; i < number; i++) {
                //code to draw a card
            }
        }
        return new Card(Card.ActionType.DRAW, `Draw${number}`, colour, behaviour, 20)
    }
    static wild() {
        function behaviour(gameObject) {
            console.log(`Behavious of wild running`)
        }
        return new Card(Card.ActionType.WILD, 'Wild', null, behaviour, 40)
    }
    static wildDraw(number) {
        function behaviour(gameObject) {
            console.log(`Behavious of wild draw ${number} running`)
            for (let i = 0; i < number; i++) {
                //code to draw a card
            }
        }
        return new Card(Card.ActionType.WILD, `WildDraw${number}`, null, behaviour, 50)
    }
}

// EXAMPLES
// The static methods for each card pretty much autofills this data
//const card = new Card(Card.ActionType.NUMBER, '1', Card.Colour.RED, 'behaviour', 1)
//console.log(card);
//
//const card2 = Card.number(Card.Colour.BLUE, 2);
//console.log(card2)

const classicCards = [];

for (const col in Card.Colour) {
    for (let i = 0; i < 2; i++) {
        // Numbers 1-9, 2 of each colour: 72
        for (let num = 1; num <= 9; num++) {
            classicCards.push(Card.number(col, num));
        }
        // Skip, Draw2, Reverse, 2 of each colour: 24
        classicCards.push(Card.skip(col));
        classicCards.push(Card.draw(col, 2));
        classicCards.push(Card.reverse(col));
    }
    // Wild, WildDraw4, Number0, 4 of each: 12
    classicCards.push(Card.wild());
    classicCards.push(Card.wildDraw(4));
    classicCards.push(Card.number(col, 0));
}

module.exports = classicCards;
