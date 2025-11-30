// src/controllers/userController.js
import { connectDB } from '../config/db.js';
import { hashPassword } from '../utils/hash.js';
import Joi from 'joi';

// ------------------------------------------------------------
// CREATE USER (admin only)
// ------------------------------------------------------------
const createSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(2).required(),
  username: Joi.string().min(3).required(),
  role: Joi.string().valid('admin', 'librarian', 'teacher', 'student').required(),
  department: Joi.string().allow('').optional(),
  status: Joi.string().valid('active', 'deactive').default('active'),
});

export const createUser = async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const db = await connectDB();

    const [idExists, usernameExists] = await Promise.all([
      db.collection('users').findOne({ id: value.id }),
      db.collection('users').findOne({ username: value.username }),
    ]);

    if (idExists) return res.status(400).json({ message: 'ID already in use' });
    if (usernameExists) return res.status(400).json({ message: 'Username already taken' });

    const tempPwd = 'temp123';
    const hashed = await hashPassword(tempPwd);

    const doc = {
      ...value,
      password: hashed,
      passwordChanged: false,
      createdAt: new Date(),
    };

    await db.collection('users').insertOne(doc);

    const user = await db.collection('users').findOne(
      { id: value.id },
      { projection: { password: 0, _id: 0 } }
    );

    res.status(201).json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// GET CURRENT USER (ME) – FOR PROFILE
// ------------------------------------------------------------
export const getMe = async (req, res) => {
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne(
      { id: req.user.id },
      { projection: { password: 0, _id: 0 } }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// GET ALL USERS (admin)
// ------------------------------------------------------------
export const getUsers = async (req, res) => {
  try {
    const db = await connectDB();
    const { page = 1, limit = 10, search = '', role = '' } = req.query;

    const query = {
      $and: [
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
            { id: { $regex: search, $options: 'i' } },
          ],
        },
        role ? { role } : {},
      ],
    };

    const users = await db
      .collection('users')
      .find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .project({ password: 0, _id: 0 })
      .toArray();

    const total = await db.collection('users').countDocuments(query);

    res.json({ users, total, page: +page, limit: +limit });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// UPDATE USER – ADMIN CANNOT BE DEACTIVATED
// ------------------------------------------------------------
const updateSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  username: Joi.string().min(3).optional(),
  role: Joi.string().valid('admin', 'librarian', 'teacher', 'student').optional(),
  department: Joi.string().allow('').optional(),
  status: Joi.string().valid('active', 'deactive').optional(),
});

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const db = await connectDB();

    const currentUser = await db.collection('users').findOne({ id });
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // BLOCK: Cannot change admin role
    if (currentUser.role === 'admin' && value.role && value.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot change admin role.' });
    }

    // BLOCK: Cannot deactivate admin
    if (currentUser.role === 'admin' && value.status === 'deactive') {
      return res.status(403).json({ message: 'Cannot deactivate admin account.' });
    }

    // Username uniqueness
    if (value.username && value.username !== currentUser.username) {
      const exists = await db.collection('users').findOne({
        username: value.username,
        id: { $ne: id },
      });
      if (exists) return res.status(400).json({ message: 'Username already taken' });
    }

    const result = await db.collection('users').findOneAndUpdate(
      { id },
      { $set: value },
      { returnDocument: 'after', projection: { password: 0, _id: 0 } }
    );

    if (!result.value) return res.status(404).json({ message: 'User not found' });
    res.json(result.value);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------------------------------------
// DELETE USER (non-admin only)
// ------------------------------------------------------------
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ id });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin account.' });
    }

    await db.collection('users').deleteOne({ id });
    res.json({ message: 'User deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};