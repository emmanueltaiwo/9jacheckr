import { Router } from 'express';
import { getMyMetricsController } from '../controllers/metricsController.js';
import { requireAuthSession } from '../middleware/requireAuthSession.js';

export const metricsRouter = Router();

metricsRouter.get('/me', requireAuthSession, getMyMetricsController);
