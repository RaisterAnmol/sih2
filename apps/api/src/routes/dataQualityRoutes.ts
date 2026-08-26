import { Router } from 'express';
import { getDataQualityMetrics } from '../controllers/dataQualityController.js';

const router = Router();

router.get('/', getDataQualityMetrics);

export default router;
