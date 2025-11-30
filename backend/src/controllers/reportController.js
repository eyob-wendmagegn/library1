// src/controllers/reportController.js   (new file)
import { getWeeklyReport } from '../models/reportModel.js';

export const generateWeeklyReport = async (req, res) => {
  const { type } = req.params;               // users | news | books | deactive
  try {
    const data = await getWeeklyReport(type);
    res.json({ type, weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0,10), data });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message });
  }
};