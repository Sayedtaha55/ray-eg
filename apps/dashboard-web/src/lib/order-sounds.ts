'use client';

/**
 * رنات الإشعارات — ملفات صوت فقط (من غير نغمات مولّدة):
 *  - public/sounds/order-website.mp3 → رنة طلب جديد من الموقع (يجي على اللوحة)
 *  - public/sounds/order-pos.mp3     → رنة طلب جديد من نقطة البيع / الكاشير
 */

const SOUND_FILES = {
  website: '/sounds/order-website.mp3',
  pos: '/sounds/order-pos.mp3',
} as const;

type SoundKind = keyof typeof SOUND_FILES;

// كاش لمكتب الصوت عشان نفس الملف يتشغّل من غير إعادة تحميل
const audioCache: Partial<Record<SoundKind, HTMLAudioElement>> = {};

function playSoundFile(kind: SoundKind) {
  if (typeof window === 'undefined') return;
  try {
    let audio = audioCache[kind];
    if (!audio) {
      audio = new Audio(SOUND_FILES[kind]);
      audio.volume = 0.9;
      audio.preload = 'auto';
      audioCache[kind] = audio;
    }
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {
    // تجاهل — مفيش fallback صوتي
  }
}

/** رنة طلب جديد من الموقع — public/sounds/order-website.mp3 */
export function ringWebsiteOrder() {
  playSoundFile('website');
}

/** رنة طلب جديد من نقطة البيع / الكاشير — public/sounds/order-pos.mp3 */
export function ringPosOrder() {
  playSoundFile('pos');
}

/**
 * فتح قفل الصوت بعد أول تفاعل من المستخدم (سياسة المتصفحات).
 * تشغيل صامت قصير يفعّل الصوت للجلسة كلها.
 */
export function primeAudio() {
  if (typeof window === 'undefined') return;
  (Object.keys(SOUND_FILES) as SoundKind[]).forEach((kind) => {
    try {
      const a = new Audio(SOUND_FILES[kind]);
      a.muted = true;
      a.volume = 0;
      const p = a.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {}
  });
}
