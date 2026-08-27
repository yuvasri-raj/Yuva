import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { IChatMessage } from '../models/index.js';
import { chatWithAgroAssistant } from '../services/ai/chatbotService.js';
import { optionalAuth, authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/chat
router.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { message, language, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    const lang = language === 'ta' ? 'ta' : 'en';

    const result = await chatWithAgroAssistant({
      message: message.trim(),
      language: lang,
      conversationHistory: Array.isArray(history) ? history : []
    });

    const userId = req.user ? req.user._id : 'guest_farmer';

    const chatColl = db.collection<IChatMessage>('chatMessages');
    const saved = chatColl.insertOne({
      userId,
      message: message.trim(),
      response: result.reply,
      language: lang,
      isDemo: result.isDemo
    });

    res.json({
      success: true,
      data: {
        _id: saved._id,
        reply: result.reply,
        language: lang,
        isDemo: result.isDemo,
        createdAt: saved.createdAt
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Chat service error.' });
  }
});

// GET /api/chat/history
router.get('/history', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const chatColl = db.collection<IChatMessage>('chatMessages');
    const history = chatColl.find(c => c.userId === req.user!._id);
    // Sort chronological
    history.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/chat/history
router.delete('/history', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const chatColl = db.collection<IChatMessage>('chatMessages');
    const userChats = chatColl.find(c => c.userId === req.user!._id);
    userChats.forEach(c => chatColl.deleteOne(c._id));

    res.json({
      success: true,
      message: 'Chat history cleared successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
