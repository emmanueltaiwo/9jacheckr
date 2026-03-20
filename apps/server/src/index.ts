import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { connectMongo, disconnectMongo } from './db/mongo.js';
import { closeAuthMongo, getAuth } from './auth/auth.js';
import verifyNafdacRouter from './routes/verifyNafdacRouter.js';
import { botRouter } from './routes/botRouter.js';
import apiKeyRouter from './routes/apiKeyRouter.js';
import { requireApiAccess } from './middleware/requireApiAccess.js';
import { logger } from './utils/logger.js';
import { httpLogger } from './middleware/httpLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

const PORT = Number(process.env.PORT) || 4000;

async function main() {
  await connectMongo();

  const app = express();

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

  app.use(express.json({ limit: '1mb' }));
  app.use('/api', apiRateLimiter);

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: '9ja-checkr-api' });
  });

  app.use('/api', requireApiAccess);
  app.use('/api/verify', verifyNafdacRouter);
  app.use('/api/bot', botRouter);
  app.use('/api/keys', apiKeyRouter);

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
