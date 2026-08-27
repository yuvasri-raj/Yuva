import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { seedDatabase } from './server/seed.js';
import { errorHandler } from './server/middleware/errorHandler.js';

// Route imports
import authRoutes from './server/routes/authRoutes.js';
import cropRoutes from './server/routes/cropRoutes.js';
import diseaseRoutes from './server/routes/diseaseRoutes.js';
import soilRoutes from './server/routes/soilRoutes.js';
import marketRoutes from './server/routes/marketRoutes.js';
import profitRoutes from './server/routes/profitRoutes.js';
import schemeRoutes from './server/routes/schemeRoutes.js';
import communityRoutes from './server/routes/communityRoutes.js';
import chatRoutes from './server/routes/chatRoutes.js';
import weatherRoutes from './server/routes/weatherRoutes.js';
import notificationRoutes from './server/routes/notificationRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB and Seed Data
  await seedDatabase();

  // Middleware
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Request logger in dev
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString().substring(11, 19)}] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Agro Vision API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/crops', cropRoutes);
  app.use('/api/disease', diseaseRoutes);
  app.use('/api/soil', soilRoutes);
  app.use('/api/market', marketRoutes);
  app.use('/api/profit', profitRoutes);
  app.use('/api/schemes', schemeRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/weather', weatherRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);

  // Global Error Handler for API
  app.use('/api', errorHandler);

  // Vite middleware for development vs Static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to 0.0.0.0:3000 as required
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌱 Agro Vision Server successfully started at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
