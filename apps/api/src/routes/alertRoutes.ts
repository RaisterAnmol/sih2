import { Router } from 'express';
import { getAlerts, markAlertAsRead } from '../controllers/alertController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', getAlerts);
router.put('/:id/read', authenticateToken, markAlertAsRead);

export default router;
