import { Router } from 'express';
import { verifyNafdacController } from '../controllers/verifyNafdacController.js';
import { verifyBatchController } from '../controllers/verifyBatchController.js';
import { verifyPlanRateLimiter } from '../middleware/verifyPlanRateLimiter.js';

const router = Router();

router.post(
  '/batch',
  verifyPlanRateLimiter,
  verifyBatchController,
);
router.get(
  '/:nafdac',
  verifyPlanRateLimiter,
  verifyNafdacController,
);

export default router;
