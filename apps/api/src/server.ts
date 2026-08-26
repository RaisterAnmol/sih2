import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedDemoAccounts, seedFullDatabase } from './seed/seedData.js';
import { Project } from './models/Project.js';
import { MLServiceClient } from './services/mlClient.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import anomalyRoutes from './routes/anomalyRoutes.js';
import riskCaseRoutes from './routes/riskCaseRoutes.js';
import contractorRoutes from './routes/contractorRoutes.js';
import districtRoutes from './routes/districtRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import dataQualityRoutes from './routes/dataQualityRoutes.js';
import importRoutes from './routes/importRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import demoRoutes from './routes/demoRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Mount Core API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/risk-cases', riskCaseRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/data-quality', dataQualityRoutes);
app.use('/api/import', importRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api', auditRoutes); // /api/audit-log & /api/settings
app.use('/api/demo', demoRoutes);

// Health Check API
app.get('/api/health', async (req, res) => {
  const isMLHealthy = await MLServiceClient.isHealthy();
  res.json({
    status: 'operational',
    service: 'MPLAD Insight API Gateway',
    timestamp: new Date().toISOString(),
    components: {
      api: 'operational',
      database: 'operational',
      mlEngine: isMLHealthy ? 'operational' : 'fallback-active',
    },
  });
});

// Central Error Handler
app.use(errorHandler);

// Server Startup Lifecycle
async function startServer() {
  try {
    await connectDatabase();
    await seedDemoAccounts();

    // Auto-seed initial 5,000 project dataset if database is empty
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      console.log('[Bootstrap] Empty database detected. Auto-generating initial 5,000+ MPLAD dataset...');
      await seedFullDatabase(5200);
    }

    app.listen(PORT, () => {
      console.log(`\n=============================================================`);
      console.log(`  MPLAD INSIGHT API GATEWAY RUNNING ON http://localhost:${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=============================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer();
}

export default app;
