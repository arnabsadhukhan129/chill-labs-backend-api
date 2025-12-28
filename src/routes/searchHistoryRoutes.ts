import express from 'express';
import { saveSearchHistory, getSearchHistory, clearHistory, deleteSingleHistory } from '../controllers/searchHistoryController';
import { protect as authMiddleware}  from '../middleware/authMiddleware';

const router = express.Router();

router.post('/save', authMiddleware, saveSearchHistory);
router.get('/list', authMiddleware, getSearchHistory);
router.delete('/clear', authMiddleware, clearHistory);
router.delete('/:id', authMiddleware, deleteSingleHistory);

export default router;
