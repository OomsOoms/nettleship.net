const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const gameSessionRoutes = require('./game.routes');

module.exports = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/games', gameSessionRoutes);
};
