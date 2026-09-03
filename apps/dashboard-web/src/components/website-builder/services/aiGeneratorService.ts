import { Website, ComponentNode, Page, DesignTokens, BusinessActivity } from '../types/builder';
import { StructuredAiPatch, PatchScope, PatchOperation } from '../types/ai';

export interface CodePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  html: string;
  css: string;
  js: string;
  tsxSnippet: string;
}

export const CODE_PRESETS: CodePreset[] = [
  {
    id: 'interactive_3d_card',
    name: 'بطاقة ثلاثية الأبعاد متوهجة (3D Glow Card)',
    category: 'مكونات تفاعلية',
    description: 'بطاقة عصرية بتأثير دوران 3D عند تحريك المؤشر مع ظل نيون متوهج وشارة متحركة.',
    icon: 'Sparkles',
    html: `<div class="custom-3d-card-wrapper">
  <div class="custom-3d-card">
    <div class="card-badge">حصري 2026</div>
    <div class="card-icon">⚡</div>
    <h3 class="card-title">خدمة VIP فائقة السرعة</h3>
    <p class="card-desc">تجربة رقمية فريدة مصممة بأحدث تقنيات الويب مع استجابة فورية وتفاعل انسيابي.</p>
    <div class="card-stats">
      <div class="stat-item"><span class="stat-val">99.9%</span><span class="stat-lbl">دقة الأداء</span></div>
      <div class="stat-item"><span class="stat-val">&lt; 15ms</span><span class="stat-lbl">سرعة التنفيذ</span></div>
    </div>
    <button class="card-action-btn" onclick="alert('تم تفعيل الخدمة بنجاح!')">ابدأ الآن مجاناً &larr;</button>
  </div>
</div>`,
    css: `.custom-3d-card-wrapper {
  perspective: 1000px;
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}
.custom-3d-card {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  border: 1px solid rgba(129, 140, 248, 0.3);
  border-radius: 1.5rem;
  padding: 2rem;
  color: #ffffff;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 20px 40px -15px rgba(99, 102, 241, 0.3);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
  position: relative;
  overflow: hidden;
}
.custom-3d-card:hover {
  transform: translateY(-8px) rotateX(4deg) rotateY(-4deg);
  box-shadow: 0 30px 60px -15px rgba(99, 102, 241, 0.5);
  border-color: rgba(165, 180, 252, 0.8);
}
.card-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(99, 102, 241, 0.25);
  color: #a5b4fc;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(129, 140, 248, 0.4);
}
.card-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: #f8fafc;
}
.card-desc {
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
}
.stat-val {
  display: block;
  font-size: 1.125rem;
  font-weight: 800;
  color: #38bdf8;
  font-family: monospace;
}
.stat-lbl {
  font-size: 0.75rem;
  color: #64748b;
}
.card-action-btn {
  width: 100%;
  background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}
.card-action-btn:hover {
  opacity: 0.95;
  transform: scale(1.02);
}`,
    js: `// Interactive 3D tilt effect on mousemove
const card = document.querySelector('.custom-3d-card');
if (card) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = \`rotateY(\${x / 15}deg) rotateX(\${-y / 15}deg) translateY(-5px)\`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
  });
}`,
    tsxSnippet: `import React, { useState } from 'react';

export default function Custom3DGlowCard() {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="p-6 bg-slate-900 text-white rounded-3xl border border-indigo-500/30 shadow-2xl hover:scale-105 transition-all duration-300">
      <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">حصري 2026</span>
      <h3 className="text-xl font-black mt-3 mb-1">خدمة VIP فائقة السرعة</h3>
      <p className="text-sm text-slate-400">تجربة رقمية فريدة مصممة بأحدث معايير الأداء.</p>
    </div>
  );
}`,
  },
  {
    id: 'live_animated_counter',
    name: 'عداد إحصائيات حي ونبض تفاعلي (Live Counter)',
    category: 'إحصائيات وبيانات',
    description: 'شريط إحصائيات متحرك مع مؤشر نبض مباشر وحساب تلقائي للزوار والطلبات الناجحة.',
    icon: 'Activity',
    html: `<div class="live-counter-bar">
  <div class="live-status-pill">
    <span class="live-indicator-dot"></span>
    <span>تحديث مباشر للبيانات</span>
  </div>
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-number" id="counter-orders">+14,850</div>
      <div class="metric-label">طلب مكتمل بنجاح</div>
      <div class="metric-badge">+18% هذا الأسبوع</div>
    </div>
    <div class="metric-card">
      <div class="metric-number" id="counter-satisfaction">99.8%</div>
      <div class="metric-label">نسبة رضا العملاء</div>
      <div class="metric-badge">تقييم 5 نجوم ⭐</div>
    </div>
    <div class="metric-card">
      <div class="metric-number" id="counter-active">342</div>
      <div class="metric-label">عميل نشط الآن</div>
      <div class="metric-badge pulse">متصلين مباشرة</div>
    </div>
  </div>
</div>`,
    css: `.live-counter-bar {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}
.live-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ecfdf5;
  color: #059669;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  margin-bottom: 1.25rem;
}
.live-indicator-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  animation: pulse-glow 1.5s infinite;
}
@keyframes pulse-glow {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}
.metric-card {
  border-right: 2px solid #f1f5f9;
  padding-right: 1rem;
}
.metric-card:last-child {
  border-right: none;
}
.metric-number {
  font-size: 1.75rem;
  font-weight: 900;
  color: #0f172a;
  font-family: monospace;
  letter-spacing: -0.05em;
}
.metric-label {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 600;
  margin-top: 0.25rem;
}
.metric-badge {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  padding: 0.2rem 0.5rem;
  border-radius: 0.375rem;
}`,
    js: `// Auto increment random live visitors
setInterval(() => {
  const activeEl = document.getElementById('counter-active');
  if (activeEl) {
    const current = parseInt(activeEl.innerText) || 340;
    const diff = Math.floor(Math.random() * 5) - 2;
    activeEl.innerText = Math.max(300, current + diff);
  }
}, 3000);`,
    tsxSnippet: `import React, { useState, useEffect } from 'react';

export default function LiveCounterWidget() {
  const [count, setCount] = useState(342);
  useEffect(() => {
    const timer = setInterval(() => setCount(c => c + (Math.random() > 0.5 ? 1 : -1)), 2500);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <div className="text-2xl font-black font-mono text-blue-600">{count}</div>
        <div className="text-xs text-slate-500 font-semibold">عميل متصل الآن</div>
      </div>
      <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
    </div>
  );
}`,
  },
  {
    id: 'floating_whatsapp_vip',
    name: 'زر واتساب VIP العائم الذكي (Floating WhatsApp)',
    category: 'إجراءات وتحويلات',
    description: 'زر واتساب عائم ذكي مع قائمة خيارات سريعة (طلب تسعيرة، حجز موعد، دعم فني) ومحادثة مسبقة.',
    icon: 'MessageCircle',
    html: `<div class="whatsapp-vip-container">
  <div class="whatsapp-popup-card" id="wa-popup">
    <div class="wa-header">
      <div class="wa-avatar">👑</div>
      <div>
        <div class="wa-title">خدمة عملاء VIP 24/7</div>
        <div class="wa-status">متواجدون لخدمتك فوراً</div>
      </div>
      <button class="wa-close" onclick="document.getElementById('wa-popup').classList.toggle('active')">&times;</button>
    </div>
    <div class="wa-body">
      <p class="wa-msg">أهلاً بك! كيف يمكننا مساعدتك اليوم؟ اختر الإجراء السريع:</p>
      <div class="wa-quick-actions">
        <a href="https://wa.me/966500000000?text=طلب%20استشارة%20أو%20تسعير" target="_blank" class="wa-action-btn">🚗 طلب تسعير فوري</a>
        <a href="https://wa.me/966500000000?text=حجز%20موعد%20تجربة%20أو%20فحص" target="_blank" class="wa-action-btn">📅 حجز موعد VIP</a>
        <a href="https://wa.me/966500000000?text=محادثة%20مباشرة%20مع%20المستشار" target="_blank" class="wa-action-btn">💬 محادثة مباشرة</a>
      </div>
    </div>
  </div>
  <button class="whatsapp-floating-btn" onclick="document.getElementById('wa-popup').classList.toggle('active')">
    <span class="wa-icon">💬</span>
    <span class="wa-btn-text">تحدث مع مستشار VIP</span>
  </button>
</div>`,
    css: `.whatsapp-vip-container {
  position: relative;
  display: inline-block;
}
.whatsapp-floating-btn {
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 0.85rem 1.75rem;
  font-weight: 800;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  box-shadow: 0 10px 25px -5px rgba(37, 211, 102, 0.5);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.whatsapp-floating-btn:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 15px 30px -5px rgba(37, 211, 102, 0.7);
}
.wa-icon {
  font-size: 1.25rem;
}
.whatsapp-popup-card {
  display: none;
  position: absolute;
  bottom: calc(100% + 1rem);
  right: 0;
  width: 320px;
  background: #ffffff;
  border-radius: 1.25rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  z-index: 100;
  animation: slideUp 0.25s ease-out;
}
.whatsapp-popup-card.active {
  display: block;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.wa-header {
  background: #075e54;
  color: #ffffff;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}
.wa-avatar {
  width: 36px;
  height: 36px;
  background: #128c7e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}
.wa-title {
  font-weight: 800;
  font-size: 0.875rem;
}
.wa-status {
  font-size: 0.6875rem;
  color: #a7f3d0;
}
.wa-close {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1.25rem;
  cursor: pointer;
  opacity: 0.8;
}
.wa-body {
  padding: 1rem;
  background: #f8fafc;
}
.wa-msg {
  font-size: 0.75rem;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}
.wa-quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.wa-action-btn {
  display: block;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 0.6rem 0.85rem;
  border-radius: 0.625rem;
  color: #0f172a;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.2s;
}
.wa-action-btn:hover {
  background: #25d366;
  color: #ffffff;
  border-color: #25d366;
}`,
    js: `// Auto open popup after 5 seconds
setTimeout(() => {
  const popup = document.getElementById('wa-popup');
  if (popup && !popup.classList.contains('active')) {
    // popup.classList.add('active');
  }
}, 5000);`,
    tsxSnippet: `import React from 'react';

export default function FloatingWhatsAppButton() {
  return (
    <a
      href="https://wa.me/966500000000"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl hover:scale-105 transition-all"
    >
      <span>💬</span>
      <span>تواصل فوري عبر الواتساب</span>
    </a>
  );
}`,
  },
  {
    id: 'cyberpunk_neon_hero',
    name: 'بانر نيون مستقبلي متوهج (Cyberpunk Neon Banner)',
    category: 'لافتات وأقسام رئيسية',
    description: 'بانر بتأثيرات إضاءة نيون متحركة، تدرجات مستقبلية، وأزرار زجاجية تفاعلية.',
    icon: 'Zap',
    html: `<div class="neon-banner-wrapper">
  <div class="neon-glow-bg"></div>
  <div class="neon-content">
    <div class="neon-tag">🚀 الجيل القادم من المنصات الرقمية</div>
    <h1 class="neon-heading">صمم موقعك بالذكاء الاصطناعي <span class="neon-highlight">بسرعة الضوء</span></h1>
    <p class="neon-subtext">أحدث محرّك لتوليد واجهات الويب فائقة السرعة مع دعم كامل لكود Next.js وتأثيرات حركة مذهلة.</p>
    <div class="neon-cta-group">
      <button class="neon-btn-primary" onclick="alert('جاري إطلاق التجربة!')">ابدأ البناء الفوري ⚡</button>
      <button class="neon-btn-secondary" onclick="alert('فتح المعرض التفاعلي')">استكشف القوالب &larr;</button>
    </div>
  </div>
</div>`,
    css: `.neon-banner-wrapper {
  position: relative;
  background: #090a10;
  border: 1px solid rgba(236, 72, 153, 0.3);
  border-radius: 2rem;
  padding: 3.5rem 2rem;
  text-align: center;
  overflow: hidden;
  box-shadow: 0 0 50px -10px rgba(168, 85, 247, 0.3);
}
.neon-glow-bg {
  position: absolute;
  top: -50%;
  left: 20%;
  width: 60%;
  height: 200%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 70%);
  filter: blur(50px);
  pointer-events: none;
  animation: rotateGlow 8s infinite alternate ease-in-out;
}
@keyframes rotateGlow {
  0% { transform: scale(0.9) rotate(0deg); }
  100% { transform: scale(1.1) rotate(15deg); }
}
.neon-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
  margin: 0 auto;
}
.neon-tag {
  display: inline-block;
  background: rgba(236, 72, 153, 0.15);
  border: 1px solid rgba(236, 72, 153, 0.4);
  color: #f472b6;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.neon-heading {
  font-size: 2.25rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.3;
  margin-bottom: 1rem;
}
.neon-highlight {
  background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.neon-subtext {
  font-size: 0.9375rem;
  color: #94a3b8;
  line-height: 1.7;
  margin-bottom: 2rem;
}
.neon-cta-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.neon-btn-primary {
  background: linear-gradient(90deg, #ec4899 0%, #a855f7 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.875rem;
  padding: 0.85rem 2rem;
  border-radius: 0.85rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 25px -5px rgba(236, 72, 153, 0.5);
  transition: all 0.25s;
}
.neon-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(236, 72, 153, 0.7);
}
.neon-btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.85rem 1.75rem;
  border-radius: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.neon-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}`,
    js: `// Optional audio or micro pulse trigger
console.log('Neon Hero Initialized');`,
    tsxSnippet: `import React from 'react';

export default function CyberpunkBanner() {
  return (
    <div className="p-12 rounded-3xl bg-slate-950 text-white text-center border border-pink-500/30 shadow-2xl">
      <span className="text-pink-400 font-bold text-xs">🚀 تقنيات الجيل القادم</span>
      <h1 className="text-3xl font-black mt-3 mb-4">تصميم فوري مدعوم بالذكاء الاصطناعي</h1>
    </div>
  );
}`,
  },
  {
    id: 'interactive_discount_calculator',
    name: 'حاسبة أسعار فورية مع كود خصم (Price Calculator)',
    category: 'تجارة ومبيعات',
    description: 'أداة تفاعلية لحساب تكلفة الخدمات واختيار الباقات مع إدخال كود كوبون خصم مباشر.',
    icon: 'CreditCard',
    html: `<div class="calc-container">
  <div class="calc-header">
    <div class="calc-title">💡 حاسبة التكلفة التقديرية الفورية</div>
    <div class="calc-subtitle">اختر حجم مشروعك واحصل على خصم فوري</div>
  </div>
  <div class="calc-body">
    <div class="calc-row">
      <label class="calc-label">باقة الخدمة المطلوبة:</label>
      <select id="calc-plan" class="calc-select" onchange="window.updateCalc && window.updateCalc()">
        <option value="1500">باقة الانطلاق السريع (1,500 ر.س)</option>
        <option value="3500" selected>باقة الشركات المتقدمة (3,500 ر.س)</option>
        <option value="7500">باقة المؤسسات الشاملة VIP (7,500 ر.س)</option>
      </select>
    </div>
    <div class="calc-row">
      <label class="calc-label">كوبون الخصم (جرب: VIP2026):</label>
      <div class="coupon-group">
        <input type="text" id="calc-coupon" placeholder="أدخل الكوبون هنا..." class="calc-input" />
        <button class="coupon-apply-btn" onclick="window.applyCoupon && window.applyCoupon()">تطبيق</button>
      </div>
    </div>
    <div class="calc-summary">
      <div class="summary-line"><span>السعر الأساسي:</span><span id="calc-base-price">3,500 ر.س</span></div>
      <div class="summary-line text-emerald"><span id="calc-discount-label">الخصم المطبق:</span><span id="calc-discount-val">0 ر.س</span></div>
      <div class="summary-total"><span>الإجمالي النهائي:</span><span id="calc-total-price">3,500 ر.س</span></div>
    </div>
    <button class="calc-submit-btn" onclick="alert('تم حجز الباقة بالسعر المخفض!')">تأكيد الحجز الفوري &larr;</button>
  </div>
</div>`,
    css: `.calc-container {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  padding: 1.75rem;
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.08);
  max-width: 440px;
  margin: 0 auto;
}
.calc-header {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
}
.calc-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: #0f172a;
}
.calc-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}
.calc-row {
  margin-bottom: 1rem;
}
.calc-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.35rem;
}
.calc-select, .calc-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.625rem;
  font-size: 0.8125rem;
  background: #f8fafc;
  color: #0f172a;
  outline: none;
}
.coupon-group {
  display: flex;
  gap: 0.5rem;
}
.coupon-apply-btn {
  background: #0f172a;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0 1.25rem;
  border-radius: 0.625rem;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}
.calc-summary {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 0.75rem;
  padding: 1rem;
  margin: 1.25rem 0;
  font-size: 0.8125rem;
}
.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #64748b;
}
.text-emerald {
  color: #059669;
  font-weight: 700;
}
.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.125rem;
  font-weight: 900;
  color: #0f172a;
  border-top: 1px solid #e2e8f0;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}
.calc-submit-btn {
  width: 100%;
  background: #2563eb;
  color: #ffffff;
  font-weight: 800;
  font-size: 0.875rem;
  padding: 0.85rem;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.calc-submit-btn:hover {
  background: #1d4ed8;
}`,
    js: `window.couponDiscount = 0;
window.updateCalc = function() {
  const select = document.getElementById('calc-plan');
  if (!select) return;
  const base = parseInt(select.value) || 3500;
  const discVal = base * window.couponDiscount;
  const total = base - discVal;
  
  document.getElementById('calc-base-price').innerText = base.toLocaleString() + ' ر.س';
  document.getElementById('calc-discount-val').innerText = '-' + discVal.toLocaleString() + ' ر.س';
  document.getElementById('calc-total-price').innerText = total.toLocaleString() + ' ر.س';
};

window.applyCoupon = function() {
  const code = (document.getElementById('calc-coupon')?.value || '').trim().toUpperCase();
  if (code === 'VIP2026' || code === 'DISCOUNT20' || code === 'المجد') {
    window.couponDiscount = 0.20;
    alert('🎉 تم تطبيق خصم 20% بنجاح!');
  } else if (code) {
    alert('عذراً، هذا الكوبون غير صالح. جرب: VIP2026');
  }
  window.updateCalc();
};`,
    tsxSnippet: `import React, { useState } from 'react';

export default function PricingCalculator() {
  const [plan, setPlan] = useState(3500);
  const [discount, setDiscount] = useState(0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md max-w-md mx-auto">
      <h3 className="font-bold text-lg mb-4">حاسبة الأسعار التفاعلية</h3>
      <div className="flex justify-between font-mono font-bold text-xl text-blue-600">
        <span>الإجمالي:</span>
        <span>{(plan - discount).toLocaleString()} ر.س</span>
      </div>
    </div>
  );
}`,
  },
];

/**
 * Intelligent Natural Language Parser for AI Modifications
 * Deeply inspects the captured component and executes targeted surgical operations
 */
export function generateStructuredAiPatch(
  prompt: string,
  scope: PatchScope,
  context: {
    selectedNode?: ComponentNode | null;
    activePage?: Page;
    website?: Website;
    currentTenant?: any;
  }
): StructuredAiPatch {
  const lower = prompt.toLowerCase();
  const operations: PatchOperation[] = [];
  const diffSummary: string[] = [];

  const targetId = context.selectedNode?.id || 'comp_hero';
  const targetNode = context.selectedNode || (context.website?.components[targetId]) || (context.website?.components['comp_hero']);
  const nodeType = targetNode?.type || 'hero';
  const nodeName = targetNode?.name || 'المكون المحدد';

  // 1. Color and Theme Intent Detection
  let primaryColor: string | null = null;
  let backgroundColor: string | null = null;
  let textColor: string | null = null;
  let backdropBlur: string | null = null;

  if (lower.includes('داكن') || lower.includes('اسود') || lower.includes('أسود') || lower.includes('dark') || lower.includes('كحلي') || lower.includes('black')) {
    backgroundColor = '#0b0f19';
    textColor = '#f8fafc';
    diffSummary.push('تحويل الخلفية إلى الوضع الليلي الداكن الفاخر (#0b0f19) مع نصوص ساطعة');
  } else if (lower.includes('ابيض') || lower.includes('أبيض') || lower.includes('فاتح') || lower.includes('light') || lower.includes('white')) {
    backgroundColor = '#ffffff';
    textColor = '#0f172a';
    diffSummary.push('تحويل الخلفية إلى النمط الأبيض النقي عالي الوضوح (#ffffff)');
  } else if (lower.includes('ذهبي') || lower.includes('gold') || lower.includes('ملكي')) {
    primaryColor = '#d97706';
    diffSummary.push('تطبيق لون ذهبي ملكي فاخر (#d97706) للعناصر التفاعلية');
  } else if (lower.includes('ازرق') || lower.includes('أزرق') || lower.includes('blue') || lower.includes('نيلي')) {
    primaryColor = '#2563eb';
    diffSummary.push('تطبيق اللون الأزرق الملكي (#2563eb) للأزرار والشارات');
  } else if (lower.includes('اخضر') || lower.includes('أخضر') || lower.includes('green') || lower.includes('زمردي')) {
    primaryColor = '#059669';
    diffSummary.push('تطبيق اللون الأخضر الزمردي (#059669)');
  } else if (lower.includes('احمر') || lower.includes('أحمر') || lower.includes('red') || lower.includes('عنابي')) {
    primaryColor = '#dc2626';
    diffSummary.push('تطبيق اللون العنابي الجريء (#dc2626)');
  } else if (lower.includes('نيون') || lower.includes('بنفسجي') || lower.includes('purple') || lower.includes('زهري')) {
    primaryColor = '#8b5cf6';
    diffSummary.push('تطبيق طابع نيون بنفسجي مستقبلي (#8b5cf6)');
  }

  // 2. Glassmorphism & Sticky Header Intent
  let isSticky = false;
  if (lower.includes('زجاجي') || lower.includes('شفاف') || lower.includes('glass') || lower.includes('blur')) {
    backdropBlur = '16px';
    backgroundColor = backgroundColor || 'rgba(255, 255, 255, 0.85)';
    diffSummary.push('تطبيق تأثير زجاجي مع ضبابية خلفية (Backdrop Blur: 16px)');
  }
  if (lower.includes('تثبيت') || lower.includes('ثبت') || lower.includes('sticky') || lower.includes('مثبت')) {
    isSticky = true;
    diffSummary.push('تثبيت المكون في أعلى الصفحة أثناء التمرير (Sticky Navigation)');
  }

  // 3. Border Radius and Shadow Intent
  let borderRadius: string | null = null;
  let boxShadow: string | null = null;

  if (lower.includes('دائري') || lower.includes('حواف') || lower.includes('round') || lower.includes('radius') || lower.includes('استدارة')) {
    borderRadius = '24px';
    diffSummary.push('زيادة استدارة الحواف إلى 24px لمظهر عصري وناعم');
  }
  if (lower.includes('ظل') || lower.includes('shadow') || lower.includes('ثلاثي') || lower.includes('فخم')) {
    boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.35)';
    diffSummary.push('إضافة ظل سحابي عميق وبارز لتعزيز العمق البصري');
  }

  // 4. Extract Quotes or Specific Text
  const quoteMatch = prompt.match(/["'«]([^"'»]+)["'»]/);
  const extractedQuote = quoteMatch ? quoteMatch[1] : null;

  // 5. COMPONENT-SPECIFIC SURGICAL LOGIC:
  const propsPatch: Record<string, any> = {};

  // --- A. HEADER & NAVIGATION TARGET ---
  if (nodeType === 'header' || targetId.includes('header') || targetId.includes('nav') || lower.includes('هدر') || lower.includes('هيدر') || lower.includes('تنقل')) {
    // 1. Changing Logo
    if (lower.includes('لوجو') || lower.includes('شعار') || lower.includes('logo') || (extractedQuote && (lower.includes('اسم') || lower.includes('اكتب')))) {
      const newLogo = extractedQuote || 'مجموعة القمة للاستثمار VIP';
      propsPatch.logoText = newLogo;
      propsPatch.text = newLogo;
      
      // If website components has header_logo, target it directly
      if (context.website?.components['header_logo']) {
        operations.push({
          op: 'UPDATE_PROPS',
          targetId: 'header_logo',
          path: 'props',
          value: { text: newLogo },
          explanation: `تحديث اسم شعار الهيدر إلى "${newLogo}"`,
        });
      }
      diffSummary.push(`تحديث شعار الهيدر إلى "${newLogo}"`);
    }

    // 2. Adding / Modifying Navigation Links
    if (lower.includes('رابط') || lower.includes('روابط') || lower.includes('قسم') || lower.includes('اقسام') || lower.includes('أقسام') || lower.includes('link') || lower.includes('nav')) {
      const currentLinks: string[] = targetNode?.props?.navLinks || ['الرئيسية', 'العروض والأسطول', 'حجز موعد', 'تواصل معنا'];
      const linksToAdd: string[] = [];

      if (lower.includes('معرض') || lower.includes('اسطول') || lower.includes('أسطول')) linksToAdd.push('معرض الأسطول VIP');
      if (lower.includes('سعر') || lower.includes('اسعار') || lower.includes('أسعار') || lower.includes('باقات')) linksToAdd.push('حاسبة الأسعار والتمويل');
      if (lower.includes('عرض') || lower.includes('عروض') || lower.includes('خصم')) linksToAdd.push('عروض 2026 الحصرية');
      if (lower.includes('خدمات') || lower.includes('صيانة') || lower.includes('ضمان')) linksToAdd.push('خدمات الضمان والصيانة');
      if (lower.includes('من نحن') || lower.includes('عنا')) linksToAdd.push('من نحن وقصتنا');
      if (lower.includes('مشاريع') || lower.includes('اعمال')) linksToAdd.push('أحدث المشاريع المنجزة');

      if (extractedQuote && !lower.includes('لوجو') && !lower.includes('شعار')) {
        linksToAdd.push(extractedQuote);
      }

      if (linksToAdd.length === 0) {
        linksToAdd.push('المعرض والأسطول', 'العروض الخاصة', 'تواصل معنا');
      }

      const mergedLinks = Array.from(new Set([...currentLinks, ...linksToAdd]));
      propsPatch.navLinks = mergedLinks;
      diffSummary.push(`إضافة وتحديث روابط الهيدر: (${linksToAdd.join('، ')})`);

      // If header_nav container exists, also inject child paragraph nodes for instant sync
      if (context.website?.components['header_nav']) {
        linksToAdd.forEach((linkText, i) => {
          const newLinkId = `nav_ai_${Date.now()}_${i}`;
          operations.push({
            op: 'insert_node',
            targetId: 'header_nav',
            path: 'childrenIds',
            value: {
              node: {
                id: newLinkId,
                name: `رابط ${linkText}`,
                type: 'paragraph',
                category: 'typography',
                parentId: 'header_nav',
                childrenIds: [],
                props: { text: linkText, url: `/${encodeURIComponent(linkText)}` },
                styles: {
                  desktop: {
                    fontSize: '15px',
                    fontWeight: '500',
                    textColor: textColor || '#475569',
                  },
                },
              },
              targetParentId: 'header_nav',
            },
            explanation: `إدراج رابط (${linkText}) في قائمة روابط الهيدر`,
          });
        });
      }
    }

    // 3. Modifying CTA in Header (e.g. WhatsApp / Booking)
    if (lower.includes('واتساب') || lower.includes('whatsapp') || lower.includes('اتصال') || lower.includes('حجز') || lower.includes('زر')) {
      const ctaText = lower.includes('واتساب') ? 'تواصل واتساب VIP' : (extractedQuote || 'احجز استشارتك الآن');
      const ctaUrl = lower.includes('واتساب') ? 'https://wa.me/966500000000' : '/contact';
      const ctaBg = lower.includes('واتساب') ? '#25d366' : (primaryColor || '#2563eb');

      propsPatch.ctaText = ctaText;
      propsPatch.ctaUrl = ctaUrl;
      diffSummary.push(`تحديث زر الهيدر إلى "${ctaText}" برابط مباشر`);

      if (context.website?.components['header_cta_btn']) {
        operations.push({
          op: 'UPDATE_PROPS',
          targetId: 'header_cta_btn',
          path: 'props',
          value: { text: ctaText, url: ctaUrl },
          explanation: 'تحديث نص ورابط زر الهيدر التفاعلي',
        });
        operations.push({
          op: 'UPDATE_STYLE',
          targetId: 'header_cta_btn',
          path: 'styles.desktop',
          value: { backgroundColor: ctaBg, textColor: '#ffffff' },
          explanation: 'تحديث لون زر الهيدر',
        });
      }
    }

    if (isSticky) propsPatch.sticky = true;
  }

  // --- B. HERO SECTION TARGET ---
  else if (nodeType === 'hero' || targetId.includes('hero') || lower.includes('هيرو') || lower.includes('رئيسي') || lower.includes('ترحيب')) {
    if (extractedQuote) {
      propsPatch.title = extractedQuote;
      diffSummary.push(`تحديث العنوان الرئيسي إلى: "${extractedQuote}"`);
    } else if (lower.includes('خصم') || lower.includes('عرض')) {
      propsPatch.badge = 'عرض حصري 2026 ✨';
      propsPatch.title = 'أقوى العروض الحصرية وتسهيلات سداد فورية';
      propsPatch.subtitle = 'استمتع بأفضل الأسعار المعتمدة مع ضمان شامل 5 سنوات وتوصيل لكافة المدن.';
      diffSummary.push('تحديث نصوص الهيرو بعروض 2026 الحصرية');
    } else if (lower.includes('vip') || lower.includes('فخام') || lower.includes('سيارات') || lower.includes('عقارات')) {
      propsPatch.badge = 'فئة أولى VIP 👑';
      propsPatch.title = 'أرقى أسطول وموديلات حصرية للتسليم الفوري';
      propsPatch.subtitle = 'خدمة مستشار VIP مخصصة وتسهيلات سداد وتمويل بدون دفعة أولى.';
      diffSummary.push('ترقية نصوص الهيرو للنمط الفاخر الرفيع');
    }

    if (lower.includes('احصائيات') || lower.includes('إحصائيات') || lower.includes('ارقام') || lower.includes('عداد')) {
      propsPatch.showMetrics = true;
      propsPatch.metrics = [
        { label: 'عميل سعيد', value: '+1,850' },
        { label: 'نسبة الرضا', value: '99.4%' },
        { label: 'ضمان معتمد', value: '5 سنوات' },
      ];
      diffSummary.push('إضافة شريط إحصائيات حي مع مؤشرات نجاح وضمان');
    }
  }

  // --- C. BENTO GRID & FEATURES TARGET ---
  else if (nodeType === 'bento' || nodeType === 'bento-grid' || nodeType === 'features' || targetId.includes('bento') || targetId.includes('feature')) {
    if (lower.includes('كارت') || lower.includes('بطاقة') || lower.includes('ميزة') || lower.includes('قسم') || lower.includes('ضيف')) {
      const currentCards = targetNode?.props?.cards || targetNode?.props?.features || [];
      const newCard = {
        id: `card_ai_${Date.now()}`,
        title: extractedQuote || 'ضمان ذهبي شامل 5 سنوات',
        description: 'تغطية شاملة لكافة الأعطال مع صيانة دورية مجانية وسيارة بديلة فورية.',
        icon: 'ShieldCheck',
        tag: 'معتمد 100%',
        accent: primaryColor || '#d97706',
      };
      propsPatch.cards = [...currentCards, newCard];
      diffSummary.push(`إضافة بطاقة ميزة جديدة: (${newCard.title})`);
    }

    if (lower.includes('3d') || lower.includes('زجاجي') || lower.includes('توهج') || lower.includes('glow')) {
      propsPatch.cardVariant = '3d_glow';
      diffSummary.push('ترقية بطاقات الميزات إلى نمط 3D التفاعلي مع توهج ناعم');
    }
  }

  // --- D. PRODUCTS & PRICING TARGET ---
  else if (nodeType === 'products' || nodeType === 'pricing' || targetId.includes('product') || targetId.includes('price')) {
    if (lower.includes('باقة') || lower.includes('منتج') || lower.includes('ضيف') || lower.includes('جديد')) {
      const currentTiers = targetNode?.props?.tiers || targetNode?.props?.products || [];
      const newTier = {
        id: `tier_ai_${Date.now()}`,
        title: extractedQuote || 'باقة VIP الشاملة',
        price: '4,900 ر.س',
        period: 'مشروع كامل',
        badge: 'الأكثر طلباً ⭐',
        isPopular: true,
        features: ['ضمان شامل 5 سنوات', 'دعم فني مخصص 24/7', 'استشارات هندسية فورية', 'خصم 20% على الصيانة'],
        ctaText: 'اختيار الباقة VIP',
      };
      propsPatch.tiers = [...currentTiers, newTier];
      diffSummary.push(`إضافة باقة/منتج جديد: (${newTier.title})`);
    }

    if (lower.includes('كوبون') || lower.includes('خصم') || lower.includes('coupon')) {
      propsPatch.showCoupon = true;
      propsPatch.defaultCoupon = 'VIP2026';
      diffSummary.push('تفعيل كود الخصم الترويجي المباشر (VIP2026)');
    }
  }

  // --- E. FAQ TARGET ---
  else if (nodeType === 'faq' || targetId.includes('faq')) {
    const currentFaqs = targetNode?.props?.faqs || [];
    const newFaq = {
      id: `faq_ai_${Date.now()}`,
      question: extractedQuote || 'ما هي طرق الدفع وتسهيلات التقسيط المتاحة؟',
      answer: 'نوفر خيارات دفع مرنة عبر تمويل بنكي بدون دفعة أولى وتقسيط ميسر يصل حتى 60 شهراً معتمد من الجهات المختصة.',
    };
    propsPatch.faqs = [...currentFaqs, newFaq];
    diffSummary.push(`إضافة سؤال شائع جديد: (${newFaq.question})`);
  }

  // --- F. INSERTING A BRAND NEW SECTION (e.g. "ضيف قسم مميزات تحته" / "ضيف حاسبة اسعار") ---
  if (lower.includes('ضيف قسم') || lower.includes('اضف قسم') || lower.includes('أضف قسم') || lower.includes('ضيف بانر') || lower.includes('ضيف عداد') || lower.includes('ضيف حاسبة')) {
    const newSectionId = `sec_ai_${Date.now()}`;
    let newSectionNode: ComponentNode;

    if (lower.includes('حاسبة') || lower.includes('اسعار') || lower.includes('سعر')) {
      newSectionNode = {
        id: newSectionId,
        name: 'حاسبة التكلفة التقديرية الفورية',
        type: 'pricing',
        category: 'section',
        parentId: context.activePage?.rootNodeId || 'page_root',
        childrenIds: [],
        props: {
          badge: 'حاسبة تفاعلية 💡',
          title: 'اختر باقتك واحصل على خصم فوري',
          subtitle: 'حساب شفاف ومباشر لكافة التكاليف مع دعم كوبونات الخصم.',
          tiers: [
            { id: 'p1', title: 'الباقة الأساسية', price: '1,500 ر.س', features: ['فحص أولي معتمد', 'تقرير فني شامل', 'ضمان شهرين'], ctaText: 'طلب الباقة' },
            { id: 'p2', title: 'باقة التميز VIP', price: '3,500 ر.س', badge: 'الأكثر اختياراً', isPopular: true, features: ['فحص 150 نقطة بالكمبيوتر', 'صيانة دورية مجانية', 'ضمان سنتين معتمد'], ctaText: 'حجز فوري VIP' },
            { id: 'p3', title: 'باقة الشركات والمؤسسات', price: '7,500 ر.س', features: ['تغطية شاملة لكافة الأسطول', 'مستشار VIP مخصص', 'ضمان 5 سنوات'], ctaText: 'تواصل للتعاقد' },
          ],
        },
        styles: {
          desktop: {
            display: 'block',
            width: '100%',
            backgroundColor: backgroundColor || '#f8fafc',
            paddingTop: '60px',
            paddingBottom: '60px',
            borderBottomWidth: '1px',
            borderColor: '#e2e8f0',
          },
        },
      };
      diffSummary.push('إدراج قسم حاسبة أسعار وباقات تفاعلية جديدة أسفل المكون المحدد');
    } else {
      newSectionNode = {
        id: newSectionId,
        name: 'قسم المميزات والضمانات الحصرية',
        type: 'features',
        category: 'section',
        parentId: context.activePage?.rootNodeId || 'page_root',
        childrenIds: [],
        props: {
          badge: 'مميزات حصرية ⭐',
          title: extractedQuote || 'لماذا يفضلنا كبار العملاء والمستثمرين؟',
          subtitle: 'خبرة متوارثة منذ أكثر من 15 عاماً بمعايير جودة وموثوقية لا تضاهى.',
          features: [
            { id: 'f1', title: 'ضمان معتمد 5 سنوات', description: 'شهادات ضمان أصلية وموثقة على كافة المبيعات والخدمات.' },
            { id: 'f2', title: 'فحص كمبيوتر 150+ نقطة', description: 'أحدث أجهزة الفحص الألمانية لضمان خلو المركبات والمنشآت من أي ملاحظات.' },
            { id: 'f3', title: 'خدمة مستشار مبيعات VIP', description: 'متابعة شخصية وتسهيلات تمويلية سريعة خلال 24 ساعة.' },
            { id: 'f4', title: 'تسليم وتوصيل مجاني', description: 'شحن آمن ومؤمن بالكامل لباب العميل في كافة المدن.' },
          ],
        },
        styles: {
          desktop: {
            display: 'block',
            width: '100%',
            backgroundColor: backgroundColor || '#ffffff',
            paddingTop: '60px',
            paddingBottom: '60px',
          },
        },
      };
      diffSummary.push(`إدراج قسم مميزات جديد (${newSectionNode.name}) أسفل المكون`);
    }

    operations.push({
      op: 'insert_node',
      targetId: targetId,
      path: 'childrenIds',
      value: {
        node: newSectionNode,
        targetParentId: context.activePage?.rootNodeId || 'page_root',
        insertAfterId: targetId,
      },
      explanation: `إدراج قسم جديد (${newSectionNode.name}) أسفل (${nodeName})`,
    });
  }

  // --- G. GENERIC TEXT & HEADING TARGET ---
  if (extractedQuote && Object.keys(propsPatch).length === 0) {
    if (nodeType === 'heading' || nodeType === 'paragraph' || nodeType === 'button') {
      propsPatch.text = extractedQuote;
    } else {
      propsPatch.title = extractedQuote;
    }
    diffSummary.push(`تحديث النص إلى: "${extractedQuote}"`);
  }

  // Compile Styles Update
  const stylePatch: Record<string, any> = {};
  if (backgroundColor) stylePatch.backgroundColor = backgroundColor;
  if (textColor) stylePatch.textColor = textColor;
  if (borderRadius) stylePatch.borderRadius = borderRadius;
  if (boxShadow) stylePatch.boxShadow = boxShadow;
  if (backdropBlur) stylePatch.backdropBlur = backdropBlur;

  if (Object.keys(stylePatch).length > 0) {
    operations.push({
      op: 'UPDATE_STYLE',
      targetId: targetId,
      path: 'styles.desktop',
      value: stylePatch,
      explanation: `تحديث النمط البصري والألوان للمكون (${nodeName})`,
    });
  }

  // Compile Props Update
  if (Object.keys(propsPatch).length > 0) {
    operations.push({
      op: 'UPDATE_PROPS',
      targetId: targetId,
      path: 'props',
      value: propsPatch,
      explanation: `تعديل خصائص ومحتوى المكون (${nodeName})`,
    });
  }

  // Theme Token Update if Theme scope or primaryColor changed
  if (scope === 'theme' || (primaryColor && scope !== 'element')) {
    const chosenColor = primaryColor || '#2563eb';
    operations.push({
      op: 'update_theme_token',
      path: 'theme.colors.primary',
      value: chosenColor,
      explanation: `تحديث لون السمة الرئيسي للعلامة التجارية إلى ${chosenColor}`,
    });
    diffSummary.push(`تحديث اللون الأساسي للعلامة التجارية إلى ${chosenColor}`);
  }

  // Fallback if no specific trigger matched
  if (operations.length === 0) {
    operations.push({
      op: 'UPDATE_PROPS',
      targetId: targetId,
      path: 'props',
      value: {
        badge: 'محدث بالذكاء الاصطناعي ⚡',
        title: targetNode?.props?.title || targetNode?.props?.text || 'محتوى مخصص ومطور',
        subtitle: prompt,
      },
      explanation: `تطبيق التعديلات النصية والوصف المخصص على (${nodeName})`,
    });
    diffSummary.push(`تحديث وتنسيق النصوص والمظهر العام لـ (${nodeName}) وفقاً للطلب`);
  }

  return {
    id: `patch_${Date.now()}`,
    targetWebsiteId: context.website?.id || 'website_active',
    scope: scope,
    description: prompt,
    summary: prompt,
    targetNodeIds: [targetId],
    targetComponentId: targetId,
    targetComponentName: nodeName,
    operations,
    diffSummary,
    estimatedRisk: 'low',
    safetyValidation: {
      passed: true,
      violatesTenantBoundary: false,
      containsForbiddenScripts: false,
      warnings: [],
    },
    appliedStatus: 'pending',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Full Website AI Generator from Prompt
 */
export function generateCompleteAiWebsite(
  prompt: string,
  animationStyle: string = 'modern_glass',
  activityCategory?: string
): Website {
  const timestamp = Date.now();
  const websiteId = `ai_site_${timestamp}`;

  // Analyze prompt keywords for styling and archetype
  const lower = prompt.toLowerCase();
  
  let primaryColor = '#2563eb';
  let secondaryColor = '#0f172a';
  let accentColor = '#38bdf8';
  let bgColor = '#ffffff';
  let surfaceColor = '#f8fafc';
  let fontHeading = 'Cairo, sans-serif';
  let brandName = 'المشروع الذكي المبتكر';
  let activity: BusinessActivity = 'general';

  if (lower.includes('عقار') || lower.includes('مقاول') || lower.includes('بناء') || lower.includes('أثاث')) {
    activity = 'real_estate';
    brandName = 'مجموعة التطوير العقاري والمقاولات';
    primaryColor = '#b45309'; // Gold amber
    secondaryColor = '#18181b';
  } else if (lower.includes('سيار') || lower.includes('مركبات') || lower.includes('معرض') || lower.includes('موتورز')) {
    activity = 'automotive';
    brandName = 'المجد موتورز للسيارات الفاخرة';
    primaryColor = '#2563eb';
    secondaryColor = '#090d16';
  } else if (lower.includes('متجر') || lower.includes('عطور') || lower.includes('ملابس') || lower.includes('تسوق')) {
    activity = 'ecommerce';
    brandName = 'متجر الأناقة والفخامة الحصري';
    primaryColor = '#4f46e5';
    secondaryColor = '#111827';
  } else if (lower.includes('مطعم') || lower.includes('كافيه') || lower.includes('قهوة') || lower.includes('أغذية')) {
    activity = 'restaurant';
    brandName = 'مطبخ الذواقة والكافيه الفاخر';
    primaryColor = '#ea580c';
    secondaryColor = '#1c1917';
  } else if (lower.includes('طبي') || lower.includes('عياد') || lower.includes('صحة') || lower.includes('أسنان')) {
    activity = 'clinic_health';
    brandName = 'المركز الطبي الاستشاري التخصصي';
    primaryColor = '#059669';
    secondaryColor = '#0f172a';
  } else if (lower.includes('تقني') || lower.includes('برمج') || lower.includes('ذكاء') || lower.includes('ألعاب') || lower.includes('saas')) {
    activity = 'tech_saas';
    brandName = 'منصة التقنيات والحلول الذكية';
    primaryColor = '#7c3aed';
    secondaryColor = '#030712';
  }

  // Animation style adaptations
  if (animationStyle === 'cyberpunk_neon') {
    bgColor = '#080811';
    surfaceColor = '#111122';
    primaryColor = '#ec4899';
    secondaryColor = '#8b5cf6';
  } else if (animationStyle === 'luxury_gold') {
    bgColor = '#0a0a0c';
    surfaceColor = '#141418';
    primaryColor = '#d97706';
    secondaryColor = '#78350f';
  } else if (animationStyle === 'minimal_clean') {
    bgColor = '#ffffff';
    surfaceColor = '#f8fafc';
  }

  // Construct components tree
  const components: Record<string, ComponentNode> = {
    // 1. Header
    [`${websiteId}_header`]: {
      id: `${websiteId}_header`,
      name: 'شريط التنقل العلوي الذكي',
      type: 'header',
      category: 'navigation',
      parentId: null,
      childrenIds: [],
      props: {
        logoText: brandName,
        logoSubtitle: 'الريادة والابتكار 2026',
        navLinks: ['الرئيسية', 'الخدمات والمنتجات', 'عن المؤسسة', 'التقييمات', 'تواصل معنا'],
        ctaText: 'احجز استشارتك الآن ⚡',
        ctaUrl: '#contact',
        sticky: true,
      },
      styles: {
        desktop: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '1rem',
          paddingBottom: '1rem',
          paddingLeft: '2rem',
          paddingRight: '2rem',
          backgroundColor: animationStyle.includes('neon') || animationStyle.includes('gold') ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          borderWidth: '1px',
          borderColor: 'rgba(226, 232, 240, 0.8)',
        },
      },
    },

    // 2. Hero Section
    [`${websiteId}_hero`]: {
      id: `${websiteId}_hero`,
      name: 'القسم الترحيبي الرئيسي (Hero)',
      type: 'hero',
      category: 'section',
      parentId: null,
      childrenIds: [],
      props: {
        badge: '✨ منصة مبتكرة معتمدة 2026',
        title: `نصنع مستقبلك مع ${brandName}`,
        subtitle: prompt || 'حلول متكاملة مصممة بأعلى معايير الجودة والاحترافية لتلبية طموحاتك وتحقيق أعلى عوائد ممكنة.',
        ctaPrimaryText: 'استكشف الخدمات والأسطول &larr;',
        ctaPrimaryUrl: '#catalog',
        ctaSecondaryText: 'تحدث مع مستشار VIP 💬',
        ctaSecondaryUrl: '#contact',
        stats: [
          { value: '+99.8%', label: 'نسبة رضا العملاء' },
          { value: '15 دقيقة', label: 'متوسط سرعة الاستجابة' },
          { value: '+5,000', label: 'مشروع منجز بنجاح' },
          { value: 'ضمان 5 سنين', label: 'شامل لكافة الخدمات' },
        ],
        heroImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&auto=format&fit=crop&q=80',
      },
      styles: {
        desktop: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: '4.5rem',
          paddingBottom: '4.5rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          backgroundColor: bgColor,
          textColor: bgColor === '#ffffff' ? '#0f172a' : '#f8fafc',
          borderWidth: '1px',
          borderColor: 'rgba(226, 232, 240, 0.4)',
        },
      },
    },

    // 3. Bento Features / Highlights
    [`${websiteId}_features`]: {
      id: `${websiteId}_features`,
      name: 'شبكة الميزات والخدمات الذكية (Bento Grid)',
      type: 'bento-grid',
      category: 'section',
      parentId: null,
      childrenIds: [],
      props: {
        badge: 'لماذا نحن خيارك الأول؟',
        title: 'معايير فائقة تصنع الفارق الحقيقي',
        subtitle: 'نجمع بين أحدث التقنيات الرقمية والخبرات الاستشارية المتخصصة لتوفير تجربة استثنائية.',
        cards: [
          {
            title: 'سرعة ودقة فائقة في الإنجاز',
            description: 'فريق عمل متكامل يعمل على مدار الساعة لضمان تسليم أعمالك بأعلى كفاءة وأسرع وقت.',
            icon: 'ShieldCheck',
            tag: 'دقة متناهية',
          },
          {
            title: 'حلول تمويل وسداد مرنة',
            description: 'برامج تقسيط ودفع ميسرة بدون فوائد مع خيارات بنكية فورية متوافقة.',
            icon: 'CreditCard',
            tag: 'تمويل فوري',
          },
          {
            title: 'ضمان ذهبي شامل 100%',
            description: 'تغطية شاملة تضمن لك راحة البال التامة مع صيانة واستبدال فوري عند الحاجة.',
            icon: 'Truck',
            tag: 'ضمان معتمد',
          },
        ],
      },
      styles: {
        desktop: {
          paddingTop: '4rem',
          paddingBottom: '4rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          backgroundColor: surfaceColor,
        },
      },
    },

    // 4. Products / Showcase
    [`${websiteId}_catalog`]: {
      id: `${websiteId}_catalog`,
      name: 'معرض المنتجات والخدمات الرئيسية',
      type: 'products',
      category: 'commerce',
      parentId: null,
      childrenIds: [],
      props: {
        badge: 'أحدث العروض الحصرية',
        title: 'اختر باقتك أو منتجك المفضل',
        subtitle: 'مجموعة مختارة بعناية تلبي أعلى متطلبات الفخامة والأداء العالي.',
        products: [
          {
            id: 'prod_1',
            title: 'الباقة الماسية الحصرية VIP',
            price: '850,000 ر.س',
            image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80',
            badge: 'الأكثر طلباً ⭐',
            specs: ['تسليم فوري خلال 24 ساعة', 'ضمان ممتد 5 سنوات مجاناً', 'خدمة مساعدة ومستشار شخصي'],
          },
          {
            id: 'prod_2',
            title: 'الباقة البلاتينية المتقدمة',
            price: '520,000 ر.س',
            image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
            badge: 'إصدار خاص',
            specs: ['فحص وتأمين شامل', 'صيانة دورية معتمدة', 'تسهيلات تمويل فورية'],
          },
          {
            id: 'prod_3',
            title: 'الباقة الذهبية الذكية',
            price: '340,000 ر.س',
            image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80',
            badge: 'قيمة استثنائية',
            specs: ['أداء عالي واستهلاك اقتصادي', 'ضمان سنتين', 'دعم فني 24/7'],
          },
        ],
      },
      styles: {
        desktop: {
          paddingTop: '4rem',
          paddingBottom: '4rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          backgroundColor: bgColor,
        },
      },
    },

    // 5. Testimonials
    [`${websiteId}_testimonials`]: {
      id: `${websiteId}_testimonials`,
      name: 'آراء وتقييمات العملاء (Testimonials)',
      type: 'testimonials',
      category: 'section',
      parentId: null,
      childrenIds: [],
      props: {
        badge: 'شهادات نعتز بها',
        title: 'ماذا يقول عملاؤنا عنا؟',
        subtitle: 'أكثر من 5,000 عميل يثقون في خدماتنا المتميزة في كافة أنحاء المملكة.',
        testimonials: [
          {
            id: 'test_1',
            quote: 'تجربة لا مثيل لها! الاحترافية في التعامل وسرعة الإنجاز والشفافية فاقت كل التوقعات.',
            author: 'م. خالد بن سلطان',
            role: 'رئيس تنفيذي - الرياض',
            rating: 5,
          },
          {
            id: 'test_2',
            quote: 'أفضل خدمة عملاء تعاملت معها على الإطلاق. المستشار كان متابعاً لكل خطوة بأدق التفاصيل.',
            author: 'د. سارة المنصور',
            role: 'استشارية طبية - جدة',
            rating: 5,
          },
          {
            id: 'test_3',
            quote: 'الجودة والضمان والاهتمام بأدق التفاصيل جعلتني أكرر التعامل وأوصي بهم لجميع زملائي.',
            author: 'أ. فهد الهاشمي',
            role: 'مستثمر ورائد أعمال - الخبر',
            rating: 5,
          },
        ],
      },
      styles: {
        desktop: {
          paddingTop: '4rem',
          paddingBottom: '4rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          backgroundColor: surfaceColor,
        },
      },
    },

    // 6. Interactive FAQ
    [`${websiteId}_faq`]: {
      id: `${websiteId}_faq`,
      name: 'الأسئلة الشائعة (Interactive FAQ)',
      type: 'faq',
      category: 'section',
      parentId: null,
      childrenIds: [],
      props: {
        badge: 'كل ما تحتاج لمعرفته',
        title: 'الأسئلة الأكثر تكراراً',
        subtitle: 'إجابات مباشرة على كافة استفسارات الشراء، الضمان، والحجز.',
        faqs: [
          {
            question: 'كيف يمكنني حجز موعد تجربة أو معاينة فورية؟',
            answer: 'يمكنك ملء استمارة التواصل بالأسفل أو التواصل مباشرة عبر الواتساب وسيتواصل معك مستشار المبيعات خلال 15 دقيقة.',
          },
          {
            question: 'ما هي خيارات التمويل المتاحة للشركات والأفراد؟',
            answer: 'نوفر حلول تمويلية معتمدة من كبرى البنوك وشركات التمويل بنسب ربح تنافسية وبدون دفعة أولى.',
          },
          {
            question: 'هل جميع المنتجات والخدمات مشمولة بضمان رسمي؟',
            answer: 'نعم، نوفر ضماناً معتمداً يصل إلى 5 سنوات مع تغطية شاملة لقطع الغيار والصيانة الدورية.',
          },
        ],
      },
      styles: {
        desktop: {
          paddingTop: '4rem',
          paddingBottom: '4rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          backgroundColor: bgColor,
        },
      },
    },

    // 7. Contact / Booking Form
    [`${websiteId}_contact`]: {
      id: `${websiteId}_contact`,
      name: 'نموذج التواصل والحجز السريع (Contact & Booking)',
      type: 'contact',
      category: 'forms',
      parentId: null,
      childrenIds: [],
      props: {
        badge: 'تواصل فوري',
        title: 'احجز استشارتك أو موعدك الآن',
        subtitle: 'املأ بياناتك وسيقوم فريقنا بالتواصل معك لتزويدك بكافة التفاصيل وعروض الأسعار.',
        submitText: 'إرسال طلب الحجز فوراً 🚀',
        phone: '+966 800 123 4567',
        whatsapp: '+966 50 000 0000',
        email: 'vip@almajd-group.sa',
        address: 'طريق الملك فهد، حي الصحافة، الرياض، المملكة العربية السعودية',
      },
      styles: {
        desktop: {
          paddingTop: '4rem',
          paddingBottom: '4rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          backgroundColor: surfaceColor,
        },
      },
    },

    // 8. Footer
    [`${websiteId}_footer`]: {
      id: `${websiteId}_footer`,
      name: 'الفوتر الذكي متعدد الروابط',
      type: 'footer',
      category: 'navigation',
      parentId: null,
      childrenIds: [],
      props: {
        brandName: brandName,
        tagline: 'الريادة والتميز في تقديم أرقى الحلول والمنتجات بأعلى المعايير العالمية.',
        columns: [
          {
            title: 'أقسام الموقع',
            links: ['الرئيسية', 'العروض والأسطول', 'المميزات والضمان', 'الأسئلة الشائعة'],
          },
          {
            title: 'خدماتنا',
            links: ['خدمة كبار الشخصيات VIP', 'التمويل والسداد المرن', 'الصيانة والفحص', 'الاستشارات'],
          },
          {
            title: 'معلومات التواصل',
            links: ['الرياض: طريق الملك فهد', 'جدة: طريق الملك عبدالعزيز', 'الخبر: الكورنيش', 'الرقم الموحد: 8001234567'],
          },
        ],
        copyright: `جميع الحقوق محفوظة © ${new Date().getFullYear()} ${brandName}. تم التطوير بأحدث تقنيات الويب.`,
      },
      styles: {
        desktop: {
          paddingTop: '3.5rem',
          paddingBottom: '2.5rem',
          paddingLeft: '2rem',
          paddingRight: '2rem',
          backgroundColor: '#090d16',
          textColor: '#f8fafc',
        },
      },
    },
  };

  const homePage: Page = {
    id: `${websiteId}_page_home`,
    name: 'الصفحة الرئيسية',
    slug: 'home',
    rootNodeId: `${websiteId}_hero`,
    metadata: {
      title: `${brandName} - الموقع الرسمي 2026`,
      description: prompt || 'الموقع الرسمي للخدمات والمنتجات الحصرية مع أعلى معايير الجودة والضمان.',
      slug: 'home',
      isHomePage: true,
      placement: 'header_direct',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const servicesPage: Page = {
    id: `${websiteId}_page_catalog`,
    name: 'الخدمات والأسطول',
    slug: 'catalog',
    rootNodeId: `${websiteId}_catalog`,
    metadata: {
      title: `العروض والأسطول - ${brandName}`,
      description: 'تصفح كافة الباقات والمنتجات المتاحة للتسليم الفوري.',
      slug: 'catalog',
      placement: 'header_direct',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const contactPage: Page = {
    id: `${websiteId}_page_contact`,
    name: 'تواصل معنا',
    slug: 'contact',
    rootNodeId: `${websiteId}_contact`,
    metadata: {
      title: `تواصل معنا - ${brandName}`,
      description: 'احجز موعدك وتحدث مع مستشار VIP على مدار الساعة.',
      slug: 'contact',
      placement: 'header_direct',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const designTokens: DesignTokens = {
    colors: {
      primary: primaryColor,
      primaryHover: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      background: bgColor,
      surface: surfaceColor,
      textPrimary: bgColor === '#ffffff' ? '#0f172a' : '#f8fafc',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      border: 'rgba(226, 232, 240, 0.8)',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    typography: {
      fontHeading: fontHeading,
      fontBody: 'Cairo, Tajawal, sans-serif',
      scaleRatio: 1.25,
      baseFontSize: '16px',
    },
    radius: {
      sm: '6px',
      md: '10px',
      lg: '16px',
      xl: '24px',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      glow: '0 0 25px rgba(37, 99, 235, 0.4)',
    },
    spacingUnit: 4,
  };

  return {
    id: websiteId,
    tenantId: 'tenant_ai_custom',
    name: brandName,
    domain: 'almajd-motors.com',
    subdomain: 'ai-site',
    activity: activity,
    language: 'ar',
    defaultDirection: 'rtl',
    pages: [homePage, servicesPage, contactPage],
    components: components,
    theme: designTokens,
    currentDraftVersion: 1,
  };
}
