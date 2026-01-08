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

  constructor(private options: RateLimitOptions) {
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const clientId = this.getClientId(req);
    const now = Date.now();
    
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
      const resetIn = Math.ceil((clientData.resetTime - now) / 1000);
      
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
    // Use IP address as client identifier
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           'unknown';
  }

  private cleanup() {
    const now = Date.now();
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
