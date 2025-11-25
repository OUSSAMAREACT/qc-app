import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, isAdmin);

router.get('/', userController.getUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
