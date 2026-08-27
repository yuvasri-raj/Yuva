import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { IUser } from '../models/index.js';
import { authenticate, AuthRequest, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, location, state, district, preferredLanguage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const usersColl = db.collection<IUser>('users');
    const existing = usersColl.findOne({ email: email.toLowerCase().trim() });

    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = usersColl.insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      passwordHash,
      role: 'farmer',
      location: location || '',
      state: state || 'Tamil Nadu',
      district: district || 'Coimbatore',
      preferredLanguage: preferredLanguage === 'ta' ? 'ta' : 'en',
      profileImage: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Agro Vision.',
      token,
      user: safeUser
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const usersColl = db.collection<IUser>('users');
    const user = usersColl.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Login failed.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, location, state, district, preferredLanguage, profileImage } = req.body;
    const usersColl = db.collection<IUser>('users');

    const updated = usersColl.updateOne(req.user!._id, {
      ...(name && { name: name.trim() }),
      ...(phone !== undefined && { phone }),
      ...(location !== undefined && { location }),
      ...(state !== undefined && { state }),
      ...(district !== undefined && { district }),
      ...(preferredLanguage && { preferredLanguage }),
      ...(profileImage !== undefined && { profileImage })
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { passwordHash: _, ...safeUser } = updated;

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Update failed.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const usersColl = db.collection<IUser>('users');
    const user = usersColl.findById(req.user!._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    usersColl.updateOne(user._id, { passwordHash });

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Password update failed.' });
  }
});

export default router;
