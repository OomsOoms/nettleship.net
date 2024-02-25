const express = require('express');
app = express();
const PORT = process.env.PORT || 8000;

// for parsing application/json
app.use(express.json());

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/games', require('./api/routes/gameRoutes'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));