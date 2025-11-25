import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

router.get('/', userController.getUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
