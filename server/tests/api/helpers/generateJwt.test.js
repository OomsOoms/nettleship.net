// Import the jsonwebtoken module and mock it
const jwt = require('jsonwebtoken');
const generateJwt   = require('../../../src/api/helpers/generateJwt');

// Mock the jsonwebtoken module
jest.mock('jsonwebtoken', () => ({
   sign: jest.fn(() => 'mocked_token'),
  }));
  
  describe('JWT Sign Function', () => {
   beforeEach(() => {
      // Reset the mock before each test
      jwt.sign.mockClear();
   });
  
   it('should sign a payload with default options', () => {
      const payload = { userId: 1 };
      const secretKey = 'testSecretKey';
      process.env.SECRET_KEY = secretKey;
  
      const token = generateJwt(payload);
  
      expect(jwt.sign).toHaveBeenCalledWith(payload, secretKey, {
        expiresIn: '7d',
        algorithm: 'HS256',
      });
      expect(token).toBe('mocked_token');
   });
  
   it('should sign a payload with overridden options', () => {
      const payload = { userId: 1 };
      const secretKey = 'testSecretKey';
      process.env.SECRET_KEY = secretKey;
      const options = { expiresIn: '1h', algorithm: 'HS512' };
  
      const token = generateJwt(payload, options);
  
      expect(jwt.sign).toHaveBeenCalledWith(payload, secretKey, {
        expiresIn: '1h',
        algorithm: 'HS512',
      });
      expect(token).toBe('mocked_token');
   });
  });
  