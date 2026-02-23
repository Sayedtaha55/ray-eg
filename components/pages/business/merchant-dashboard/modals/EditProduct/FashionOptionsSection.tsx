import React from 'react';
import { X } from 'lucide-react';

interface FashionOptionsSectionProps {
  presetColors: Array<{ name: string; value: string }>;
  selectedColors: Array<{ name: string; value: string }>;
  setSelectedColors: React.Dispatch<React.SetStateAction<Array<{ name: string; value: string }>>>;
  customColor: string;
  setCustomColor: (v: string) => void;
  presetSizes: string[];
  fashionSizeItems: any[];
  setFashionSizeItems: React.Dispatch<React.SetStateAction<any[]>>;
  customSize: string;
  setCustomSize: (v: string) => void;
}

const FashionOptionsSection: React.FC<FashionOptionsSectionProps> = ({
  presetColors,
  selectedColors,
  setSelectedColors,
  customColor,
  setCustomColor,
  presetSizes,
  fashionSizeItems,
  setFashionSizeItems,
  customSize,
  setCustomSize
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">الألوان (اختياري)</label>
        <div className="bg-slate-50 rounded-[1.5rem] p-4 border-2 border-transparent">
          <div className="flex flex-wrap gap-2 justify-end">
            {presetColors.map((c) => {
              const isActive = selectedColors.some((x) => x.value === c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    setSelectedColors((prev) => {
                      const exists = prev.some((x) => x.value === c.value);
                      if (exists) return prev.filter((x) => x.value !== c.value);
                      return [...prev, c];
                    });
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border font-black text-xs transition-all ${isActive ? 'bg-white border-[#00E5FF]/30' : 'bg-white/70 border-slate-200 hover:bg-white'}`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-slate-200"
                    style={{ background: c.value }}
                  />
                  {c.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4 gap-3 flex-row-reverse">
            <button
              type="button"
              onClick={() => {
                const hex = String(customColor || '').trim();
                if (!hex) return;
                setSelectedColors((prev) => {
                  const exists = prev.some((x) => x.value === hex);
                  if (exists) return prev;
                  return [...prev, { name: hex.toUpperCase(), value: hex }];
                });
              }}
              className="px-4 py-2 rounded-xl font-black text-xs bg-slate-900 text-white"
            >
              إضافة لون
            </button>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-12 h-10 rounded-xl border border-slate-200 bg-white"
              />
              <div className="text-xs font-black text-slate-500">اختيار لون مخصص</div>
            </div>
          </div>

          {selectedColors.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              {selectedColors.map((c) => (
                <span key={c.value} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 font-black text-xs">
                  <span className="w-4 h-4 rounded-full border border-slate-200" style={{ background: c.value }} />
                  {c.name}
                  <button
                    type="button"
                    onClick={() => setSelectedColors((prev) => prev.filter((x) => x.value !== c.value))}
                    className="p-1 rounded-full hover:bg-slate-50"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">المقاسات (اختياري)</label>
        <div className="bg-slate-50 rounded-[1.5rem] p-4 border-2 border-transparent">
          <div className="flex flex-wrap gap-2 justify-end">
            {presetSizes.map((s) => {
              const isActive = (fashionSizeItems || []).some((x) => String(x?.label || '').trim() === String(s || '').trim());
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setFashionSizeItems((prev) => {
                      const list = Array.isArray(prev) ? [...prev] : [];
                      const label = String(s || '').trim();
                      const idx = list.findIndex((x) => String(x?.label || '').trim() === label);
                      if (idx >= 0) {
                        list.splice(idx, 1);
                        return list;
                      }
                      return [...list, { label, price: '' }];
                    })
                  }
                  className={`px-4 py-2 rounded-full border font-black text-xs transition-all ${isActive ? 'bg-white border-[#00E5FF]/30' : 'bg-white/70 border-slate-200 hover:bg-white'}`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row-reverse md:items-center md:justify-between mt-4 gap-3">
            <button
              type="button"
              onClick={() => {
                const v = String(customSize || '').trim();
                if (!v) return;
                setFashionSizeItems((prev) => {
                  const list = Array.isArray(prev) ? [...prev] : [];
                  const exists = list.some((x) => String(x?.label || '').trim() === v);
                  if (exists) return list;
                  return [...list, { label: v, price: '' }];
                });
                setCustomSize('');
              }}
              className="w-full md:w-auto px-4 py-3 md:py-2 rounded-xl font-black text-xs bg-slate-900 text-white"
            >
              إضافة مقاس
            </button>
            <input
              placeholder="مثلاً: 42 أو 38"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              className="w-full md:flex-1 bg-white border border-slate-200 rounded-xl py-3 md:py-2 px-4 font-bold text-right outline-none"
            />
          </div>

          {fashionSizeItems.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              {fashionSizeItems.map((row) => (
                <span key={String(row.label)} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 font-black text-xs">
                  <span>{String(row.label)}</span>
                  <input
                    type="number"
                    value={String(row.price ?? '')}
                    onChange={(e) => {
                      const v = String(e.target.value || '');
                      setFashionSizeItems((prev) =>
                        (Array.isArray(prev) ? prev : []).map((x) =>
                          String(x?.label || '').trim() === String(row.label || '').trim() ? { ...x, price: v } : x,
                        ),
                      );
                    }}
                    className="w-16 bg-transparent border-b border-slate-200 font-black text-center focus:outline-none focus:border-[#00E5FF]"
                    placeholder="ج.م"
                  />
                  <button
                    type="button"
                    onClick={() => setFashionSizeItems((prev) => (Array.isArray(prev) ? prev : []).filter((x) => String(x?.label || '').trim() !== String(row.label || '').trim()))}
                    className="p-1 rounded-full hover:bg-slate-50"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FashionOptionsSection;
