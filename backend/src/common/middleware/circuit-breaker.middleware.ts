import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

type CircuitState = 'closed' | 'open' | 'half-open';

type CircuitBreakerOptions = {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxAttempts: number;
};

@Injectable()
export class CircuitBreakerMiddleware implements NestMiddleware {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenAttempts = 0;
  private readonly options: CircuitBreakerOptions;

  constructor(options?: Partial<CircuitBreakerOptions>) {
    this.options = {
      failureThreshold: options?.failureThreshold ?? 5,
      resetTimeoutMs: options?.resetTimeoutMs ?? 30_000,
      halfOpenMaxAttempts: options?.halfOpenMaxAttempts ?? 3,
    };
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (this.state === 'open') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.options.resetTimeoutMs) {
        this.state = 'half-open';
        this.halfOpenAttempts = 0;
      } else {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Circuit breaker is open — please retry later',
          retryAfterMs: this.options.resetTimeoutMs - elapsed,
        });
        return;
      }
    }

    if (this.state === 'half-open' && this.halfOpenAttempts >= this.options.halfOpenMaxAttempts) {
      this.state = 'open';
      this.lastFailureTime = Date.now();
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Circuit breaker is open — please retry later',
        retryAfterMs: this.options.resetTimeoutMs,
      });
      return;
    }

    if (this.state === 'half-open') {
      this.halfOpenAttempts++;
    }

    res.on('finish', () => {
      const statusCode = res.statusCode;
      if (statusCode >= 500) {
        this.onFailure();
      } else if (statusCode < 400) {
        this.onSuccess();
      }
    });

    next();
  }

  private onSuccess() {
    if (this.state === 'half-open') {
      this.state = 'closed';
      this.failureCount = 0;
      this.halfOpenAttempts = 0;
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'half-open') {
      this.state = 'open';
      return;
    }

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      halfOpenAttempts: this.halfOpenAttempts,
    };
  }
}
