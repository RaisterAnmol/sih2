import { Router } from 'express';
import { getProjectReportPDF, getSchemeOverviewReport } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/project/:id/pdf', getProjectReportPDF);
router.get('/overview/csv', getSchemeOverviewReport);

export default router;
