import { Router } from 'express';
import { getAnomalies } from '../controllers/anomalyController.js';

const router = Router();

router.get('/', getAnomalies);

export default router;
