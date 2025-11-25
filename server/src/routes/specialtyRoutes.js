import express from 'express';
import { getSpecialties, createSpecialty, updateSpecialty, deleteSpecialty } from '../controllers/specialtyController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Get all specialties (for registration)
router.get('/', getSpecialties);

// Admin only: CRUD
router.post('/', authenticateToken, isAdmin, createSpecialty);
router.put('/:id', authenticateToken, isAdmin, updateSpecialty);
router.delete('/:id', authenticateToken, isAdmin, deleteSpecialty);

export default router;
