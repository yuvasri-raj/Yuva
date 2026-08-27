import { Router, Request, Response } from 'express';
import { db } from '../config/db.js';
import { IMarketPrice } from '../models/index.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/market/prices
router.get('/prices', (req: Request, res: Response) => {
  try {
    const { crop, state, district, market, search } = req.query;
    const marketColl = db.collection<IMarketPrice>('marketPrices');
    let prices = marketColl.find();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      prices = prices.filter(p =>
        p.cropName.toLowerCase().includes(q) ||
        p.marketName.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q)
      );
    }

    if (crop && typeof crop === 'string' && crop !== 'All') {
      prices = prices.filter(p => p.cropName.toLowerCase().includes(crop.toLowerCase()));
    }

    if (state && typeof state === 'string' && state !== 'All') {
      prices = prices.filter(p => p.state.toLowerCase().includes(state.toLowerCase()));
    }

    if (district && typeof district === 'string' && district !== 'All') {
      prices = prices.filter(p => p.district.toLowerCase().includes(district.toLowerCase()));
    }

    if (market && typeof market === 'string' && market !== 'All') {
      prices = prices.filter(p => p.marketName.toLowerCase().includes(market.toLowerCase()));
    }

    res.json({
      success: true,
      count: prices.length,
      data: prices,
      isLiveApiConfigured: !!(process.env.MARKET_API_KEY && process.env.MARKET_API_KEY.trim() !== '')
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/market/trends/:crop
router.get('/trends/:crop', (req: Request, res: Response) => {
  try {
    const crop = req.params.crop;
    const marketColl = db.collection<IMarketPrice>('marketPrices');
    const matched = marketColl.findOne(p => p.cropName.toLowerCase().includes(crop.toLowerCase()));

    const basePrice = matched ? matched.price : 2500;
    const msp = matched?.msp || Math.round(basePrice * 0.9);

    // Generate 7-day trend series based on real base price
    const days = ['6 Days Ago', '5 Days Ago', '4 Days Ago', '3 Days Ago', '2 Days Ago', 'Yesterday', 'Today'];
    const variance = [ -0.04, -0.02, -0.03, +0.01, +0.02, +0.015, (matched?.changePercentage ? matched.changePercentage / 100 : 0.03) ];

    const trendData = days.map((day, idx) => {
      const p = Math.round(basePrice * (1 + variance[idx]));
      return {
        date: day,
        price: p,
        msp: msp,
        volume: Math.round(150 + Math.random() * 200) // in Quintals
      };
    });

    res.json({
      success: true,
      cropName: matched?.cropName || crop,
      currentPrice: matched?.price || basePrice,
      unit: matched?.unit || 'Quintal (100 kg)',
      msp,
      trendData
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/market/prices (Admin)
router.post('/prices', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { cropName, marketName, location, state, district, price, unit, source, msp, trend, changePercentage } = req.body;

    if (!cropName || !marketName || !price) {
      return res.status(400).json({ success: false, message: 'Crop name, market name, and price are required.' });
    }

    const marketColl = db.collection<IMarketPrice>('marketPrices');
    const today = new Date().toISOString().split('T')[0];

    const saved = marketColl.insertOne({
      cropName: cropName.trim(),
      marketName: marketName.trim(),
      location: location || marketName,
      state: state || 'Tamil Nadu',
      district: district || 'Coimbatore',
      price: Number(price),
      unit: unit || 'Quintal (100 kg)',
      date: today,
      source: source || 'Mandi Daily Board',
      msp: msp ? Number(msp) : undefined,
      trend: trend || 'stable',
      changePercentage: changePercentage ? Number(changePercentage) : 0
    });

    res.status(201).json({
      success: true,
      message: 'Market price record added successfully.',
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/market/prices/:id (Admin)
router.put('/prices/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const marketColl = db.collection<IMarketPrice>('marketPrices');
    const updated = marketColl.updateOne(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Price record not found.' });
    }
    res.json({
      success: true,
      message: 'Price record updated.',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/market/prices/:id (Admin)
router.delete('/prices/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const marketColl = db.collection<IMarketPrice>('marketPrices');
    const deleted = marketColl.deleteOne(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Price record not found.' });
    }
    res.json({
      success: true,
      message: 'Price record deleted successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
