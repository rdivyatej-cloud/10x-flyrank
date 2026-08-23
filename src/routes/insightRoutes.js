const express = require('express');
const { generateInsights } = require('../controllers/insightController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', generateInsights);

module.exports = router;
