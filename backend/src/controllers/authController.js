// controllers/authController.js
import { connectDB } from '../config/db.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

// ------------------------------------------------------------
// 1. FIRST LOGIN: username + ID
// ------------------------------------------------------------
const firstLoginSchema = Joi.object({
  username: Joi.string().required(),
  id: Joi.string().required(),
});

export const firstLogin = async (req, res) => {
  const { error, value } = firstLoginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({
      username: value.username,
      id: value.id,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    if (user.passwordChanged) {
      return res.status(400).json({ message: 'Use your password to login.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, action: 'first-change' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ token, message: 'First login – please set your password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// 2. CHANGE PASSWORD (FIRST TIME – via token)
// ------------------------------------------------------------
const changePwdSchema = Joi.object({
  username: Joi.string().required(),
  id: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

export const changePassword = async (req, res) => {
  const { error, value } = changePwdSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({
      username: value.username,
      id: value.id,
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.passwordChanged) return res.status(400).json({ message: 'Password already changed' });

    const hashed = await hashPassword(value.newPassword);

    await db.collection('users').updateOne(
      { id: value.id },
      { $set: { password: hashed, passwordChanged: true } }
    );

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// 3. NORMAL LOGIN – ADMIN ALWAYS ALLOWED
// ------------------------------------------------------------
const normalLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const login = async (req, res) => {
  const { error, value } = normalLoginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ username: value.username });

    if (!user) return res.status(401).json({ message: 'Invalid username or password' });

    // DEACTIVATED: BLOCK NON-ADMIN
    if (user.status === 'deactive' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Your account is deactivated. Contact admin.' });
    }

    if (!user.passwordChanged) {
      return res.status(403).json({ message: 'Please set your password using username + ID first.' });
    }

    const match = await comparePassword(value.password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid username or password' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      id: user.id,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// 4. CHANGE PASSWORD AFTER LOGIN (PROTECTED)
// ------------------------------------------------------------
const changePwdAfterLoginSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

export const changePasswordAfterLogin = async (req, res) => {
  const { error, value } = changePwdAfterLoginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const db = await connectDB();

    // req.user.id comes from protect middleware
    const user = await db.collection('users').findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify old password
    const isMatch = await comparePassword(value.oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Old password is incorrect' });

    // Hash new password
    const hashed = await hashPassword(value.newPassword);

    // Update password
    await db.collection('users').updateOne(
      { id: req.user.id },
      { $set: { password: hashed } }
    );

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};