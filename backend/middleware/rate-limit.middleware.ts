import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private lastCleanupAt = 0;

  constructor(private options: RateLimitOptions) {
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (String(req?.method || '').toUpperCase() === 'OPTIONS') {
      return next();
    }

    const clientId = this.getClientId(req);
    const now = Date.now();

    if (now - this.lastCleanupAt > 60000) {
      this.cleanup(now);
      this.lastCleanupAt = now;
    }
    
    let clientData = this.requests.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      // New window or expired window
      clientData = {
        count: 1,
        resetTime: now + this.options.windowMs
      };
      this.requests.set(clientId, clientData);
      return next();
    }

    // Increment request count
    clientData.count++;
    
    if (clientData.count > this.options.max) {
      // Rate limit exceeded
      const resetIn = Math.max(1, Math.ceil((clientData.resetTime - now) / 1000));
      res.set({
        'Retry-After': String(resetIn),
        'X-RateLimit-Limit': this.options.max.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString(),
      });
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: this.options.message || `Rate limit exceeded. Try again in ${resetIn} seconds.`,
        retryAfter: resetIn,
        limit: this.options.max,
        windowMs: this.options.windowMs,
        current: clientData.count
      });
    }

    // Update headers with rate limit info
    res.set({
      'X-RateLimit-Limit': this.options.max.toString(),
      'X-RateLimit-Remaining': Math.max(0, this.options.max - clientData.count).toString(),
      'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
    });

    next();
  }

  private getClientId(req: Request): string {
    const forwardedRaw = req.headers['x-forwarded-for'];
    const forwarded = Array.isArray(forwardedRaw) ? forwardedRaw[0] : String(forwardedRaw || '').split(',')[0].trim();
    return forwarded || req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  }

  private cleanup(now: number) {
    for (const [clientId, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(clientId);
      }
    }
  }
}

// Factory function for easier configuration
export function createRateLimitMiddleware(options: RateLimitOptions) {
  return RateLimitMiddleware;
}
