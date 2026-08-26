import { Router } from 'express';
import { getAuditLogs, getSystemSettings, updateSystemSettings } from '../controllers/auditController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

router.get('/audit-log', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR'), getAuditLogs);
router.get('/settings', authenticateToken, getSystemSettings);
router.put('/settings', authenticateToken, authorizeRoles('ADMIN'), updateSystemSettings);

export default router;
