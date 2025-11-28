import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import { uploadReceipt, getPayments, approvePayment, rejectPayment } from '../controllers/paymentController.js';

const router = express.Router();

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/receipts';
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Seules les images (jpeg, jpg, png) et PDF sont autorisés.'));
    }
});

// Routes
router.post('/upload', authenticateToken, upload.single('receipt'), uploadReceipt);
router.get('/', authenticateToken, isAdmin, getPayments);
router.put('/:id/approve', authenticateToken, isAdmin, approvePayment);
router.put('/:id/reject', authenticateToken, isAdmin, rejectPayment);

export default router;
