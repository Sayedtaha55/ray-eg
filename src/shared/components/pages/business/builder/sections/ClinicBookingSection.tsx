import React, { useState } from 'react';
import { Plus, Trash2, Clock, Calendar, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Slot = {
  time: string;
  label: string;
  available: boolean;
};

const DEFAULT_SLOTS: Slot[] = [
  { time: '05:30', label: '05:30 م', available: true },
  { time: '06:00', label: '06:00 م', available: true },
  { time: '06:30', label: '06:30 م', available: false },
  { time: '07:00', label: '07:00 م', available: true },
  { time: '07:30', label: '07:30 م', available: true },
  { time: '08:00', label: '08:00 م', available: true },
];

type Props = {
  config: any;
  setConfig: (next: any) => void;
};

const ClinicBookingSection: React.FC<Props> = ({ config, setConfig }) => {
  const { t } = useTranslation();
  const slotsList: Slot[] = Array.isArray(config.clinicSlotsList)
    ? config.clinicSlotsList
    : DEFAULT_SLOTS;

  const [time, setTime] = useState('08:30');
  const [period, setPeriod] = useState('م'); // 'م' or 'ص'
  const [available, setAvailable] = useState(true);

  const setVal = (value: Slot[]) => {
    setConfig({ ...config, clinicSlotsList: value });
  };

  const handleAddSlot = () => {
    if (!time.trim()) return;
    const label = `${time.trim()} ${period}`;
    const newSlot: Slot = {
      time: time.trim(),
      label,
      available,
    };
    // Check if slot already exists
    if (slotsList.some((s) => s.time === time.trim() && s.label === label)) return;
    setVal([...slotsList, newSlot]);
  };

  const handleToggleAvailable = (time: string, label: string) => {
    const nextList = slotsList.map((slot) => {
      if (slot.time === time && slot.label === label) {
        return { ...slot, available: !slot.available };
      }
      return slot;
    });
    setVal(nextList);
  };

  const handleDeleteSlot = (time: string, label: string) => {
    const nextList = slotsList.filter((slot) => !(slot.time === time && slot.label === label));
    setVal(nextList);
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="border-r-4 border-cyan-400 pr-2">
        <h3 className="text-xs font-black text-slate-900">أوقات العمل ومواعيد الحجوزات</h3>
        <p className="text-[10px] font-bold text-slate-500 mt-0.5">يمكنك إضافة أوقات جديدة للعيادة وتفعيل أو إيقاف الحجز في كل ساعة.</p>
      </div>

      {/* Add New Slot Form */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 shadow-inner">
        <span className="text-[10px] font-black text-cyan-600 block">إضافة موعد حجز جديد</span>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-[9px] font-black text-slate-400 block mb-0.5">الوقت (الساعة والمنيو)</label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-center"
              placeholder="مثال: 08:30"
            />
          </div>

          <div className="w-20">
            <label className="text-[9px] font-black text-slate-400 block mb-0.5">الفترة</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-center outline-none"
            >
              <option value="م">مساءً (م)</option>
              <option value="ص">صباحاً (ص)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddSlot}
            className="p-3 bg-slate-900 hover:bg-black text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[9px] font-black text-slate-400">تفعيل الحجز تلقائياً للموعد الجديد</span>
          <button
            type="button"
            onClick={() => setAvailable(!available)}
            className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all ${
              available ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {available ? 'متاح للحجز' : 'غير متاح'}
          </button>
        </div>
      </div>

      {/* Slots List */}
      <div className="space-y-2">
        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">المواعيد الحالية المتاحة ({slotsList.length})</span>
        <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto p-1 bg-slate-50/50 rounded-2xl border border-slate-100">
          {slotsList.map((slot) => (
            <div
              key={slot.time + '_' + slot.label}
              className="p-2.5 rounded-xl border bg-white flex items-center justify-between gap-2 hover:border-slate-350 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-slate-400" />
                <span className="text-xs font-black text-slate-800">{slot.label}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleAvailable(slot.time, slot.label)}
                  className={`p-1 rounded-lg border transition-all ${
                    slot.available ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'
                  }`}
                  title={slot.available ? 'تعطيل الحجز' : 'تفعيل الحجز'}
                >
                  {slot.available ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(slot.time, slot.label)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                  title="حذف"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClinicBookingSection;
