import { Router } from 'express';
import { requireAuthSession } from '../middleware/requireAuthSession.js';
import {
  createMyApiKey,
  getMyApiKey,
  revokeMyApiKey,
} from '../controllers/apiKeyController.js';

const router = Router();

router.get('/me', requireAuthSession, getMyApiKey);
router.post('/create', requireAuthSession, createMyApiKey);
router.delete('/me', requireAuthSession, revokeMyApiKey);

export default router;
