const { body, param, query } = require('express-validator');

const validateRequest = require('./validateRequest');

const createGame = [body('type').optional().isIn(['uno']).withMessage('Game type must be uno'), validateRequest];

const getGameByCode = [
  param('gameCode').isInt({ min: 100000, max: 999999 }).withMessage('Game code must be a 6 digit integer'),
  validateRequest,
];

const getGames = [
  query('status').optional().isIn(['lobby', 'inProgress']).withMessage('Status must be either lobby or inProgress'),
  query('gameType').optional().isIn(['uno']).withMessage('Game type must be either uno or game2'),
  query('maxPlayers').optional().isInt({ min: 2 }).withMessage('Player count must be an integer greater than 0'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be an integer greater than 0'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than 0'),
  validateRequest,
];

const deleteGame = [
  async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'You are not logged in' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorised to delete a game' });
    }
    next();
  },
  param('gameCode').isInt({ min: 100000, max: 999999 }).withMessage('Game ID must be a 6 digit integer'),
  validateRequest,
];

// this does not work at all but its in the docs anyway becuase fuck this shit
const joinGame = [
  //body('gameId').isInt({ min: 100000, max: 999999 }).withMessage('Game ID must be a 6 digit integer'),
  validateRequest,
];

module.exports = {
  createGame,
  getGameByCode,
  getGames,
  deleteGame,
  joinGame,
};
