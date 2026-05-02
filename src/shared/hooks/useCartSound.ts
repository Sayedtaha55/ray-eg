import { useCallback, useEffect } from 'react';

let sharedCtx: AudioContext | null = null;
let unlockListenersAttached = false;

const getAudioContext = (): AudioContext | null => {
  try {
    if (typeof window === 'undefined') return null;
    const AnyWindow = window as any;
    const Ctx = (window.AudioContext || AnyWindow.webkitAudioContext) as typeof AudioContext | undefined;
    if (!Ctx) return null;
    if (!sharedCtx) sharedCtx = new Ctx();
    return sharedCtx;
  } catch {
    return null;
  }
};

const resumeCtx = async () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  } catch {
  }
};

export const useCartSound = () => {
  useEffect(() => {
    if (unlockListenersAttached) return;
    unlockListenersAttached = true;

    const unlock = async () => {
      await resumeCtx();
      try {
        window.removeEventListener('pointerdown', unlock as any);
        window.removeEventListener('touchstart', unlock as any);
        window.removeEventListener('mousedown', unlock as any);
        window.removeEventListener('keydown', unlock as any);
      } catch {
      }
    };

    try {
      window.addEventListener('pointerdown', unlock as any, { passive: true } as any);
      window.addEventListener('touchstart', unlock as any, { passive: true } as any);
      window.addEventListener('mousedown', unlock as any, { passive: true } as any);
      window.addEventListener('keydown', unlock as any);
    } catch {
    }
  }, []);

  const playSound = useCallback(async () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {
          return;
        }
      }

      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.08);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.onended = () => {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
        } catch {
        }
      };

      oscillator.start(now);
      oscillator.stop(now + 0.11);
    } catch {
    }
  }, []);

  return { playSound };
};
