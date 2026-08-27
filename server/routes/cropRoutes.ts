import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { ICropRecommendation, INotification } from '../models/index.js';
import { recommendCrop } from '../services/ai/cropRecommendationService.js';
import { optionalAuth, authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/crops/recommend
router.post('/recommend', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      nitrogen,
      phosphorus,
      potassium,
      temperature,
      humidity,
      rainfall,
      soilPh,
      soilType,
      location
    } = req.body;

    // Input validation
    const n = Number(nitrogen) || 0;
    const p = Number(phosphorus) || 0;
    const k = Number(potassium) || 0;
    const temp = Number(temperature) || 28;
    const hum = Number(humidity) || 65;
    const rain = Number(rainfall) || 800;
    const ph = soilPh !== undefined ? Number(soilPh) : 6.5;
    const st = soilType ? String(soilType).trim() : 'Loam Soil';
    const loc = location ? String(location).trim() : 'Coimbatore Agro Zone';

    // Call AI Crop Recommendation service
    const result = await recommendCrop({
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      temperature: temp,
      humidity: hum,
      rainfall: rain,
      soilPh: ph,
      soilType: st,
      location: loc
    });

    const userId = req.user ? req.user._id : 'guest_farmer';

    // Save recommendation in database
    const recColl = db.collection<ICropRecommendation>('cropRecommendations');
    const saved = recColl.insertOne({
      userId,
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      temperature: temp,
      humidity: hum,
      rainfall: rain,
      soilPh: ph,
      soilType: st,
      location: loc,
      recommendedCrop: result.recommendedCrop,
      confidence: result.confidence,
      explanation: result.explanation,
      secondaryCrops: result.secondaryCrops,
      soilSuitability: result.soilSuitability,
      climateSuitability: result.climateSuitability,
      expectedBenefits: result.expectedBenefits,
      guidance: result.guidance,
      isDemo: result.isDemo
    });

    // Create notification if logged in
    if (req.user) {
      db.collection<INotification>('notifications').insertOne({
        userId: req.user._id,
        title: `🌱 Recommended: ${result.recommendedCrop}`,
        message: `High confidence (${result.confidence}%) crop recommendation generated for ${st}.`,
        type: 'crop',
        read: false,
        link: '/crop-recommendation'
      });
    }

    res.status(201).json({
      success: true,
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Crop recommendation failed.' });
  }
});

// GET /api/crops/history
router.get('/history', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const recColl = db.collection<ICropRecommendation>('cropRecommendations');
    const list = recColl.find(item => item.userId === req.user!._id);
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch history.' });
  }
});

// GET /api/crops/latest
router.get('/latest', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const recColl = db.collection<ICropRecommendation>('cropRecommendations');
    const userId = req.user ? req.user._id : undefined;
    let latest: ICropRecommendation | null = null;
    if (userId) {
      const userItems = recColl.find(item => item.userId === userId);
      latest = userItems.length > 0 ? userItems[0] : null;
    }
    if (!latest) {
      const all = recColl.find();
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
