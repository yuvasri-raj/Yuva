import { Router, Request, Response } from 'express';
import { fetchWeatherData } from '../services/weatherService.js';

const router = Router();

// GET /api/weather
router.get('/', async (req: Request, res: Response) => {
  try {
    const { location, lat, lon } = req.query;

    const weather = await fetchWeatherData(
      typeof location === 'string' ? location : undefined,
      lat ? Number(lat) : undefined,
      lon ? Number(lon) : undefined
    );

    res.json({
      success: true,
      data: weather
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Weather lookup failed.' });
  }
});

export default router;
