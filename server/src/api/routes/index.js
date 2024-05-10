const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../../config/swagger.js');
const userRoutes = require('./userRoutes.js');

module.exports = (app) => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use('/api/users', userRoutes);
};