// src/routes/borrows.js
import express from 'express';
import {
  approveRequest,
  borrowBook,
  getAllBorrows,
  getBorrowByUser,
  requestBook,
  returnBook,
} from '../controllers/borrowController.js';
import { adminOrLibrarian, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/request', protect, requestBook); // NEW: Request a book
router.post('/approve', protect, adminOrLibrarian, approveRequest); // NEW: Approve/reject requests
router.post('/borrow', protect, borrowBook);
router.post('/return', protect, returnBook);
router.get('/', protect, adminOrLibrarian, getAllBorrows);
router.post('/my', protect, getBorrowByUser); // NEW: View own borrow by ID + username

export default router;