import { Router } from 'express';
import { postBotActivityController } from '../controllers/botActivityController.js';
import { requireBotInternalToken } from '../middleware/requireBotInternalToken.js';

export const botRouter = Router();

botRouter.post('/activity', requireBotInternalToken, postBotActivityController);
