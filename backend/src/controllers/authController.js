import { connectDB } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { ObjectId } from 'mongodb';

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const resetSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().min(6).required(),
});

export const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const db = await connectDB();
  const user = await db.collection('users').findOne({ username: value.username });

  if (!user) return res.status(401).json({ message: 'Invalid username or password' });

  const match = await comparePassword(value.password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid username or password' });

  const needsReset = !user.passwordChanged;

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, needsReset },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    role: user.role,
    needsReset,
    name: user.name,
  });
};

export const resetPassword = async (req, res) => {
  const { error, value } = resetSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  let payload;
  try {
    payload = jwt.verify(value.token, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  if (value.newPassword !== value.confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const db = await connectDB();
  const hashed = await hashPassword(value.newPassword);

  const result = await db.collection('users').updateOne(
    { _id: new ObjectId(payload.id) },
    { $set: { password: hashed, passwordChanged: true } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ message: 'Password updated successfully' });
};