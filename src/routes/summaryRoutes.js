const express = require('express');
const { getSummary } = require('../controllers/summaryController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.get('/', getSummary);

module.exports = router;
