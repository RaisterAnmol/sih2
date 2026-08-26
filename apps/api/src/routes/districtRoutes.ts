import { Router } from 'express';
import { getDistricts, getDistrictDetails } from '../controllers/districtController.js';

const router = Router();

router.get('/', getDistricts);
router.get('/:name', getDistrictDetails);

export default router;
