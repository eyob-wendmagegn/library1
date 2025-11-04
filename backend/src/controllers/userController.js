import { connectDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

export const getMe = async (req, res) => {
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};