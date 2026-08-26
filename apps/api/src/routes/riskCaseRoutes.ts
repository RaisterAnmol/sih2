import { Router } from 'express';
import {
  getRiskCases,
  createRiskCase,
  getRiskCaseById,
  updateRiskCase,
} from '../controllers/riskCaseController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

router.get('/', getRiskCases);
router.get('/:id', getRiskCaseById);
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR'), createRiskCase);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR'), updateRiskCase);

export default router;
