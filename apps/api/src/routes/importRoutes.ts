import { Router } from 'express';
import { handleCSVUpload } from '../controllers/importController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

router.post('/csv', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'ANALYST'), handleCSVUpload);

export default router;
