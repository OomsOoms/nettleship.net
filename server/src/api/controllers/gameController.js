const gameService = require('../services/gameService');

class gameController {

    static createGame = async (req, res) => {
        try {
            const { name, uuid, password } = req.body;
            const userDetails = await gameService.createGame({ name, uuid, password });
            return res.status(200).json(userDetails);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    static findPublicGames = async (req, res) => {
        try {
            const publicGames = await gameService.findPublicGames();
            res.status(200).json(publicGames);
        } catch (error) {
            // Handle any errors that occur during the execution of the asynchronous function
            console.error('Error fetching public games:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

}

module.exports = gameController;
