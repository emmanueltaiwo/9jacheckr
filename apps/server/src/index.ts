import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectMongo, disconnectMongo } from './db/mongo.js';
import verifyNafdacRouter from './routes/verifyNafdacRouter.js';
import { apiKeyRouter } from './routes/apiKeyRouter.js';
import { metricsRouter } from './routes/metricsRouter.js';
import { botRouter } from './routes/botRouter.js';
import { requireApiAccess } from './middleware/requireApiAccess.js';
import { logger } from './utils/logger.js';
import { httpLogger } from './middleware/httpLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI ?? '';

async function main() {
  if (!MONGODB_URI) {
    logger.error('MONGODB_URI is required');
    process.exit(1);
  }
  if (!process.env.API_KEY_SECRET) {
    logger.error('API_KEY_SECRET is required');
    process.exit(1);
  }

  await connectMongo(MONGODB_URI);

  const app = express();

  app.use(
    cors({
      origin: process.env.WEB_APP_URL ?? true,
      credentials: true,
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-api-key',
        'x-internal-bot-token',
      ],
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(httpLogger);
  app.use('/api', apiRateLimiter);

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: '9ja-checkr-api' });
  });

  app.use('/api', requireApiAccess);
  app.use('/api/verify', verifyNafdacRouter);
  app.use('/api/keys', apiKeyRouter);
  app.use('/api/metrics', metricsRouter);
  app.use('/api/bot', botRouter);

  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    logger.info(`Listening on port ${PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Shutting down (${signal})`);
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
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
