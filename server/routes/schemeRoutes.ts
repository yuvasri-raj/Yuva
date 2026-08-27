import { Router, Request, Response } from 'express';
import { db } from '../config/db.js';
import { IGovernmentScheme } from '../models/index.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/schemes
router.get('/', (req: Request, res: Response) => {
  try {
    const { state, category, farmerCategory, search } = req.query;
    const schemesColl = db.collection<IGovernmentScheme>('governmentSchemes');
    let schemes = schemesColl.find();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      schemes = schemes.filter(s =>
        s.schemeName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.benefits.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }

    if (state && typeof state === 'string' && state !== 'All') {
      schemes = schemes.filter(s => s.state === 'All India' || s.state.toLowerCase() === state.toLowerCase());
    }

    if (category && typeof category === 'string' && category !== 'All') {
      schemes = schemes.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    if (farmerCategory && typeof farmerCategory === 'string' && farmerCategory !== 'All') {
      schemes = schemes.filter(s => s.farmerCategory.toLowerCase().includes(farmerCategory.toLowerCase()) || s.farmerCategory.toLowerCase().includes('all'));
    }

    res.json({
      success: true,
      count: schemes.length,
      data: schemes
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/schemes/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const schemesColl = db.collection<IGovernmentScheme>('governmentSchemes');
    const scheme = schemesColl.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }
    res.json({ success: true, data: scheme });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/schemes (Admin)
router.post('/', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const {
      schemeName,
      description,
      eligibility,
      benefits,
      documentsRequired,
      applicationProcess,
      officialLink,
      state,
      category,
      farmerCategory,
      fundingAmount
    } = req.body;

    if (!schemeName || !description || !officialLink) {
      return res.status(400).json({ success: false, message: 'Scheme name, description, and official link are required.' });
    }

    const schemesColl = db.collection<IGovernmentScheme>('governmentSchemes');
    const saved = schemesColl.insertOne({
      schemeName: schemeName.trim(),
      description: description.trim(),
      eligibility: Array.isArray(eligibility) ? eligibility : [eligibility],
      benefits: benefits || 'Financial and input subsidy support',
      documentsRequired: Array.isArray(documentsRequired) ? documentsRequired : [documentsRequired],
      applicationProcess: applicationProcess || 'Apply through official state/central agriculture portal.',
      officialLink: officialLink.trim(),
      state: state || 'All India',
      category: category || 'Direct Income Support',
      farmerCategory: farmerCategory || 'All Farmers',
      fundingAmount: fundingAmount || 'Standard Subsidy'
    });

    res.status(201).json({
      success: true,
      message: 'Government scheme added successfully.',
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/schemes/:id (Admin)
router.put('/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const schemesColl = db.collection<IGovernmentScheme>('governmentSchemes');
    const updated = schemesColl.updateOne(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }
    res.json({
      success: true,
      message: 'Scheme updated successfully.',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/schemes/:id (Admin)
router.delete('/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const schemesColl = db.collection<IGovernmentScheme>('governmentSchemes');
    const deleted = schemesColl.deleteOne(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }
    res.json({
      success: true,
      message: 'Scheme deleted successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
