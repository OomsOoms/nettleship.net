const { v4: uuidv4 } = require('uuid');

class Player {
    constructor(name) {
        this.uuid = uuidv4();
        this.name = name;
        this.gameCode = null;
    }
}

module.exports = Player;
