const{ testService } = require('../services');

async function helloWorld(req, res) {
    res.status(404).send(await testService.helloWorld());
}

module.exports = {
    helloWorld
};