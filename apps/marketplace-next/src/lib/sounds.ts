let audioCache: Record<string, HTMLAudioElement> = {};
let checkedSrcs = new Set<string>();

export function playSound(src: string, volume = 0.5) {
  if (typeof window === 'undefined') return;
  if (checkedSrcs.has(src)) return;
  try {
    let audio = audioCache[src];
    if (!audio) {
      audio = new Audio(src);
      audioCache[src] = audio;
      audio.addEventListener('error', () => {
        checkedSrcs.add(src);
        delete audioCache[src];
      });
    }
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {}
}

export function playCartSound() {
  playSound('/sounds/add-to-cart.mp3', 0.5);
}

export function playOrderNotifSound() {
  playSound('/sounds/order-notif.mp3', 0.7);
}
