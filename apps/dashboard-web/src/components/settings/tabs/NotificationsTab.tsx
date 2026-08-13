'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '../ToastProvider';
import { apiRequest } from '@/lib/auth';

interface NotificationsTabProps {
  shop: any;
}

const DEFAULT_SOUNDS = [
  { id: 'default', name: 'الافتراضي', url: '' },
  { id: 'chime', name: 'رنين', url: '' },
  { id: 'bell', name: 'جرس', url: '' },
  { id: 'pop', name: 'بوب', url: '' },
  { id: 'none', name: 'بدون صوت', url: '' },
];

export default function NotificationsTab({ shop }: NotificationsTabProps) {
  const { toast } = useToast();
  const layout = shop?.layoutConfig && typeof shop.layoutConfig === 'object' ? shop.layoutConfig : undefined;
  const serverSoundId = String((layout as any)?.notificationSoundId || '').trim() || 'default';
  const [savedSoundId, setSavedSoundId] = useState(serverSoundId);
  const [pendingSoundId, setPendingSoundId] = useState(serverSoundId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = String((shop?.layoutConfig as any)?.notificationSoundId || '').trim() || 'default';
    setSavedSoundId(id);
    setPendingSoundId(id);
  }, [shop]);

  // Emit changes
  useEffect(() => {
    const count = String(pendingSoundId || '') !== String(savedSoundId || '') ? 1 : 0;
    try { window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'notifications', count } })); } catch {}
  }, [pendingSoundId, savedSoundId]);

  const saveNotifications = useCallback(async () => {
    const idToSave = String(pendingSoundId || '').trim();
    if (!idToSave) return false;
    setSaving(true);
    try {
      await apiRequest('/shops/me', {
        method: 'PATCH',
        body: JSON.stringify({ notificationSoundId: idToSave }),
      });
      setSavedSoundId(idToSave);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, [shop?.id, pendingSoundId]);

  useEffect(() => {
    try { window.dispatchEvent(new CustomEvent('merchant-settings-register-save-handler', { detail: { sectionId: 'notifications', handler: saveNotifications } })); } catch {}
  }, [saveNotifications]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <h3 className="text-2xl font-black">الإشعارات</h3>
      <div className="space-y-6">
        <h3 className="text-2xl font-black">أصوات الإشعارات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">اختر الصوت</label>
            <div className="space-y-3">
              {DEFAULT_SOUNDS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPendingSoundId(String(s.id))}
                  className={`w-full px-6 py-4 rounded-2xl border font-black text-sm flex items-center justify-between ${
                    pendingSoundId === String(s.id)
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-900 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className="text-[10px] opacity-70">
                    {savedSoundId === String(s.id) ? 'محفوظ' : pendingSoundId === String(s.id) ? 'مختار' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div />
        </div>
      </div>
    </div>
  );
}
