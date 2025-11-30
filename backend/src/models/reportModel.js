// src/models/reportModel.js   (new file)
import { connectDB } from '../config/db.js';

export const getWeeklyReport = async (type) => {
  const db = await connectDB();

  // ---- 1 week ago (00:00) -------------------------------------------------
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  // ---- Base filter ---------------------------------------------------------
  const filter = { createdAt: { $gte: weekAgo } };

  // ---- 1. Users ------------------------------------------------------------
  if (type === 'users') {
    const added = await db.collection('users')
      .find({ ...filter, role: { $ne: 'admin' } })
      .project({ password: 0, _id: 0 })
      .toArray();

    const deactivated = await db.collection('users')
      .find({ ...filter, status: 'deactive', role: { $ne: 'admin' } })
      .project({ password: 0, _id: 0 })
      .toArray();

    return { added, deactivated };
  }

  // ---- 2. News -------------------------------------------------------------
  if (type === 'news') {
    const added = await db.collection('news')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return { added };
  }

  // ---- 3. Books ------------------------------------------------------------
  if (type === 'books') {
    const added = await db.collection('books')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return { added };
  }

  // ---- 4. Deactive users (same as users but only deactivated) -------------
  if (type === 'deactive') {
    const deactivated = await db.collection('users')
      .find({ ...filter, status: 'deactive', role: { $ne: 'admin' } })
      .project({ password: 0, _id: 0 })
      .toArray();

    return { deactivated };
  }

  throw new Error('Invalid report type');
};