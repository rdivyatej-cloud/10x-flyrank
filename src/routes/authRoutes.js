const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login); // Note: Simple rate limiting could be added here later if needed
router.get('/me', authMiddleware, getMe);

module.exports = router;
