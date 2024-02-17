const express = require('express');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 8000;

app.use(morgan('dev'));

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/api', (req, res) => {
    res.send('API Online');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

