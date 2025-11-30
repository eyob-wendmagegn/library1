// src/routes/news.js
import express from 'express';
import {
  createNews,
  getNews,
  getUnreadCount,
  markNewsAsRead,
} from '../controllers/newsController.js';

const router = express.Router();

router.post('/', createNews);
router.get('/', getNews);
router.get('/unread', getUnreadCount);
router.post('/read', markNewsAsRead);

export default router;