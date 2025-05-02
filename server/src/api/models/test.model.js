const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
    helloWorld: {
        type: String,
        default: 'Hello world from the database'
    }
});

const Test = mongoose.model('Test', TestSchema);

module.exports = Test;