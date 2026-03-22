import { Router } from 'express';
import { postBotActivityController } from '../controllers/botActivityController.js';
import { botBillingInitializeController } from '../controllers/botBillingInitializeController.js';
import { botBillingTransactionsController } from '../controllers/botBillingTransactionsController.js';
import { botStatusController } from '../controllers/botStatusController.js';
import { requireBotInternalToken } from '../middleware/requireBotInternalToken.js';

export const botRouter = Router();

botRouter.post('/activity', requireBotInternalToken, postBotActivityController);
botRouter.post('/status', requireBotInternalToken, botStatusController);
botRouter.post(
  '/billing/initialize-bot-pro',
  requireBotInternalToken,
  botBillingInitializeController,
);
botRouter.post(
  '/billing/transactions',
  requireBotInternalToken,
  botBillingTransactionsController,
);
