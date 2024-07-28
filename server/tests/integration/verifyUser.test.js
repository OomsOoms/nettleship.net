const request = require('supertest');
const app = require('../../src/index');
const { User } = require('../../src/api/models');
const { generateJwt } = require('../../src/api/helpers');

let token = '';
let user = null;
beforeEach(async () => {
  // Clear the database before each test
  await User.deleteMany({});
  user = new User({
    username: 'username',
    email: 'test@example.com',
    password: 'password',
  });
  await user.save();
  token = generateJwt({ id: user._id }, { expiresIn: '10m' });
});

describe('GET /api/users/verify', () => {
  it('should activate user account with valid token', async () => {
    const response = await request(app).get(`/api/users/verify?token=${token}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Email verified');
  });

  it('should return an error with invalid token', async () => {
    const response = await request(app).get(
      '/api/users/verify?token=invalidToken'
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid token');
  });

  it('should return an error with no token', async () => {
    const response = await request(app).get('/api/users/verify');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid token');
  });

  it('should return an error if user is already verified', async () => {
    user.active = true;
    await user.save();
    console.log(user);
    const token = generateJwt({ id: user._id }, { expiresIn: '10m' });
    const response = await request(app).get(`/api/users/verify?token=${token}`);
    console.log(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already verified');
  });
});

describe('POST /api/users/verify', () => {
  it('should email a new verification link to user', async () => {
    const response = await request(app)
      .post('/api/users/verify')
      .send({ email: 'test@example.com' });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Verification email sent');
    // should check if the email was sent? seems like effort though and if i write a unit test for the email function then i would be testing it twice
  });

  it('should return an error if user is already verified', async () => {
    user.active = true;
    await user.save();
    const response = await request(app)
      .post('/api/users/verify')
      .send({ email: 'test@example.com' });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already verified');
  });

  it('should return an error if user does not exist', async () => {
    const response = await request(app)
      .post('/api/users/verify')
      .send({ email: 'notfound@example.com' });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should return an error if no email is provided', async () => {
    const response = await request(app).post('/api/users/verify').send({});
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe('Email is required');
  });

  it('should return an error if email is invalid', async () => {
    const response = await request(app)
      .post('/api/users/verify')
      .send({ email: 'invalidemail' });
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe('Invalid email');
  });
});
