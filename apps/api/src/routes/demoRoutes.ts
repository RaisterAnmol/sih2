import { Router } from 'express';
import { launchIntelligenceDemo, resetDemoData } from '../controllers/demoController.js';

const router = Router();

router.post('/launch', launchIntelligenceDemo);
router.post('/reset', resetDemoData);

export default router;
