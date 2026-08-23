const express = require('express');
const { generateReport } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', generateReport);

module.exports = router;
