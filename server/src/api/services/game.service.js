const Game = require('./game/Game');
const { User } = require('../models');
const { Error } = require('../helpers');

const games = {};

async function createGame(type, broadcastGameState) {
    switch (type) {
        default:   
            const game = new Game(broadcastGameState);
            games[game.gameCode] = game;
            return game.gameCode;
    }
}

async function getGameByCode(gameCode, exists) {
    const game = games[gameCode];
    if (!game) throw Error.gameNotFound();
    if (exists) {
        return !!game;
    }
    return game;
}

async function getGames(query) {
    let filteredGames = Object.values(games);
    // remove private games
    filteredGames = filteredGames.filter(game => game.settings.public);

    if (query.status) {
        filteredGames = filteredGames.filter(game => game.status === query.status);
    }

    if (query.gameType) {
        filteredGames = filteredGames.filter(game => game.gameType === query.gameType);
    }

    if (query.maxPlayers) {
        filteredGames = filteredGames.filter(game => game.maxPlayers === Number(query.maxPlayers));
    }

    if (query.page && query.limit) {
        const start = query.page * query.limit;
        filteredGames = filteredGames.slice(start, start + query.limit);
    }

    if (query.search) {
        // Split the search query into individual terms
        const searchTerms = query.search.split(' ');

        // Filter games based on the search terms
        filteredGames = filteredGames.filter(game => {
            // Check if any of the search terms match the game keywords
            return searchTerms.every(term => {
                return game.keywords.some(keyword =>
                    String(keyword).toLowerCase().includes(term.toLowerCase())
                );
            });
        });
    }

    if (process.env.NODE_ENV === 'development') {
        return filteredGames;
    } else {
        return filteredGames.map(game => {
            return {
                gameCode: game.gameCode,
                settings: game.settings,
                status: game.status,
                players: game.players.players.length,
            };
        });
    }
}

async function deleteGame(gameCode) {
    if (!games[gameCode]) throw Error.gameNotFound();
    delete games[gameCode];
}

async function handleGameConnection(gameCode, userId, displayName, saveDisplayName, ws) {
    const game = games[gameCode];
    if (!game) throw new Error('Game not found');

    if (saveDisplayName) {
        try {
            const user = await User.findById(userId);
            user.profile.displayName = displayName;
            await user.save();
        } catch (error) {
            // do nothing, this is likely when a guest user tries to save their display name
        }
    }

    // then add the player to the game with the new websocket 
    await game.players.addPlayer(userId, displayName, ws);
    return game;
}

async function handleMessage(gameCode, message, userId) {
    const game = games[gameCode];
    if (!game) throw new Error('Game not found');

    return await game.handleAction(message, userId);
}

async function handleDisconnect(gameCode, userId) {
    const game = games[gameCode];
    if (!game) throw new Error('Game not found');

    await game.players.removePlayer(userId);
}

function getGameState(gameCode, userId) {
    const game = games[gameCode];
    if (!game) throw new Error('Game not found');
    
    return game.getGameState(userId);
}

function getGameConnections(gameCode) {
    const game = games[gameCode];
    if (!game) throw new Error('Game not found');

    const connections = new Map();
    game.players.players.forEach(player => {
        connections.set(player.userId, player.ws);
    });

    return connections;
}

function removeWebSocket(gameCode, userId) {
    const game = games[gameCode];
    if (!game) throw new Error('Game not found');

    const player = game.players.players.find(player => player.userId === userId);
    if (player) {
        player.ws = null;
    }
}

module.exports = {
    createGame,
    getGameByCode,
    getGames,
    deleteGame,
    handleGameConnection,
    handleMessage,
    handleDisconnect,
    getGameState,
    getGameConnections,
    removeWebSocket,
};