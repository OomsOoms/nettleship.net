const { swaggerSpec, swaggerUi } = require('../../config/swagger/swagger');
const userRoutes = require('./user.routes');
const sessionRoutes = require('./session.routes');
const authRoutes = require('./auth.routes');

module.exports = (app) => {
  if (process.env.NODE_ENV === 'development') {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
  app.use('/api/users', userRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/auth', authRoutes);
};
