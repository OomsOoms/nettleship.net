const testRoutes = require('./test.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const gameSessionRoutes = require('./game.routes');

module.exports = (app) => {
    app.use('/api/tests', testRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/games', gameSessionRoutes);
}