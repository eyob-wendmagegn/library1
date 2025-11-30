// src/controllers/borrowController.js
import { connectDB } from '../config/db.js';
import Joi from 'joi';

/* --------------------------------------------------------------
   JOI Schemas
   -------------------------------------------------------------- */
const borrowSchema = Joi.object({
  userId: Joi.string().required(),
  username: Joi.string().required(),
  bookId: Joi.string().required(),
  bookName: Joi.string().required(),
  dueDate: Joi.date().min('now').required(),
});

const returnSchema = Joi.object({
  userId: Joi.string().required(),
  bookId: Joi.string().required(),
});

const viewSchema = Joi.object({
  userId: Joi.string().required(),
  username: Joi.string().required(),
});

/* --------------------------------------------------------------
   Helper – calculate fine (10 ETB per day after 24h)
   -------------------------------------------------------------- */
const calculateFine = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const msDiff = now - due; // can be negative
  const daysLate = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
  return daysLate * 10; // 10 ETB / day
};

/* --------------------------------------------------------------
   BORROW – keep existing logic, just store the exact dueDate
   -------------------------------------------------------------- */
export const borrowBook = async (req, res) => {
  const { error, value } = borrowSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const db = await connectDB();

    const user = await db.collection('users').findOne({
      id: value.userId,
      username: value.username,
    });
    if (!user) return res.status(404).json({ message: 'Invalid user ID or username' });

    const book = await db.collection('books').findOne({
      id: value.bookId,
      name: value.bookName,
    });
    if (!book) return res.status(404).json({ message: 'Invalid book ID or name' });

    const existing = await db.collection('borrows').findOne({
      userId: value.userId,
      returnedAt: null,
    });
    if (existing) return res.status(400).json({ message: 'User already has a borrowed book' });

    if (book.copies <= 0) return res.status(400).json({ message: 'No copies available' });

    const borrowRecord = {
      userId: value.userId,
      username: value.username,
      bookId: value.bookId,
      bookName: value.bookName,
      bookTitle: book.title,
      borrowedAt: new Date(),
      dueDate: new Date(value.dueDate), // exact ISO string from frontend
      returnedAt: null,
      fine: 0,
    };

    await db.collection('borrows').insertOne(borrowRecord);
    await db.collection('books').updateOne({ id: value.bookId }, { $inc: { copies: -1 } });

    res.status(201).json({ message: 'Book borrowed successfully', borrow: borrowRecord });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

/* --------------------------------------------------------------
   RETURN – now uses helper, returns numeric fine + formatted string
   -------------------------------------------------------------- */
export const returnBook = async (req, res) => {
  const { error, value } = returnSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const db = await connectDB();
    const borrow = await db.collection('borrows').findOne({
      userId: value.userId,
      bookId: value.bookId,
      returnedAt: null,
    });
    if (!borrow) return res.status(404).json({ message: 'No active borrow found' });

    const fine = calculateFine(borrow.dueDate);
    const now = new Date();

    await db.collection('borrows').updateOne(
      { _id: borrow._id },
      { $set: { returnedAt: now, fine } }
    );

    await db.collection('books').updateOne(
      { id: value.bookId },
      { $inc: { copies: 1 } }
    );

    res.json({ message: 'Returned successfully', fine });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

/* --------------------------------------------------------------
   GET ALL BORROWS – include live fine for *active* borrows
   -------------------------------------------------------------- */
export const getAllBorrows = async (req, res) => {
  try {
    const db = await connectDB();
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = search
      ? {
          $or: [
            { userId: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
            { bookId: { $regex: search, $options: 'i' } },
            { bookName: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const borrows = await db
      .collection('borrows')
      .find(query)
      .sort({ borrowedAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .toArray();

    // Add live fine for non-returned records
    const enriched = borrows.map(b => ({
      ...b,
      fine: b.returnedAt ? b.fine : calculateFine(b.dueDate),
    }));

    const total = await db.collection('borrows').countDocuments(query);
    res.json({ borrows: enriched, total, page: +page, limit: +limit });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

/* --------------------------------------------------------------
   GET MY BORROW – also show live fine
   -------------------------------------------------------------- */
export const getBorrowByUser = async (req, res) => {
  const { error, value } = viewSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const db = await connectDB();
    const borrow = await db.collection('borrows').findOne({
      userId: value.userId,
      username: value.username,
      returnedAt: null,
    });
    if (!borrow) return res.status(404).json({ message: 'No active borrow found' });

    const fine = calculateFine(borrow.dueDate);
    const enriched = { ...borrow, fine };
    res.json({ borrow: enriched });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};