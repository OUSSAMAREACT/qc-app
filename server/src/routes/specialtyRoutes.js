import express from 'express';
import { getSpecialties, createSpecialty, updateSpecialty, deleteSpecialty } from '../controllers/specialtyController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Get all specialties (for registration)
router.get('/', getSpecialties);

// Admin only: CRUD
router.post('/', authenticateToken, requireAdmin, createSpecialty);
router.put('/:id', authenticateToken, requireAdmin, updateSpecialty);
router.delete('/:id', authenticateToken, requireAdmin, deleteSpecialty);

export default router;
