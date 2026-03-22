import rateLimit from 'express-rate-limit';
import type { NextFunction, Request, Response } from 'express';
import { resolveApiPlan } from '../services/apiPlanService.js';
import { resolveBotPlan } from '../services/botPlanService.js';

const limitBody = {
  ok: false,
  code: 'RATE_LIMITED',
  message: 'Too many requests. Please wait a moment and try again.',
};

const verifyFreeWindow = 15 * 60 * 1000;
const verifyFreeMax = 45;
const verifyProMax = 220;

function keyForReq(req: Request): string {
  if (req.authContext?.source === 'api_key' && req.authContext.userId) {
    return `ak:${req.authContext.userId}`;
  }
  if (req.authContext?.source === 'bot' && req.botTelegram?.id) {
    return `bt:${req.botTelegram.id}`;
  }
  return `ip:${req.ip ?? 'unknown'}`;
}

const freeTierLimiter = rateLimit({
  windowMs: verifyFreeWindow,
  limit: verifyFreeMax,
  keyGenerator: (req) => `vf:${keyForReq(req)}`,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: limitBody,
});

const proTierLimiter = rateLimit({
  windowMs: verifyFreeWindow,
  limit: verifyProMax,
  keyGenerator: (req) => `vp:${keyForReq(req)}`,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: limitBody,
});

export async function verifyPlanRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.authContext?.source === 'bot' && req.botTelegram?.id) {
      const bp = await resolveBotPlan(req.botTelegram.id);
      if (bp === 'pro_bot') {
        proTierLimiter(req, res, next);
        return;
      }
      freeTierLimiter(req, res, next);
      return;
    }
    if (req.authContext?.source === 'api_key' && req.authContext.userId) {
      const plan = await resolveApiPlan(req.authContext.userId);
      if (plan === 'pro_api') {
        proTierLimiter(req, res, next);
        return;
      }
      freeTierLimiter(req, res, next);
      return;
    }
    freeTierLimiter(req, res, next);
  } catch (e) {
    next(e);
  }
}
