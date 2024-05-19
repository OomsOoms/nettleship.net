const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Title',
      version: '1.0.0',
      description: 'API documentation for your Node.js application',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Local server',
      },
      {
        url: 'https://nettleship.net',
        description: 'Production server',
      },
    ],
  },
  apis: ['src/api/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
