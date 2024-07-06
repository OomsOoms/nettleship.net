const request = require('supertest');
const app = require('../src/index');
const crypto = require('crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function dbConnect() {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log(uri);
}
async function dbDisconnect() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
}
let savedEmailText; // Variable to hold the captured email text

jest.mock('nodemailer', () => {
    const nodemailerMock = {
        sendMail: jest.fn((mailOptions, callback) => {
            savedEmailText = mailOptions.text; // Capture the email text
            callback(null, {
                response: '250 Message accepted',
            });
        }),
    };
    return {
        createTransport: jest.fn(() => nodemailerMock),
    };
});

// Runs once before all tests are executed
beforeAll(async () => dbConnect());
// Runs once after all tests are complete
afterAll(async () => dbDisconnect());

describe('POST /api/users', () => {
    // normal test
    it('should successfully register a new user', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({
                username: 'testuser',
                email: 'test@test.com',
                password: 'testpassword',
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User created successfully, email verification link sent and will expire in 10 minutes');
    });

    // erroneous test
    it('should fail to register a new user with duplicate username', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({
                username: 'testuser',
                email: 'test@test.com',
                password: 'testpassword',
            });
        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error', 'Username already exists');
    });

    // erroneous test
    it('should fail to register a new user with duplicate email', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({
                username: 'testuser2',
                email: 'test@test.com',
                password: 'testpassword',
            });
        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error', 'Email already exists');
    });

    // erroneous test
    it('should fail to register a new user with missing fields', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({
                username: 'testuser',
                password: 'testpassword',
            });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors[0]).toHaveProperty('msg', 'Email is required');        
    });

    // erroneous test
    it('should fail to register a new user with details that are too short', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({
                username: '12',
                email: 'a@b.c',
                password: '1234567',
            });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors[0]).toHaveProperty('msg', 'Username must be at least 3 characters long');
        expect(response.body.errors[1]).toHaveProperty('msg', 'Email must be at least 6 characters long');
        expect(response.body.errors[2]).toHaveProperty('msg', 'Password must be at least 8 characters long');
    }); 

    // boundary test
    it('should successfully register a new user with minimum details', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({
                username: '123',
                email: 'a@b.cd',
                password: '12345678',
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User created successfully, email verification link sent and will expire in 10 minutes');
    });

    // boundary test
    it('should successfully register a new user with maximum details', async () => {
        const localPart = crypto.randomBytes(32).toString('hex'); // 32 bytes * 2 characters per byte = 64 characters
        const domainPart = '12.com'; // 6 characters
        const email = `${localPart}@${domainPart}`; // 71 characters total
        const password = crypto.randomBytes(64).toString('hex'); // 64 bytes * 2 characters per byte = 128 characters total
        const response = await request(app)
            .post('/api/users')
            .send({
                username: '12345678901234567890', // 20 characters
                email: email,
                password: password,
            });;
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User created successfully, email verification link sent and will expire in 10 minutes');
    });

    // erroneous test
    it('should fail to register with defails that are too long', async () => {
        const localPart = crypto.randomBytes(32).toString('hex'); // 32 bytes * 2 characters per byte = 64 characters
        const domainPart = '123.com'; // 7 characters
        const email = `${localPart}@${domainPart}`; // 72 characters total
        const password = crypto.randomBytes(64).toString('hex') + 'a'; // 64 bytes * 2 characters per byte + 1 = 129 characters total
        const response = await request(app)
            .post('/api/users')
            .send({
                username: '123456789012345678901', // 21 characters
                email: email,
                password: password,
            });;
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors[0]).toHaveProperty('msg', 'Username must be at most 20 characters long');
        expect(response.body.errors[1]).toHaveProperty('msg', 'Email must be at most 71 characters long');
        expect(response.body.errors[2]).toHaveProperty('msg', 'Password must be at most 128 characters long');
    });
});

describe('GET /api/users/verify', () => {
    // Shouldn't need to test if the user doesn't exist because the JWT expires before mongo db deletes an unverified user
    // Testing expired JWT is probbaly more fitting as a unit test not an integration test

    // normal test
    it('should successfully verify a user', async () => {
        expect(savedEmailText).toBeDefined();
        const token = savedEmailText.match(/token=(.*)/)[1];
        const response = await request(app)
            .get(`/api/users/verify?token=${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Email verified');
    });

    // erroneous test
    it('should fail to verify a user with an invalid token', async () => {
        const response = await request(app)
            .get('/api/users/verify?token=invalidtoken');
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    // erroneous test
    it('should fail to verify an already verified user', async () => {
        expect(savedEmailText).toBeDefined();
        const token = savedEmailText.match(/token=(.*)/)[1];
        const response = await request(app)
            .get(`/api/users/verify?token=${token}`);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'User not found or already verified');
    });
});

describe('POST /api/users/verify', () => {
    // normal test
    it('should successfully request verification and receive an email', async () => {
        const response = await request(app)
            .post('/api/users/verify')
            .send({
                email: 'test@test.com'
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Verification email sent');
        expect(savedEmailText).toBeDefined();
    });
});