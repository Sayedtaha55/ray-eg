import React, { useState } from 'react';

const CustomPagesSection: React.FC<{ config: any; setConfig: (next: any) => void }> = ({ config, setConfig }) => {
  const pages = Array.isArray(config.customPages) ? config.customPages : [];
  const [name, setName] = useState('');

  const addPage = () => {
    const title = String(name || '').trim();
    if (!title) return;
    const next = [...pages, { id: `page-${Date.now()}`, title, content: '' }];
    setConfig({ ...config, customPages: next });
    setName('');
  };

  const updatePage = (idx: number, key: 'title' | 'content', value: string) => {
    const next = pages.map((p: any, i: number) => (i === idx ? { ...p, [key]: value } : p));
    setConfig({ ...config, customPages: next });
  };

  const removePage = (idx: number) => {
    const next = pages.filter((_: any, i: number) => i !== idx);
    setConfig({ ...config, customPages: next });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-500">أضف صفحات مخصصة باسمك وتعديل يدوي.</p>
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 p-3 rounded-xl border border-slate-200 text-sm font-bold" placeholder="اسم الصفحة الجديدة" />
        <button type="button" onClick={addPage} className="px-4 rounded-xl bg-slate-900 text-white text-xs font-black">إضافة</button>
      </div>
      <div className="space-y-3">
        {pages.map((p: any, idx: number) => (
          <div key={p.id || idx} className="border border-slate-200 rounded-2xl p-3 space-y-2">
            <div className="flex gap-2">
              <input value={String(p.title || '')} onChange={(e) => updatePage(idx, 'title', e.target.value)} className="flex-1 p-2 rounded-xl border border-slate-200 text-xs font-bold" />
              <button type="button" onClick={() => removePage(idx)} className="px-3 rounded-xl bg-red-50 text-red-700 text-xs font-black">حذف</button>
            </div>
            <textarea value={String(p.content || '')} onChange={(e) => updatePage(idx, 'content', e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 min-h-[90px] text-xs font-bold" placeholder="اكتب محتوى الصفحة" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomPagesSection;
