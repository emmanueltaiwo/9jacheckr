import { Router } from 'express';
import { requireAuthSession } from '../middleware/requireAuthSession.js';
import {
  createMyApiKey,
  getMyApiKey,
  patchApiKeyLabel,
  revokeMyApiKey,
  revokeOneApiKey,
} from '../controllers/apiKeyController.js';
import { getMyUsageMetrics } from '../controllers/userApiUsageController.js';
import { initializeApiProController } from '../controllers/billingInitializeController.js';
import { getBillingStatusController } from '../controllers/billingStatusController.js';
import {
  getBillingAccountController,
  getBillingTransactionsController,
  postCancelApiSubscriptionController,
} from '../controllers/billingManagementController.js';

const router = Router();

router.get('/me', requireAuthSession, getMyApiKey);
router.get('/metrics', requireAuthSession, getMyUsageMetrics);
router.get('/billing/status', requireAuthSession, getBillingStatusController);
router.get('/billing/account', requireAuthSession, getBillingAccountController);
router.get(
  '/billing/transactions',
  requireAuthSession,
  getBillingTransactionsController,
);
router.post(
  '/billing/cancel-subscription',
  requireAuthSession,
  postCancelApiSubscriptionController,
);
router.post(
  '/billing/initialize-pro',
  requireAuthSession,
  initializeApiProController,
);
router.post('/create', requireAuthSession, createMyApiKey);
router.patch('/key/:keyId/label', requireAuthSession, patchApiKeyLabel);
router.delete('/me', requireAuthSession, revokeMyApiKey);
router.delete('/key/:keyId', requireAuthSession, revokeOneApiKey);

export default router;
