import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { IDiseaseDetection, INotification } from '../models/index.js';
import { detectDiseaseFromImage } from '../services/ai/diseaseDetectionService.js';
import { optionalAuth, authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/disease/detect
router.post('/detect', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { image, mimeType, cropName } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Plant image is required for disease detection.'
      });
    }

    // Call Plant Pathology AI service
    const result = await detectDiseaseFromImage(
      image,
      mimeType || 'image/jpeg',
      cropName
    );

    const userId = req.user ? req.user._id : 'guest_farmer';
    const detectedAt = new Date().toISOString();

    // Store sample or uploaded image reference safely (truncate if huge base64 for storage efficiency)
    const storedImageUrl = image.length > 500000 ? image.substring(0, 500000) : image;

    const diseaseColl = db.collection<IDiseaseDetection>('diseaseDetections');
    const saved = diseaseColl.insertOne({
      userId,
      imageUrl: storedImageUrl,
      cropName: result.cropName,
      diseaseName: result.diseaseName,
      confidence: result.confidence,
      severity: result.severity,
      symptoms: result.symptoms,
      prevention: result.prevention,
      treatment: result.treatment,
      isDemo: result.isDemo,
      detectedAt
    });

    if (req.user) {
      db.collection<INotification>('notifications').insertOne({
        userId: req.user._id,
        title: `🦠 Disease Analysis: ${result.diseaseName}`,
        message: `Detected ${result.diseaseName} on ${result.cropName} with ${result.confidence}% confidence (${result.severity} severity).`,
        type: 'disease',
        read: false,
        link: '/disease-detection'
      });
    }

    res.status(201).json({
      success: true,
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Disease detection failed.' });
  }
});

// GET /api/disease/history
router.get('/history', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const diseaseColl = db.collection<IDiseaseDetection>('diseaseDetections');
    const list = diseaseColl.find(item => item.userId === req.user!._id);
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/disease/latest
router.get('/latest', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const diseaseColl = db.collection<IDiseaseDetection>('diseaseDetections');
    const userId = req.user ? req.user._id : undefined;
    let latest: IDiseaseDetection | null = null;
    if (userId) {
      const userItems = diseaseColl.find(item => item.userId === userId);
      latest = userItems.length > 0 ? userItems[0] : null;
    }
    if (!latest) {
      const all = diseaseColl.find();
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
