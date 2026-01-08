const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/assistantController');
const { protect } = require('../middlewares/auth');

// AI assistant chat / translation
router.post('/chat', protect, chat);

module.exports = router;
