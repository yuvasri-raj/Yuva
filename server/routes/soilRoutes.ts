import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { ISoilReport, INotification } from '../models/index.js';
import { analyzeSoilHealth } from '../services/ai/soilAnalysisService.js';
import { optionalAuth, authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/soil/analyze
router.post('/analyze', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      nitrogen,
      phosphorus,
      potassium,
      ph,
      moisture,
      organicMatter,
      soilType
    } = req.body;

    const n = Number(nitrogen) || 120;
    const p = Number(phosphorus) || 35;
    const k = Number(potassium) || 150;
    const phVal = Number(ph) || 6.5;
    const moist = Number(moisture) || 55;
    const om = Number(organicMatter) || 0.85;
    const st = soilType ? String(soilType).trim() : 'Loam';

    const result = await analyzeSoilHealth({
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      ph: phVal,
      moisture: moist,
      organicMatter: om,
      soilType: st
    });

    const userId = req.user ? req.user._id : 'guest_farmer';

    const soilColl = db.collection<ISoilReport>('soilReports');
    const saved = soilColl.insertOne({
      userId,
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      ph: phVal,
      moisture: moist,
      organicMatter: om,
      soilType: st,
      healthScore: result.healthScore,
      rating: result.rating,
      nutrientStatus: result.nutrientStatus,
      recommendations: result.recommendations,
      isDemo: result.isDemo
    });

    if (req.user) {
      db.collection<INotification>('notifications').insertOne({
        userId: req.user._id,
        title: `🌍 Soil Health Score: ${result.healthScore}/100`,
        message: `Soil rated as "${result.rating}". Check recommendations for nutrient replenishment.`,
        type: 'system',
        read: false,
        link: '/soil-health'
      });
    }

    res.status(201).json({
      success: true,
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Soil analysis failed.' });
  }
});

// GET /api/soil/history
router.get('/history', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const soilColl = db.collection<ISoilReport>('soilReports');
    const list = soilColl.find(item => item.userId === req.user!._id);
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/soil/latest
router.get('/latest', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const soilColl = db.collection<ISoilReport>('soilReports');
    const userId = req.user ? req.user._id : undefined;
    let latest: ISoilReport | null = null;
    if (userId) {
      const userItems = soilColl.find(item => item.userId === userId);
      latest = userItems.length > 0 ? userItems[0] : null;
    }
    if (!latest) {
      const all = soilColl.find();
      latest = all.length > 0 ? all[0] : null;
    }
    res.json({
      success: true,
      data: latest
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
