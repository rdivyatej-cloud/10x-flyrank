const request = require('supertest');
const app = require('../src/server');
const db = require('../src/database/db');

// Mock the database
jest.mock('../src/database/db', () => ({
  query: jest.fn(),
}));

describe('Smart Expense Tracker API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('Auth API', () => {
    it('should fail registration without all fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'test@test.com' });
      expect(res.statusCode).toEqual(400);
    });

    it('should fail login without credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.statusCode).toEqual(400);
    });
  });
  
  describe('Protected Routes', () => {
    it('should block access to /api/expenses without token', async () => {
      const res = await request(app).get('/api/expenses');
      expect(res.statusCode).toEqual(401);
    });
  });
});
