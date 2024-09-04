const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Load the YAML file
const swaggerSpec = yaml.load(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8'));

module.exports = {
  swaggerSpec,
  swaggerUi,
};
