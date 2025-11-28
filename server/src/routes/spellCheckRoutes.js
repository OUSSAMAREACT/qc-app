const express = require('express');
const router = express.Router();
const spellCheckController = require('../controllers/spellCheckController');
const { requireAuth, requireSuperAdmin } = require('../middleware/authMiddleware');

// All routes require Super Admin access
router.use(requireAuth);
router.use(requireSuperAdmin);

router.get('/scan', spellCheckController.scanQuestions);
router.post('/ignore', spellCheckController.ignoreWord);

module.exports = router;
