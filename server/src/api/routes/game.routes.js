const router = require('express-promise-router')();

const { gameSessionController: gc } = require('../controllers');
const { gameSessionValidationRules: gvr } = require('../validations');

router
  // HTTP routes
  .post('/', gvr.createGame, gc.createGame)
  .get('/:gameCode', gvr.getGameByCode, gc.getGameByCode)
  .get('/', gvr.getGames, gc.getGames)
  .delete('/:gameCode', gvr.deleteGame, gc.deleteGame)

  // Websocket routes
  .ws('/:gameCode', gc.handleGameConnection);

module.exports = router;
