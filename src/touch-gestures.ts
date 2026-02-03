// Touch gestures utility for mobile interactions
import React from 'react';

export interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDelay?: number;
}

export class TouchGestures {
  private element: HTMLElement;
  private options: TouchGestureOptions;
  private startX: number = 0;
  private startY: number = 0;
  private startTime: number = 0;
  private longPressTimer: NodeJS.Timeout | null = null;
  private tapCount: number = 0;
  private tapTimer: NodeJS.Timeout | null = null;

  constructor(element: HTMLElement, options: TouchGestureOptions = {}) {
    this.element = element;
    this.options = {
      threshold: 50,
      longPressDelay: 500,
      ...options
    };

    this.addEventListeners();
  }

  private addEventListeners() {
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel, { passive: false });
  }

  private handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();

    // Long press detection
    this.longPressTimer = setTimeout(() => {
      if (this.options.onLongPress) {
        this.options.onLongPress();
      }
    }, this.options.longPressDelay);
  };

  private handleTouchMove = (e: TouchEvent) => {
    // Cancel long press if moved
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    // Clear long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const deltaTime = endTime - this.startTime;

    // Detect swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.options.threshold!) {
      if (deltaX > 0 && this.options.onSwipeRight) {
        this.options.onSwipeRight();
      } else if (deltaX < 0 && this.options.onSwipeLeft) {
        this.options.onSwipeLeft();
      }
    } else if (Math.abs(deltaY) > this.options.threshold!) {
      if (deltaY > 0 && this.options.onSwipeDown) {
        this.options.onSwipeDown();
      } else if (deltaY < 0 && this.options.onSwipeUp) {
        this.options.onSwipeUp();
      }
    } else if (deltaTime < 200) {
      // Tap detection
      this.tapCount++;
      
      if (this.tapCount === 1) {
        this.tapTimer = setTimeout(() => {
          if (this.tapCount === 1 && this.options.onTap) {
            this.options.onTap();
          }
          this.tapCount = 0;
        }, 300);
      } else if (this.tapCount === 2) {
        if (this.tapTimer) {
          clearTimeout(this.tapTimer);
        }
        if (this.options.onDoubleTap) {
          this.options.onDoubleTap();
        }
        this.tapCount = 0;
      }
    }
  };

  private handleTouchCancel = () => {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    if (this.tapTimer) {
      clearTimeout(this.tapTimer);
      this.tapTimer = null;
    }
    this.tapCount = 0;
  };

  public destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
    
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    if (this.tapTimer) {
      clearTimeout(this.tapTimer);
    }
  }
}

// React Hook for touch gestures
export const useTouchGestures = (options: TouchGestureOptions) => {
  const elementRef = React.useRef<HTMLElement>(null);
  const gestureRef = React.useRef<TouchGestures | null>(null);

  React.useEffect(() => {
    if (elementRef.current) {
      gestureRef.current = new TouchGestures(elementRef.current, options);
    }

    return () => {
      if (gestureRef.current) {
        gestureRef.current.destroy();
      }
    };
  }, [options]);

  return elementRef;
};
