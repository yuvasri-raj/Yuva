import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { IProfitCalculation } from '../models/index.js';
import { optionalAuth, authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/profit/calculate
router.post('/calculate', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const body = req.body || {};
    const cropName = body.cropName || 'General Crop';
    const area = Number(body.landArea) || 1;
    const landAreaUnit = body.landAreaUnit || 'Acres';

    const seed = Number(body.seedCost ?? body.seedsCost) || 0;
    const fert = Number(body.fertilizerCost ?? body.fertilizersCost) || 0;
    const pest = Number(body.pesticideCost ?? body.pesticidesCost) || 0;
    const lab = Number(body.labourCost) || 0;
    const irrig = Number(body.irrigationCost) || 0;
    const machinery = Number(body.machineryCost) || 0;
    const misc = Number(body.miscellaneousCost ?? body.otherCost) || 0;
    const other = machinery + misc;

    const yld = Number(body.expectedYield) || 1;
    const yieldUnit = body.yieldUnit || 'Quintals';
    const price = Number(body.sellingPrice ?? body.expectedPrice) || 0;

    const totalCost = seed + fert + pest + lab + irrig + other;
    const expectedRevenue = yld * price;
    const expectedProfit = expectedRevenue - totalCost;
    const netProfit = expectedProfit;
    const profitMargin = expectedRevenue > 0 ? Number(((expectedProfit / expectedRevenue) * 100).toFixed(2)) : 0;
    const roi = totalCost > 0 ? Number(((expectedProfit / totalCost) * 100).toFixed(2)) : 0;
    const breakEvenYield = price > 0 ? Number((totalCost / price).toFixed(2)) : 0;
    const breakEvenPrice = yld > 0 ? Number((totalCost / yld).toFixed(2)) : 0;

    const costBreakdown: Record<string, number> = {
      seeds: seed,
      fertilizers: fert,
      pesticides: pest,
      labour: lab,
      irrigation: irrig,
      machinery: machinery,
      miscellaneous: misc
    };

    const userId = req.user ? req.user._id : 'guest_farmer';

    const profitColl = db.collection<IProfitCalculation>('profitCalculations');
    const saved = profitColl.insertOne({
      userId,
      cropName,
      landArea: area,
      landAreaUnit,
      seedCost: seed,
      fertilizerCost: fert,
      pesticideCost: pest,
      labourCost: lab,
      irrigationCost: irrig,
      otherCost: other,
      expectedYield: yld,
      yieldUnit,
      sellingPrice: price,
      totalCost,
      expectedRevenue,
      expectedProfit,
      profitMargin,
      breakEvenYield,
      breakEvenPrice
    });

    const responsePayload = {
      ...saved,
      netProfit,
      totalRevenue: expectedRevenue,
      expectedPrice: price,
      roi,
      costBreakdown
    };

    res.status(201).json({
      success: true,
      data: responsePayload
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Profit calculation failed.' });
  }
});

// GET /api/profit/history
router.get('/history', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const profitColl = db.collection<IProfitCalculation>('profitCalculations');
    const list = profitColl.find(item => item.userId === req.user!._id);
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/profit/latest
router.get('/latest', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const profitColl = db.collection<IProfitCalculation>('profitCalculations');
    const userId = req.user ? req.user._id : undefined;
    let latest: IProfitCalculation | null = null;
    if (userId) {
      const userItems = profitColl.find(item => item.userId === userId);
      latest = userItems.length > 0 ? userItems[0] : null;
    }
    if (!latest) {
      const all = profitColl.find();
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
