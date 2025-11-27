import express from 'express';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '../middleware/authMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// All routes require at least admin authentication
router.use(authenticateToken, requireAdmin);

router.get('/', userController.getUsers);
router.put('/:id', requireSuperAdmin, userController.updateUser);
router.delete('/:id', requireSuperAdmin, userController.deleteUser);

export default router;
