import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const ImageShapeSection: React.FC<Props> = ({ config, setConfig }) => {
  const aspectRatio = String(config.imageAspectRatio || 'square');
  const rowsConfig = (config.rowsConfig || []) as Array<{
    id: string;
    imageShape: 'square' | 'portrait' | 'landscape';
    displayMode: 'cards' | 'list' | 'minimal';
    itemsPerRow: number;
  }>;

  const addRow = () => {
    const newRows = [
      ...rowsConfig,
      { id: `row-${rowsConfig.length + 1}`, imageShape: 'square', displayMode: 'cards', itemsPerRow: 3 },
    ];
    setConfig({ ...config, rowsConfig: newRows });
  };

  const updateRow = (index: number, field: string, value: any) => {
    const newRows = [...rowsConfig];
    newRows[index] = { ...newRows[index], [field]: value };
    setConfig({ ...config, rowsConfig: newRows });
  };

  const removeRow = (index: number) => {
    const newRows = rowsConfig.filter((_, i) => i !== index);
    setConfig({ ...config, rowsConfig: newRows });
  };

  return (
    <div className="space-y-6">
      {/* Default Image Shape */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">شكل الصورة الافتراضي</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setConfig({ ...config, imageAspectRatio: 'square' })}
            className={`p-4 rounded-2xl border transition-all ${aspectRatio === 'square' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <div className="aspect-square bg-slate-100 rounded-xl mb-2 flex items-center justify-center">
              <span className="text-2xl">⬜</span>
            </div>
            <p className="font-black text-xs text-center">مربع</p>
          </button>
          <button
            onClick={() => setConfig({ ...config, imageAspectRatio: 'portrait' })}
            className={`p-4 rounded-2xl border transition-all ${aspectRatio === 'portrait' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <div className="aspect-[2/3] bg-slate-100 rounded-xl mb-2 flex items-center justify-center">
              <span className="text-2xl">📏</span>
            </div>
            <p className="font-black text-xs text-center">طول</p>
          </button>
          <button
            onClick={() => setConfig({ ...config, imageAspectRatio: 'landscape' })}
            className={`p-4 rounded-2xl border transition-all ${aspectRatio === 'landscape' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <div className="aspect-[3/2] bg-slate-100 rounded-xl mb-2 flex items-center justify-center">
              <span className="text-2xl">↔️</span>
            </div>
            <p className="font-black text-xs text-center">عرض</p>
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Advanced Rows Config */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">تخصيص الصفوف</label>
          <button
            onClick={addRow}
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition-all"
          >
            + إضافة صف
          </button>
        </div>

        {rowsConfig.length === 0 && (
          <p className="text-slate-400 text-xs text-center py-4">لا توجد صفوف مخصصة</p>
        )}

        <div className="space-y-4">
          {rowsConfig.map((row, index) => (
            <div key={row.id} className="p-4 rounded-2xl border border-slate-100 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900">الصف {index + 1}</span>
                <button
                  onClick={() => removeRow(index)}
                  className="text-red-500 font-black text-xs hover:text-red-600"
                >
                  حذف
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateRow(index, 'imageShape', 'square')}
                  className={`p-2 rounded-xl border text-center ${row.imageShape === 'square' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}
                >
                  <div className="aspect-square bg-slate-100 rounded-lg mb-1 flex items-center justify-center">
                    <span className="text-lg">⬜</span>
                  </div>
                  <p className="font-black text-[10px]">مربع</p>
                </button>
                <button
                  onClick={() => updateRow(index, 'imageShape', 'portrait')}
                  className={`p-2 rounded-xl border text-center ${row.imageShape === 'portrait' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}
                >
                  <div className="aspect-[2/3] bg-slate-100 rounded-lg mb-1 flex items-center justify-center">
                    <span className="text-lg">📏</span>
                  </div>
                  <p className="font-black text-[10px]">طول</p>
                </button>
                <button
                  onClick={() => updateRow(index, 'imageShape', 'landscape')}
                  className={`p-2 rounded-xl border text-center ${row.imageShape === 'landscape' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}
                >
                  <div className="aspect-[3/2] bg-slate-100 rounded-lg mb-1 flex items-center justify-center">
                    <span className="text-lg">↔️</span>
                  </div>
                  <p className="font-black text-[10px]">عرض</p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase block text-right">عدد العناصر</label>
                  <select
                    value={row.itemsPerRow}
                    onChange={(e) => updateRow(index, 'itemsPerRow', Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 font-black text-sm"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase block text-right">طريقة العرض</label>
                  <select
                    value={row.displayMode}
                    onChange={(e) => updateRow(index, 'displayMode', e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-black text-sm"
                  >
                    <option value="cards">كروت</option>
                    <option value="list">قائمة</option>
                    <option value="minimal">بدون بطاقات</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageShapeSection;
