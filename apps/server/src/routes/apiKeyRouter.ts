import { Router } from 'express';
import {
  createApiKeyController,
  getMyApiKeyController,
  revokeApiKeyController,
} from '../controllers/apiKeyController.js';
import { requireAuthSession } from '../middleware/requireAuthSession.js';

export const apiKeyRouter = Router();

apiKeyRouter.get('/me', requireAuthSession, getMyApiKeyController);
apiKeyRouter.post('/create', requireAuthSession, createApiKeyController);
apiKeyRouter.delete('/me', requireAuthSession, revokeApiKeyController);
