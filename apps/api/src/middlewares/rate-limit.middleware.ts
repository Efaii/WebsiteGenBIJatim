import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request, Response } from "express";

const rateLimited = (_req: Request, res: Response) => {
  res.status(429).json({
    error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." },
    meta: { requestId: res.locals.requestId },
  });
};

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? "unknown"),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimited,
  skipSuccessfulRequests: false,
});

export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? "unknown"),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimited,
  skipSuccessfulRequests: false,
});
