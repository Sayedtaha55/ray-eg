'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Settings,
  ChevronRight,
  Loader2,
  UserRound,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  UnlockKeyhole,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Bell,
  Zap,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { useShop } from '@/hooks/useShop';
import {
  loadPosSettings,
  savePosSettings,
  CASHIER_PERMISSIONS,
  type PosSettings,
  type PosCashier,
} from '@/lib/posSettings';

const isArabic = true;
const ADMIN_UNLOCK_KEY = 'pos_admin_unlocked';

const genId = () => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      return crypto.randomUUID();
  } catch {}
  return `c_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
};

/** Small pill-style toggle switch: ON purple / OFF slate (RTL-aware knob). */
const ToggleRow: React.FC<{
  label: string;
  desc?: string;
  on: boolean;
  disabled?: boolean;
  onToggle: () => void;
}> = ({ label, desc, on, disabled, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    className="w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 text-right hover:border-purple-100 transition-all disabled:opacity-50"
  >
    <span className="min-w-0">
      <span className="block font-black text-slate-900 text-sm">{label}</span>
      {desc ? (
        <span className="block text-[11px] font-bold text-slate-400 mt-0.5">{desc}</span>
      ) : null}
    </span>
    <span
      className={`shrink-0 w-11 h-6 rounded-full flex items-center p-0.5 transition-colors ${
        on ? 'bg-[#BD00FF] justify-end' : 'bg-slate-300 justify-start'
      }`}
    >
      <span className="w-5 h-5 rounded-full bg-white shadow transition-transform" />
    </span>
  </button>
);

const POSCashierSettingsPage: React.FC = () => {
  const { shop, loading: shopLoading } = useShop();
  const [posSettings, setPosSettings] = useState<PosSettings | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  // admin gate
  const [gatePin, setGatePin] = useState('');
  const [createPin, setCreatePin] = useState('');
  const [createPin2, setCreatePin2] = useState('');
  const [gateError, setGateError] = useState('');
  const [gateSaving, setGateSaving] = useState(false);

  // change admin PIN
  const [showChangePin, setShowChangePin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPin2, setNewPin2] = useState('');
  const [changeError, setChangeError] = useState('');

  // cashier management
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cName, setCName] = useState('');
  const [cPin, setCPin] = useState('');
  const [cPerms, setCPerms] = useState<Set<string>>(new Set());
  const [showPinFor, setShowPinFor] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((type: 'success' | 'error' | 'info', msg: string) => {
    setFeedback({ type, msg });
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3500);
  }, []);

  useEffect(() => {
    if (shopLoading) return;
    setPosSettings(loadPosSettings(shop));
    try {
      if (sessionStorage.getItem(ADMIN_UNLOCK_KEY) === '1') setUnlocked(true);
    } catch {}
  }, [shop, shopLoading]);

  const persist = useCallback(
    async (next: PosSettings, successMsg: string) => {
      setSaving(true);
      try {
        await savePosSettings(shop, next);
        setPosSettings(next);
        // let the bell watcher (and any POS listener) pick up the new settings live
        try {
          window.dispatchEvent(
            new CustomEvent('pos-settings-changed', { detail: { posSettings: next } })
          );
        } catch {}
        showFeedback('success', successMsg);
        return true;
      } catch (e: any) {
        showFeedback('error', e?.message || (isArabic ? 'فشل الحفظ' : 'Failed to save'));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [shop, showFeedback]
  );

  const markUnlocked = () => {
    setUnlocked(true);
    try {
      sessionStorage.setItem(ADMIN_UNLOCK_KEY, '1');
    } catch {}
  };

  // ─── Admin PIN gate ─────────────────────────────────────────────
  const handleCreateAdminPin = async () => {
    setGateError('');
    if (!/^\d{4,6}$/.test(createPin)) {
      setGateError(isArabic ? 'الرمز لازم يكون من 4 لـ 6 أرقام' : 'PIN must be 4-6 digits');
      return;
    }
    if (createPin !== createPin2) {
      setGateError(isArabic ? 'الرمزين مش متطابقين' : 'PINs do not match');
      return;
    }
    setGateSaving(true);
    const ok = await persist(
      { ...(posSettings || { cashiers: [] }), adminPin: createPin },
      isArabic ? 'تم إنشاء رمز الإدارة' : 'Admin PIN created'
    );
    setGateSaving(false);
    if (ok) {
      markUnlocked();
      setCreatePin('');
      setCreatePin2('');
    }
  };

  const handleUnlock = () => {
    setGateError('');
    if (gatePin === (posSettings?.adminPin || '')) {
      markUnlocked();
      setGatePin('');
    } else setGateError(isArabic ? 'الرقم السري غير صحيح' : 'Wrong PIN');
  };

  const handleChangeAdminPin = async () => {
    setChangeError('');
    if (oldPin !== (posSettings?.adminPin || '')) {
      setChangeError(isArabic ? 'الرقم السري القديم غير صحيح' : 'Wrong current PIN');
      return;
    }
    if (!/^\d{4,6}$/.test(newPin)) {
      setChangeError(
        isArabic ? 'الرمز الجديد لازم يكون من 4 لـ 6 أرقام' : 'New PIN must be 4-6 digits'
      );
      return;
    }
    if (newPin !== newPin2) {
      setChangeError(isArabic ? 'الرمزين مش متطابقين' : 'PINs do not match');
      return;
    }
    setSaving(true);
    const ok = await persist(
      { ...(posSettings || { cashiers: [] }), adminPin: newPin },
      isArabic ? 'تم تغيير رمز الإدارة' : 'Admin PIN changed'
    );
    if (ok) {
      setShowChangePin(false);
      setOldPin('');
      setNewPin('');
      setNewPin2('');
    }
  };

  // ─── Cashier accounts ───────────────────────────────────────────
  const openAddForm = () => {
    setEditingId(null);
    setCName('');
    setCPin('');
    setCPerms(new Set());
    setFormOpen(true);
  };
  const openEditForm = (c: PosCashier) => {
    setEditingId(c.id);
    setCName(c.name);
    setCPin(c.pin);
    setCPerms(new Set(c.permissions));
    setFormOpen(true);
  };
  const togglePerm = (key: string) => {
    setCPerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const handleSaveCashier = async () => {
    const base = posSettings || { cashiers: [] };
    if (!cName.trim()) {
      showFeedback('error', isArabic ? 'اسم الكاشير مطلوب' : 'Cashier name is required');
      return;
    }
    if (!/^\d{4,6}$/.test(cPin)) {
      showFeedback(
        'error',
        isArabic ? 'الرقم السري لازم يكون من 4 لـ 6 أرقام' : 'PIN must be 4-6 digits'
      );
      return;
    }
    const duplicate = base.cashiers.some((c) => c.pin === cPin && c.id !== editingId);
    if (duplicate) {
      showFeedback(
        'error',
        isArabic ? 'الرقم السري مستخدم بالفعل لكاشير تاني' : 'PIN already used by another cashier'
      );
      return;
    }
    const cashier: PosCashier = {
      id: editingId || genId(),
      name: cName.trim(),
      pin: cPin,
      permissions: Array.from(cPerms),
    };
    const cashiers = editingId
      ? base.cashiers.map((c) => (c.id === editingId ? cashier : c))
      : [...base.cashiers, cashier];
    const ok = await persist(
      { ...base, cashiers },
      editingId
        ? isArabic
          ? 'تم تحديث الكاشير'
          : 'Cashier updated'
        : isArabic
          ? 'تمت إضافة الكاشير'
          : 'Cashier added'
    );
    if (ok) {
      setFormOpen(false);
      setEditingId(null);
      setCName('');
      setCPin('');
      setCPerms(new Set());
    }
  };
  const handleDeleteCashier = async (id: string) => {
    const base = posSettings || { cashiers: [] };
    const ok = await persist(
      { ...base, cashiers: base.cashiers.filter((c) => c.id !== id) },
      isArabic ? 'تم حذف الكاشير' : 'Cashier deleted'
    );
    if (ok) setDeleteId(null);
  };

  // ─── Notification + auto-confirm toggles ────────────────────────
  // Toggle edits stay LOCAL until the merchant presses «حفظ التعديلات».
  const [togglesDirty, setTogglesDirty] = useState(false);
  const handleToggleNotification = (key: 'sound' | 'banner') => {
    const base = posSettings || { cashiers: [] };
    const current = base.notifications || { sound: true, banner: true };
    setPosSettings({ ...base, notifications: { ...current, [key]: current[key] === false } });
    setTogglesDirty(true);
    showFeedback('info', isArabic ? 'اضغط «حفظ التعديلات» لتطبيق التغيير' : 'Press Save to apply');
  };
  const handleToggleAutoConfirm = () => {
    const base = posSettings || { cashiers: [] };
    setPosSettings({ ...base, autoConfirmOrders: base.autoConfirmOrders !== true });
    setTogglesDirty(true);
    showFeedback('info', isArabic ? 'اضغط «حفظ التعديلات» لتطبيق التغيير' : 'Press Save to apply');
  };
  const handleSaveToggles = async () => {
    if (!posSettings) return;
    const ok = await persist(
      posSettings,
      isArabic ? 'تم حفظ التعديلات وتطبيقها فورًا' : 'Settings saved and applied'
    );
    if (ok) setTogglesDirty(false);
  };

  const gateLoading = shopLoading || posSettings === null;

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm min-h-[60vh]">
      <div className="flex flex-col gap-4 md:gap-6 mb-6 md:flex-row md:items-center md:justify-between">
        <div className="text-right">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-2">
            <Settings size={24} className="text-[#BD00FF]" />
            {isArabic ? 'إعدادات الكاشير' : 'Cashier Settings'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">
            {isArabic
              ? 'حسابات الكاشير والصلاحيات ورمز الإدارة'
              : 'Cashier accounts, permissions and admin PIN'}
          </p>
        </div>
        <Link
          href="/dashboard/pos"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all w-fit"
        >
          <ChevronRight size={16} className="rotate-180" />
          {isArabic ? 'العودة للكاشير' : 'Back to POS'}
        </Link>
      </div>

      {gateLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
      ) : !unlocked && !posSettings!.adminPin ? (
        /* ─── Create admin PIN ─── */
        <div className="max-w-md mx-auto py-8 space-y-4 text-right">
          <div className="text-center mb-2">
            <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={28} className="text-[#BD00FF]" />
            </div>
            <p className="font-black text-slate-900 text-lg">
              {isArabic ? 'إنشاء رمز الإدارة' : 'Create admin PIN'}
            </p>
            <p className="text-xs text-slate-400 font-bold mt-1">
              {isArabic
                ? 'الرمز بيحمي حسابات الكاشير والإعدادات'
                : 'Protects cashier accounts and settings'}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500">
              {isArabic ? 'الرمز الجديد (4-6 أرقام)' : 'New PIN (4-6 digits)'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={createPin}
              onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••"
              autoComplete="off"
              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none text-sm font-black text-center tracking-[0.4em] focus:ring-2 focus:ring-[#BD00FF]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500">
              {isArabic ? 'تأكيد الرمز' : 'Confirm PIN'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={createPin2}
              onChange={(e) => setCreatePin2(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••"
              autoComplete="off"
              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none text-sm font-black text-center tracking-[0.4em] focus:ring-2 focus:ring-[#BD00FF]"
            />
          </div>
          {gateError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">
              {gateError}
            </div>
          )}
          <button
            type="button"
            onClick={handleCreateAdminPin}
            disabled={gateSaving}
            className="w-full py-3.5 rounded-2xl bg-[#BD00FF] text-white font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {gateSaving ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
            {isArabic ? 'إنشاء ومتابعة' : 'Create & continue'}
          </button>
        </div>
      ) : !unlocked ? (
        /* ─── Unlock screen ─── */
        <div className="max-w-md mx-auto py-8 space-y-4 text-right">
          <div className="text-center mb-2">
            <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-3">
              <Lock size={28} className="text-[#BD00FF]" />
            </div>
            <p className="font-black text-slate-900 text-lg">
              {isArabic ? 'أدخل رمز الإدارة' : 'Enter admin PIN'}
            </p>
            <p className="text-xs text-slate-400 font-bold mt-1">
              {isArabic ? 'لعرض وإدارة حسابات الكاشير' : 'To view and manage cashier accounts'}
            </p>
          </div>
          <input
            type="password"
            inputMode="numeric"
            value={gatePin}
            onChange={(e) => setGatePin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUnlock();
            }}
            placeholder="••••"
            autoComplete="off"
            className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none text-sm font-black text-center tracking-[0.4em] focus:ring-2 focus:ring-[#BD00FF]"
          />
          {gateError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">
              {gateError}
            </div>
          )}
          <button
            type="button"
            onClick={handleUnlock}
            className="w-full py-3.5 rounded-2xl bg-[#BD00FF] text-white font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <UnlockKeyhole size={16} />
            {isArabic ? 'فتح' : 'Unlock'}
          </button>
        </div>
      ) : (
        /* ─── Unlocked: management ─── */
        <div className="space-y-5">
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}
            >
              {feedback.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
              {feedback.msg}
            </div>
          )}

          {/* Change admin PIN */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowChangePin((v) => !v);
                setChangeError('');
              }}
              className="w-full flex items-center justify-between text-right"
            >
              <span className="font-black text-slate-900 text-sm flex items-center gap-2">
                <KeyRound size={16} className="text-[#BD00FF]" />
                {isArabic ? 'تغيير رمز الإدارة' : 'Change admin PIN'}
              </span>
              <span
                className={`text-slate-400 transition-transform ${showChangePin ? 'rotate-90' : ''}`}
              >
                <ChevronRight size={16} className="rotate-90" />
              </span>
            </button>
            {showChangePin && (
              <div className="mt-3 space-y-2.5">
                <input
                  type="password"
                  inputMode="numeric"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={isArabic ? 'الرمز القديم' : 'Current PIN'}
                  autoComplete="off"
                  className="w-full bg-white border rounded-xl py-2.5 px-4 outline-none text-sm font-black text-center tracking-[0.4em] focus:ring-2 focus:ring-[#BD00FF]"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={isArabic ? 'الرمز الجديد (4-6 أرقام)' : 'New PIN (4-6 digits)'}
                  autoComplete="off"
                  className="w-full bg-white border rounded-xl py-2.5 px-4 outline-none text-sm font-black text-center tracking-[0.4em] focus:ring-2 focus:ring-[#BD00FF]"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  value={newPin2}
                  onChange={(e) => setNewPin2(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={isArabic ? 'تأكيد الرمز الجديد' : 'Confirm new PIN'}
                  autoComplete="off"
                  className="w-full bg-white border rounded-xl py-2.5 px-4 outline-none text-sm font-black text-center tracking-[0.4em] focus:ring-2 focus:ring-[#BD00FF]"
                />
                {changeError && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold">
                    {changeError}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleChangeAdminPin}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {isArabic ? 'حفظ الرمز الجديد' : 'Save new PIN'}
                </button>
              </div>
            )}
          </div>

          {/* Cashier accounts */}
          <div className="flex items-center justify-between">
            <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
              <UserRound size={18} className="text-[#BD00FF]" />
              {isArabic ? 'حسابات الكاشير' : 'Cashier accounts'}
              <span className="text-[11px] font-black text-slate-400">
                ({posSettings!.cashiers.length})
              </span>
            </h4>
            {!formOpen && (
              <button
                type="button"
                onClick={openAddForm}
                className="px-4 py-2 rounded-xl bg-[#BD00FF] text-white font-black text-xs hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <Plus size={14} />
                {isArabic ? 'إضافة كاشير' : 'Add cashier'}
              </button>
            )}
          </div>

          {posSettings!.cashiers.length === 0 && !formOpen ? (
            <div className="text-center py-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <div className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto mb-3">
                <UserRound size={24} className="text-slate-300" />
              </div>
              <p className="font-black text-slate-700 text-sm">
                {isArabic ? 'مفيش كاشير — ضيف أول كاشير' : 'No cashiers — add your first cashier'}
              </p>
              <button
                type="button"
                onClick={openAddForm}
                className="mt-3 px-5 py-2.5 rounded-xl bg-[#BD00FF] text-white font-black text-xs hover:brightness-110 transition-all inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                {isArabic ? 'إضافة كاشير' : 'Add cashier'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {posSettings!.cashiers.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  {deleteId === c.id ? (
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-black text-red-600 flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        {isArabic ? `متأكد إنك عايز تحذف ${c.name}؟` : `Delete ${c.name}?`}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDeleteId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-black text-xs hover:bg-slate-300 transition-all"
                        >
                          {isArabic ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCashier(c.id)}
                          disabled={saving}
                          className="px-3 py-1.5 rounded-lg bg-red-500 text-white font-black text-xs hover:bg-red-600 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          {isArabic ? 'تأكيد الحذف' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <UserRound size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-slate-900 text-sm truncate">
                              {c.name}
                            </div>
                            <div
                              className="text-[11px] font-black text-slate-400 flex items-center gap-1.5 mt-0.5"
                              dir="ltr"
                            >
                              <span className="tracking-[0.25em]">
                                {showPinFor === c.id ? c.pin : '•'.repeat(c.pin.length || 4)}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowPinFor(showPinFor === c.id ? null : c.id)}
                                className="text-slate-300 hover:text-slate-500"
                                aria-label={
                                  isArabic ? 'إظهار/إخفاء الرقم السري' : 'Toggle PIN visibility'
                                }
                              >
                                {showPinFor === c.id ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditForm(c)}
                            className="p-2 rounded-lg bg-white border border-slate-100 text-slate-500 hover:text-[#BD00FF] hover:border-purple-100 transition-all"
                            title={isArabic ? 'تعديل' : 'Edit'}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(c.id)}
                            className="p-2 rounded-lg bg-white border border-slate-100 text-slate-500 hover:text-red-600 hover:border-red-100 transition-all"
                            title={isArabic ? 'حذف' : 'Delete'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {c.permissions.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                          {CASHIER_PERMISSIONS.filter((p) => c.permissions.includes(p.key)).map(
                            (p) => (
                              <span
                                key={p.key}
                                className="text-[10px] font-black text-[#BD00FF] bg-purple-50 border border-purple-100 rounded-full px-2 py-0.5"
                              >
                                {p.labelAr}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add / edit form */}
          {formOpen && (
            <div className="p-4 rounded-2xl border-2 border-purple-100 bg-gradient-to-b from-purple-50/40 to-white space-y-3">
              <div className="font-black text-slate-900 text-sm">
                {editingId
                  ? isArabic
                    ? 'تعديل كاشير'
                    : 'Edit cashier'
                  : isArabic
                    ? 'كاشير جديد'
                    : 'New cashier'}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">
                  {isArabic ? 'الاسم' : 'Name'}
                </label>
                <input
                  type="text"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder={isArabic ? 'اسم الكاشير' : 'Cashier name'}
                  className="w-full bg-white border rounded-xl py-2.5 px-4 outline-none text-sm font-bold text-right focus:ring-2 focus:ring-[#BD00FF]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">
                  {isArabic ? 'الرقم السري (4-6 أرقام)' : 'PIN (4-6 digits)'}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={cPin}
                  onChange={(e) => setCPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••"
                  autoComplete="off"
                  className="w-full bg-white border rounded-xl py-2.5 px-4 outline-none text-sm font-black text-center tracking-[0.4em] focus:ring-2 focus:ring-[#BD00FF]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">
                  {isArabic ? 'الصلاحيات' : 'Permissions'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CASHIER_PERMISSIONS.map((p) => {
                    const active = cPerms.has(p.key);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => togglePerm(p.key)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-black transition-all ${active ? 'bg-purple-50 border-purple-200 text-[#BD00FF]' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                      >
                        <span>{p.labelAr}</span>
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${active ? 'bg-[#BD00FF] border-[#BD00FF] text-white' : 'bg-white border-slate-200 text-transparent'}`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingId(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-slate-200 text-slate-700 font-black text-sm hover:bg-slate-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <X size={16} />
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveCashier}
                  disabled={saving}
                  className="flex-1 py-3 rounded-2xl bg-[#BD00FF] text-white font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {isArabic ? 'حفظ' : 'Save'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
              <Bell size={16} className="text-[#BD00FF]" />
              {isArabic ? 'الإشعارات والتنبيهات' : 'Notifications'}
            </h4>
            <ToggleRow
              label={isArabic ? 'تشغيل رنة الإشعارات' : 'Notification sound'}
              desc={
                isArabic
                  ? 'رنة تُعزف عند وصول طلب جديد للوحة'
                  : 'Plays a ring when a new order arrives'
              }
              on={posSettings!.notifications?.sound !== false}
              disabled={saving}
              onToggle={() => handleToggleNotification('sound')}
            />
            <ToggleRow
              label={isArabic ? 'إظهار إشعار الطلب الجديد' : 'New order banner'}
              desc={
                isArabic
                  ? 'البانر اللي بيظهر أعلى اللوحة عند وصول طلب'
                  : 'The banner shown at the top when an order arrives'
              }
              on={posSettings!.notifications?.banner !== false}
              disabled={saving}
              onToggle={() => handleToggleNotification('banner')}
            />
          </div>

          {/* Auto-confirm orders */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
              <Zap size={16} className="text-[#BD00FF]" />
              {isArabic ? 'تأكيد الطلبات' : 'Order confirmation'}
            </h4>
            <ToggleRow
              label={isArabic ? 'تأكيد الطلبات تلقائيًا' : 'Auto-confirm orders'}
              desc={
                isArabic
                  ? 'أي طلب من الكاشير يتأكد فورًا — مش محتاج تروح صفحة الطلبات وتأكده بنفسك'
                  : 'POS orders are confirmed instantly — no manual confirm needed'
              }
              on={posSettings!.autoConfirmOrders === true}
              disabled={saving}
              onToggle={handleToggleAutoConfirm}
            />
          </div>

          {/* حفظ التعديلات — explicit save for the toggles above */}
          <button
            type="button"
            onClick={handleSaveToggles}
            disabled={saving || !togglesDirty}
            className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
              togglesDirty
                ? 'bg-gradient-to-l from-[#BD00FF] to-[#8A00C2] text-white shadow-lg shadow-[#BD00FF]/25 hover:from-[#8A00C2] hover:to-[#BD00FF]'
                : 'bg-slate-100 text-slate-400 cursor-default'
            } disabled:opacity-60`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isArabic ? 'حفظ التعديلات' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default POSCashierSettingsPage;
