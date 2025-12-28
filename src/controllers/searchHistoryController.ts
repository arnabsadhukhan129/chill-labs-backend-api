import { Request, Response } from 'express';
import SearchHistory from '../../models/searchHistory';

export const saveSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;   // From auth middleware
    const { keyword } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!keyword) {
      return res.status(400).json({ success: false, message: 'Keyword required' });
    }

    // Remove duplicate
    await SearchHistory.deleteMany({ userId, keyword });

    // Save new keyword
    await SearchHistory.create({ userId, keyword });

    // Keep only last 10
    const histories = await SearchHistory
      .find({ userId })
      .sort({ createdAt: -1 });

    if (histories.length > 10) {
      const extra = histories.slice(10);
      const ids = extra.map(h => h._id);
      await SearchHistory.deleteMany({ _id: { $in: ids } });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Save Search Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


export const getSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const history = await SearchHistory
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('keyword');

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


export const clearHistory = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  await SearchHistory.deleteMany({ userId });
  res.json({ success: true });
};

export const deleteSingleHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "History id is required"
      });
    }

    const deleted = await SearchHistory.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "History not found"
      });
    }

    res.json({
      success: true,
      message: "Search history deleted successfully"
    });

  } catch (error) {
    console.error("Delete History Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};






