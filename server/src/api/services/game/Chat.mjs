import { Filter } from 'bad-words';
const filter = new Filter();

export class Chat {
    constructor() {
        this.messages = [];
    }

    addMessage(player, message) {
        message = filter.clean(message);
        const newMessage = {
            player,
            message,
            timestamp: Date.now(),
        };
        this.messages.push(newMessage);
    }

    getMessages() {
        return this.messages;
    }

    clearChat() {
        this.messages = [];
    }
}
