import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { checkMongoHealth, connectMongo, disconnectMongo } from './db/mongo.js';
import { closeAuthMongo, getAuth } from './auth/auth.js';
import verifyNafdacRouter from './routes/verifyNafdacRouter.js';
import { botRouter } from './routes/botRouter.js';
import apiKeyRouter from './routes/apiKeyRouter.js';
import publicVerifyRouter from './routes/publicVerifyRouter.js';
import productSearchRouter from './routes/productSearchRouter.js';
import { requireApiAccess } from './middleware/requireApiAccess.js';
import { logger } from './utils/logger.js';
import { httpLogger } from './middleware/httpLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import {
  botRoutesRateLimiter,
  dashboardKeysRateLimiter,
  healthRateLimiter,
  healthReadyRateLimiter,
  publicVerifyRateLimiter,
} from './middleware/rateLimiter.js';
import { billingWebhookController } from './controllers/billingWebhookController.js';

const PORT = Number(process.env.PORT) || 4000;

async function main() {
  await connectMongo();

  const app = express();

  // Railway / reverse proxies set X-Forwarded-For; without this, express-rate-limit throws
  // ERR_ERL_UNEXPECTED_X_FORWARDED_FOR and req.ip is wrong. Disable with TRUST_PROXY=0.
  {
    const t = process.env.TRUST_PROXY?.trim();
    if (t !== '0' && t !== 'false') {
      const n = t ? Number(t) : 1;
      app.set('trust proxy', Number.isFinite(n) && n > 0 ? n : 1);
    }
  }

  app.use(
    cors({
      origin: process.env.WEB_APP_URL ?? true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  );

  app.use(httpLogger);

  const auth = await getAuth();
  app.all('/api/auth/*splat', toNodeHandler(auth));

  app.post(
    '/api/billing/webhook',
    express.raw({ type: 'application/json' }),
    (req, res, next) => {
      billingWebhookController(req, res).catch(next);
    },
  );

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', healthRateLimiter, (_req, res) => {
    res.status(200).json({ ok: true, service: '9ja-checkr-api' });
  });

  app.get('/health/ready', healthReadyRateLimiter, async (_req, res) => {
    const dbOk = await checkMongoHealth();
    if (!dbOk) {
      res.status(503).json({
        ok: false,
        service: '9ja-checkr-api',
        database: 'unavailable',
      });
      return;
    }
    res.status(200).json({
      ok: true,
      service: '9ja-checkr-api',
      database: 'connected',
    });
  });

  app.use('/api', requireApiAccess);
  app.use('/api/verify', verifyNafdacRouter);
  app.use('/api/products', productSearchRouter);
  app.use('/api/bot', botRoutesRateLimiter, botRouter);
  app.use('/api/keys', dashboardKeysRateLimiter, apiKeyRouter);
  app.use('/api/public', publicVerifyRateLimiter, publicVerifyRouter);

  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    logger.info(`Listening on port ${PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Shutting down (${signal})`);
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await closeAuthMongo();
    await disconnectMongo();
    process.exit(0);
  };

  const onSignal = (signal: string) => {
    shutdown(signal).catch((err) => {
      logger.error('Shutdown failed', { message: String(err) });
      process.exit(1);
    });
  };
  process.once('SIGINT', () => onSignal('SIGINT'));
  process.once('SIGTERM', () => onSignal('SIGTERM'));
}

main().catch((err) => {
  logger.error('Fatal startup error', { message: String(err) });
  process.exit(1);
});
