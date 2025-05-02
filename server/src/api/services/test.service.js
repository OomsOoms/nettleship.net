const { Test } = require('../models');
const { Error } = require('../helpers');

async function helloWorld() {
    //return await Test.findOne();
    throw Error.BadRequest('This is a test error');
}

module.exports = {
    helloWorld
};