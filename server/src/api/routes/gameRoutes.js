const express = require('express');
const router = express.Router();

const gameController = require('../controllers/gameController');

router.route('/')
    .post(gameController.createGame)
    .get(gameController.findPublicGames);
//
//router.route('/:id')
//    .get(gameController.getGame)
//
//router.route('/:id/join')
//    .post(gameController.joinGame);
//
//router.route('/:id/start')
//    .put(gameController.startGame);

module.exports = router;
