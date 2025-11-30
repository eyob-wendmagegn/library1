// routes/auth.js
import express from 'express';
import { 
  firstLogin, 
  changePassword, 
  login,
  changePasswordAfterLogin   // ← NEW
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';   // ← protect

const router = express.Router();

router.post('/first-login', firstLogin);                    // username + ID
router.post('/change-password', changePassword);            // first-time set password
router.post('/login', login);                               // normal login

// NEW: Protected endpoint for changing password after login
router.post('/change-password-after-login', protect, changePasswordAfterLogin);

export default router;