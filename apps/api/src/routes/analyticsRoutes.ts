import { Router } from 'express';
import {
  getFinancialAnalytics,
  getTemporalAnalytics,
  getEfficiencyAnalytics,
} from '../controllers/analyticsController.js';

const router = Router();

router.get('/financial', getFinancialAnalytics);
router.get('/temporal', getTemporalAnalytics);
router.get('/efficiency', getEfficiencyAnalytics);

export default router;
