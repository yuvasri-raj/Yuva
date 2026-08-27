import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { IUser, ICropRecommendation, IDiseaseDetection, ISoilReport, ICommunityPost, IGovernmentScheme, IMarketPrice } from '../models/index.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply auth + requireAdmin to all admin endpoints
router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get('/stats', (req: AuthRequest, res: Response) => {
  try {
    const users = db.collection<IUser>('users').find();
    const crops = db.collection<ICropRecommendation>('cropRecommendations').find();
    const diseases = db.collection<IDiseaseDetection>('diseaseDetections').find();
    const soil = db.collection<ISoilReport>('soilReports').find();
    const posts = db.collection<ICommunityPost>('communityPosts').find();
    const schemes = db.collection<IGovernmentScheme>('governmentSchemes').find();
    const market = db.collection<IMarketPrice>('marketPrices').find();

    const farmersCount = users.filter(u => u.role === 'farmer').length;
    const adminsCount = users.filter(u => u.role === 'admin').length;

    // Disease breakdown by crop
    const diseaseBreakdown: Record<string, number> = {};
    diseases.forEach(d => {
      diseaseBreakdown[d.cropName] = (diseaseBreakdown[d.cropName] || 0) + 1;
    });

    // Recommendation count by crop
    const cropBreakdown: Record<string, number> = {};
    crops.forEach(c => {
      cropBreakdown[c.recommendedCrop] = (cropBreakdown[c.recommendedCrop] || 0) + 1;
    });

    // Soil rating distribution
    const soilRatingBreakdown: Record<string, number> = {
      'Excellent': 0,
      'Good': 0,
      'Moderate': 0,
      'Needs Improvement': 0
    };
    soil.forEach(s => {
      if (soilRatingBreakdown[s.rating] !== undefined) {
        soilRatingBreakdown[s.rating]++;
      }
    });

    // Recent system activity log
    const recentActivity = [
      ...crops.slice(0, 5).map(c => ({
        type: 'crop',
        title: `Crop Recommended: ${c.recommendedCrop}`,
        meta: `Confidence: ${c.confidence}% | Soil: ${c.soilType}`,
        time: c.createdAt
      })),
      ...diseases.slice(0, 5).map(d => ({
        type: 'disease',
        title: `Disease Scan: ${d.diseaseName}`,
        meta: `Crop: ${d.cropName} (${d.severity})`,
        time: d.createdAt || d.detectedAt
      })),
      ...posts.slice(0, 5).map(p => ({
        type: 'community',
        title: `Community Post: ${p.title.substring(0, 40)}...`,
        meta: `By ${p.userName} in ${p.category}`,
        time: p.createdAt
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalFarmers: farmersCount,
        totalAdmins: adminsCount,
        totalRecommendations: crops.length,
        totalDiseaseDetections: diseases.length,
        totalSoilReports: soil.length,
        totalPosts: posts.length,
        totalSchemes: schemes.length,
        totalMarketPrices: market.length,
        diseaseBreakdown,
        cropBreakdown,
        soilRatingBreakdown,
        recentActivity
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', (req: AuthRequest, res: Response) => {
  try {
    const usersColl = db.collection<IUser>('users');
    const users = usersColl.find();

    const safeUsers = users.map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });

    res.json({
      success: true,
      count: safeUsers.length,
      data: safeUsers
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (role !== 'farmer' && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Role must be farmer or admin.' });
    }

    const usersColl = db.collection<IUser>('users');
    const updated = usersColl.updateOne(req.params.id, { role });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { passwordHash, ...safe } = updated;
    res.json({ success: true, message: 'User role updated.', data: safe });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req: AuthRequest, res: Response) => {
  try {
    const usersColl = db.collection<IUser>('users');
    const user = usersColl.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.email === 'admin@agrovision.gov.in') {
      return res.status(400).json({ success: false, message: 'Cannot delete primary root admin account.' });
    }

    usersColl.deleteOne(user._id);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
