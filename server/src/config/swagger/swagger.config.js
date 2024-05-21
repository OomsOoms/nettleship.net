const swaggerJSDoc = require('swagger-jsdoc');
const yaml = require('js-yaml');
const fs = require('fs');

// eslint-disable-next-line no-undef
const path = yaml.load(fs.readFileSync(__dirname + '/user.yml', 'utf8'));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Title',
      version: '1.0.0',
      description: 'API documentation for your Node.js application',
    },
    tags: [
      {
        name: 'users',
        description: 'Endpoints for user registration and authentication',
      },
    ],
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
    ...path,
  },
  apis: ['src/api/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
