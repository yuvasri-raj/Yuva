import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { INotification } from '../models/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const notifColl = db.collection<INotification>('notifications');
    const items = notifColl.find(n => n.userId === req.user!._id);
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = items.filter(n => !n.read).length;

    res.json({
      success: true,
      count: items.length,
      unreadCount,
      data: items
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const notifColl = db.collection<INotification>('notifications');
    const notif = notifColl.findById(req.params.id);

    if (!notif || notif.userId !== req.user!._id) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const updated = notifColl.updateOne(notif._id, { read: true });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const notifColl = db.collection<INotification>('notifications');
    const items = notifColl.find(n => n.userId === req.user!._id && !n.read);
    items.forEach(n => notifColl.updateOne(n._id, { read: true }));

    res.json({ success: true, message: 'All marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
