const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../../config/swagger');
const userRoutes = require('./user.routes');
const sessionRoutes = require('./session.routes');

module.exports = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api/users', userRoutes);
  app.use('/api/sessions', sessionRoutes);
};
