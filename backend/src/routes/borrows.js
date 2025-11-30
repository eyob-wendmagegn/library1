// src/routes/borrows.js
import express from 'express';
import {
  borrowBook,
  returnBook,
  getAllBorrows,
  getBorrowByUser,
} from '../controllers/borrowController.js';
import { protect, adminOrLibrarian } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/borrow', protect, borrowBook);
router.post('/return', protect, returnBook);
router.get('/', protect, adminOrLibrarian, getAllBorrows);
router.post('/my', protect, getBorrowByUser); // NEW: View own borrow by ID + username

export default router;