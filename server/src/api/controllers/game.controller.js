const { gameSessionService } = require('../services');

async function createGame(req, res) {
    const { type } = req.body;
    const gameCode = await gameSessionService.createGame(type, broadcastGameState);
    res.status(201).json({ gameCode });
}

async function getGameByCode(req, res) {
    const { gameCode } = req.params;
    const exists = req.query.exists === 'true';
    const game = await gameSessionService.getGameByCode(gameCode, exists);
    res.status(200).json(game);
}

async function getGames(req, res) {
    const filteredGames = await gameSessionService.getGames(req.query);
    res.status(200).json(filteredGames);
}

async function deleteGame(req, res) {
    const { gameCode } = req.params;
    await gameSessionService.deleteGame(gameCode);
    res.status(204).send();
}

const disconnectTimers = new Map();


function broadcastGameState(gameCode, type) {
    // get all connections for the game 
    const connections = gameSessionService.getGameConnections(gameCode);

    if (connections) {
        // log the players to check if they are there
        // get the player id from the key and ws from the value 
        connections.forEach((ws, playerId) => {
            if (ws) {
                // get the game state for the player
                const gameState = gameSessionService.getGameState(gameCode, playerId);
                
                const message = {
                    type,
                    gameState,
                };
                // send the game state to the player
                ws.send(JSON.stringify(message));
            }
        })
    }
}

const chats = new Map();

async function handleGameConnection(ws, req) {
    const { gameCode } = req.params;
    try {
        // get the playerId from the user or the guest session
        const playerId = req.user ? req.user.id : req.session.guestId;
        if (!playerId) throw new Error('Player ID required');
        // get the displayName query or the usre
        const displayName = req.query.displayName || req.user?.displayName;
        if (!displayName) throw new Error('Display name required');

        const saveDisplayName = req.query.saveDisplayName === 'true';

        // check if they are already in the game
        const game = await gameSessionService.getGameByCode(gameCode, false);
        if (!game) throw new Error('Game not found');
        const existingPlayer = game.players.players.find(player => player.userId === playerId);
        if (existingPlayer && existingPlayer.ws) {
            // Mark the old WebSocket as replaced
            existingPlayer.ws.replaced = true;
            existingPlayer.ws.close(); // Close the old WebSocket
        }

        console.log(`Player ${playerId} connected to game ${gameCode} with display name ${displayName}`);
        // handle the game connection
        await gameSessionService.handleGameConnection(gameCode, playerId, displayName, saveDisplayName, ws);

        // dynamic import the Chat class
        const { Chat } = await import('../services/game/Chat.mjs');

        // create a chat for the game if it doesn't exist
        if (!chats.has(gameCode)) {
            chats.set(gameCode, new Chat());
        };
        const chat = chats.get(gameCode);
    
        // when a player joins the game send the whole chat log
        ws.send(JSON.stringify({
            event: 'chatLog',
            chat: chat.messages,
        }));

        // Cancel any pending disconnection for this player
        if (disconnectTimers.has(playerId)) {
            clearTimeout(disconnectTimers.get(playerId));
            disconnectTimers.delete(playerId);
        }

        // broadcast the game state
        broadcastGameState(gameCode, 'playerConnected');

        ws.on('message', async (message) => {
            console.log(`Received message from player ${playerId}: ${message}`);
            try {
                const parsedMessage = JSON.parse(message);
                
                // check if the message is a chat message
                if (parsedMessage.type === 'chatMessage') {
                    // add the chat message to the chat
                    chat.addMessage(displayName, parsedMessage.message);
                    // broadcast the chat message
                    const connections = gameSessionService.getGameConnections(gameCode);
                    connections.forEach((ws, playerId) => {
                        if (ws) {
                            ws.send(JSON.stringify({
                                event: 'chatMessage',
                                message: chat.messages[chat.messages.length - 1],
                            }));
                        }
                    });
                    return;
                }
                
                const response = await gameSessionService.handleMessage(gameCode, parsedMessage, playerId);

                if (response) {
                    // send the response to the player
                    ws.send(JSON.stringify(response));
                }
            } catch (error) {
                ws.send(JSON.stringify({ error: error.message }));
            }
        });

        ws.on('close', async () => {
            const playerId = req.user ? req.user.id : req.session.guestId;
            if (!playerId) return;

            // do nothing if the player is already replaced
            if (ws.replaced) return;

            // create a timeout to handle the disconnect
            const timeout = setTimeout(async () => {
                // after the timeout, disconnect the player and delete the timer
                try {
                    await gameSessionService.handleDisconnect(gameCode, playerId);  
                } catch (error) {
                    // i dont know why this throws error sometimes
                    console.error('Error handling disconnect:', error);
                }
                disconnectTimers.delete(playerId);

                // broadcast the game state
                broadcastGameState(gameCode, 'playerDisconnected');
            }, 10000); // 10 seconds

            // store the timer in the disconnectTimers map
            disconnectTimers.set(playerId, timeout);
        });
    } catch (error) {
        console.log(error);
        ws.close(1000, error.message);
    }
};

module.exports = {
    createGame,
    getGameByCode,
    getGames,
    deleteGame,
    handleGameConnection,
};
