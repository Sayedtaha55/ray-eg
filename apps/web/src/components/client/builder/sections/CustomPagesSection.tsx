'use client';

import React, { useState } from 'react';

const PAGE_PRESETS = [
  { key: 'about', title: 'من نحن', content: 'اكتب نبذة احترافية عن نشاطك، الرؤية، والقيم التي تميزك.' },
  { key: 'delivery', title: 'سياسة التوصيل', content: 'وضح مناطق التوصيل، وقت التسليم المتوقع، ورسوم الشحن.' },
  { key: 'faq', title: 'الأسئلة الشائعة', content: 'أضف أكثر الأسئلة المتكررة مع إجابات واضحة وسريعة.' },
  { key: 'offers', title: 'العروض الحالية', content: 'اعرض أحدث العروض، مدة العرض، وشروط الاستفادة.' },
];
import { useT } from '@/i18n/useT';

const CustomPagesSection: React.FC<{ config: any; setConfig: (next: any) => void }> = ({ config, setConfig }) => {
  const t = useT();
  const pages = Array.isArray(config.customPages) ? config.customPages : [];
  const [name, setName] = useState('');
  const [presetKey, setPresetKey] = useState('about');

  const addPage = () => {
    const title = String(name || '').trim();
    if (!title) return;
    const next = [...pages, { id: `page-${Date.now()}`, title, content: '' }];
    setConfig({ ...config, customPages: next });
    setName('');
  };

  const addPresetPage = () => {
    const preset = PAGE_PRESETS.find((p) => p.key === presetKey) || PAGE_PRESETS[0];
    const next = [...pages, { id: `page-${Date.now()}`, title: preset.title, content: preset.content, enabled: true, type: preset.key }];
    setConfig({ ...config, customPages: next });
  };

  const updatePage = (idx: number, key: 'title' | 'content' | 'type' | 'enabled', value: string | boolean) => {
    const next = pages.map((p: any, i: number) => (i === idx ? { ...p, [key]: value } : p));
    setConfig({ ...config, customPages: next });
  };

  const removePage = (idx: number) => {
    const next = pages.filter((_: any, i: number) => i !== idx);
    setConfig({ ...config, customPages: next });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-500">{t('business.builder.customPages.desc', 'أضف صفحات مخصصة باسمك وتعديل يدوي.')}</p>
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 p-3 rounded-xl border border-slate-200 text-sm font-bold" placeholder={t('business.builder.customPages.namePlaceholder', 'اسم الصفحة الجديدة')} />
        <button type="button" onClick={addPage} className="px-4 rounded-xl bg-slate-900 text-white text-xs font-black">{t('business.builder.customPages.add', 'إضافة')}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <select value={presetKey} onChange={(e) => setPresetKey(e.target.value)} className="p-3 rounded-xl border border-slate-200 text-sm font-bold">
          {PAGE_PRESETS.map((preset) => <option key={preset.key} value={preset.key}>{preset.title}</option>)}
        </select>
        <button type="button" onClick={addPresetPage} className="px-4 py-3 rounded-xl bg-cyan-600 text-white text-xs font-black">إضافة صفحة جاهزة</button>
      </div>
      <div className="space-y-3">
        {pages.map((p: any, idx: number) => (
          <div key={p.id || idx} className="border border-slate-200 rounded-2xl p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <input value={String(p.title || '')} onChange={(e) => updatePage(idx, 'title', e.target.value)} className="flex-1 p-2 rounded-xl border border-slate-200 text-xs font-bold" />
              <select value={String(p.type || 'custom')} onChange={(e) => updatePage(idx, 'type', e.target.value)} className="p-2 rounded-xl border border-slate-200 text-xs font-bold">
                <option value="custom">مخصص</option>
                {PAGE_PRESETS.map((preset) => <option key={preset.key} value={preset.key}>{preset.title}</option>)}
              </select>
              <label className="text-xs font-black text-slate-600 flex items-center gap-1"><input type="checkbox" checked={Boolean(p.enabled ?? true)} onChange={(e) => updatePage(idx, 'enabled', e.target.checked)} /> تفعيل</label>
              <button type="button" onClick={() => removePage(idx)} className="px-3 rounded-xl bg-red-50 text-red-700 text-xs font-black">حذف</button>
            </div>
            <textarea value={String(p.content || '')} onChange={(e) => updatePage(idx, 'content', e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 min-h-[90px] text-xs font-bold" placeholder={t('business.builder.customPages.contentPlaceholder', 'اكتب محتوى الصفحة')} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomPagesSection;
