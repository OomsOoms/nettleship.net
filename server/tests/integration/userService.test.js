const request = require('supertest');
const app = require('../../src/app');
const { User } = require('../../src/api/models');
const { generateJwt } = require('../../src/api/helpers');

/**
 * Mongodb memory server is used, emails are not sent, filesystem is used instead of AWS S3
 * 
 * Each test is isolated, the database is cleared and a new user created before each test
 * I am not testing every possible edge case, only the most important ones plus request validation, as this should be done in unit tests
 * 
 * getting the auth cookie relies on another route, this is not ideal, but it is the easiest way to get a valid cookie
 */

const username = 'test_user';
const email = 'test@example.com';
const password = 'Password123';
let authCookie;
let user

beforeEach(async () => {
    await User.deleteMany({});
    user = new User({ username, newEmail: email, password });
    await user.save();
    const res = await request(app)
        .post('/api/sessions')
        .send({ loginIdentifier: username, password });
    authCookie = res.headers['set-cookie'][0];
});

describe('PATCH /api/users/verify', () => {
    it('should verify a user', async () => {
        const token = generateJwt({ id: user.id }, { expiresIn: '24h' });
        const res = await request(app)
            .patch('/api/users/verify')
            .set('Authorization', `Bearer ${token}`)
            .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Email verified');
    });

    it('should return 401 for invalid JWT token', async () => {
        const invalidToken = 'invalidToken';
        const res = await request(app)
            .patch('/api/users/verify')
            .set('Authorization', `Bearer ${invalidToken}`)
            .send();
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Invalid token');
    });

    it('should return 401 for expired JWT token', async () => {
        const expiredToken = generateJwt({ id: user.id }, { expiresIn: '1ms' });
        const res = await request(app)
            .patch('/api/users/verify')
            .set('Authorization', `Bearer ${expiredToken}`)
            .send();
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Invalid token');
    });

    it('should return 400 for missing JWT token', async () => {
        const res = await request(app)
            .patch('/api/users/verify')
            .send();
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Token is required');
    });
});

describe('POST /api/users/verify', () => {
    it('should request a new verification email', async () => {
        const res = await request(app)
            .post('/api/users/verify')
            .send({
                email
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Verification email sent');
    });
});

describe('GET /api/users', () => {
    it('should return all users', async () => {
        // make the user an admin
        user.profile.roles.push('admin');
        await user.save();

        const res = await request(app)
            .get('/api/users')
            .set('Cookie', authCookie);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(1);
    });

    it('should return 401 for unauthorized access', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Cookie', authCookie);
        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('message', 'User is not an admin');
    });  
});

describe('GET /api/users/:username', () => {
    it('should get a user by username', async () => {
        const res = await request(app).get(`/api/users/${username}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('username', username);
    });
});

describe('POST /api/users', () => {
    it('should create a new user', async () => {
        const res = await request(app)
        .post('/api/users')
        .send({
            username: 'new_user',
            email: 'newtest@example.com',
            password: 'Password123'
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully, check your email');
    });

    it('should return 400 for an invalid username email and password', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({
                username: 'Invalid',
                email: 'invalidexample.com',
                password: 'password'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message');
        expect(Array.isArray(res.body.message)).toBe(true);
        expect(res.body.message.length).toBe(3);
    });
});

describe('PATCH /api/users/:username', () => {
    // No need to test everything, as this should be done in unit tests, as long as the auth works it is fine
    it('should update a user', async () => {
        const res = await request(app)
        .patch(`/api/users/test_user`)
        .set('Cookie', authCookie)
        .send({
            email: 'newemail@example.com',
            'profile.displayName': 'New Name'
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('changes.email.value', 'newemail@example.com');
    });
    
    it('should return 400 for invalid fields', async () => {
        const res = await request(app)
        .patch(`/api/users/test_user`)
        .set('Cookie', authCookie)
        .send({
            invalidField: 'value'
        });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Invalid fields: invalidField');
    });
});

describe('DELETE /api/users/:username', () => {
    // No need to test everything, as this should be done in unit tests, as long as the auth works it is fine
    it('should delete a user', async () => {
        const res = await request(app)
        .delete(`/api/users/test_user`)
        .set('Cookie', authCookie)
        .send({
            password: 'Password123'
        });
        expect(res.statusCode).toEqual(204);
    });
});
