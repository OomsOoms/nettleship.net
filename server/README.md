
# Server

This is the API backend for the Nettleship.net website, built with Express and MongoDB.

## Project Structure

- `src/`: Contains the main application code.
- `tests/`: Contains unit and integration tests.
- `logs/`: Contains log files.
- `public/`: Contains public assets like uploads when in development. Production uses AWS S3 + cloudfront.

## Getting Started

## API Documentation

For detailed API documentation, please refer to the [OpenAPI Specification](./src/config/swagger/swagger.yaml). You can interact with this specification using swagger when the server is online on the `/docs` endpoint 

### Environment Variables

To configure your environment settings, create `.env.development` and `.env.production` files based on the provided `.env.example`. If you're using a non-local MongoDB instance, update the `MONGODB_URI` variable accordingly. Additionally, ensure the Google Configuration is set in both environments. The remaining values are suitable for development as is. Note that hCaptcha keys are set to the test keys. For more information, refer to the [hCaptcha documentation](https://docs.hcaptcha.com/#integration-testing-test-keys).

1. Create `.env.development` and `.env.production` files based on `.env.example`:

    ```sh
    cp .env.example .env.development
    cp .env.example .env.production
    ```

### Running the Server

All the default values in the .env should work, as long as you insure your mongodb is set up properly

1. Start the development server:

    ```sh
    npm run dev
    ```

2. The server will be running on http://localhost:8000.

## Development

### NODE_ENV Usage

The `NODE_ENV` environment variable is used in several places throughout the code. It is important to document where it is used as this code can be put into production without testing (I should probably write tests for these)

1. **Logging Configuration**:
   - File: [src/config/logger.js](src/config/logger.js)
   - Effect: In non-production environments, only console logging is enabled. In production, file logging is used.

2. **Request Validation**:
   - File: [src/api/middlewares/validateRequest.js](src/api/middlewares/validateRequest.js)
   - Effect: In production, a generic error message is returned for invalid requests. In other environments, detailed validation errors are returned.

3. **hCaptchaToken Verification**:
   - File [src/api/middlewares/verifyCaptcha.js](src/api/middlewares/verifyCaptcha.js)
   - Effect: In production, the hCaptcha token is verified and an error returned if it is invalid.

4. **Database Connection**:
   - File: [src/config/db.js](src/config/db.js)
   - Effect: In test environments, an in-memory MongoDB server is used. In other environments, the database URI from the environment variables is used.

5. **Server Configuration**:
   - File: [src/app.js](src/app.js)
   - Effect: In production, HTTP request logs are written to a file. In other environments, logs are output to the console.

### Testing

I have used Jest for the server tests.

Unit tests will mock all functions before the tests.
Intergration tests will use MongoDB Memory Server.

to run the tests:

```sh
npm test
```

### Test Suites

Here is an overview of what each test covers:

- **Test name**: Test description

(still need to redo tests before adding them here)

### Linting

I have used ESLint for linting.

To lint the code:

```sh
npm run lint
```

To automatically fix linting errors:

```sh
npm run lint:fix
```