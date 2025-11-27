const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const importController = require('../controllers/importController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/authMiddleware');

// Protect route with Super Admin
router.post('/csv', authenticateToken, requireSuperAdmin, upload.single('file'), importController.importQuestionsFromCSV);

module.exports = router;
