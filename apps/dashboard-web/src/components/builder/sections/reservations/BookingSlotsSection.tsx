'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Clock, Calendar, Check, X } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

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

interface BookingSlotsSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
}

export default function BookingSlotsSection({ config, onChange }: BookingSlotsSectionProps) {
  const slotsList: Slot[] = Array.isArray(config.clinicSlotsList)
    ? config.clinicSlotsList
    : DEFAULT_SLOTS;

  const [time, setTime] = useState('08:30');
  const [period, setPeriod] = useState('م');
  const [available, setAvailable] = useState(true);

  const setVal = (value: Slot[]) => {
    onChange({ clinicSlotsList: value });
  };

  const handleAddSlot = () => {
    if (!time.trim()) return;
    const label = `${time.trim()} ${period}`;
    const newSlot: Slot = { time: time.trim(), label, available };
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
        <p className="text-[10px] font-bold text-slate-500 mt-0.5">يمكنك إضافة أوقات جديدة ومواعيد متاحة للحجز وتفعيل أو إيقاف كل موعد.</p>
      </div>

      {/* Add New Slot Form */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 shadow-inner">
        <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
          <Plus size={14} className="text-cyan-500" />
          إضافة موعد جديد
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block text-right">الوقت</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 text-sm font-bold"
              dir="ltr"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block text-right">الفترة</label>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setPeriod('ص')}
                className={`p-2 rounded-xl border-2 text-xs font-black transition-all ${period === 'ص' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200'}`}
              >
                صباحاً
              </button>
              <button
                type="button"
                onClick={() => setPeriod('م')}
                className={`p-2 rounded-xl border-2 text-xs font-black transition-all ${period === 'م' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200'}`}
              >
                مساءً
              </button>
            </div>
          </div>
        </div>

        <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
          <span className="text-xs font-bold text-slate-700">متاح للحجز</span>
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="w-4 h-4 accent-cyan-500"
          />
        </label>

        <button
          type="button"
          onClick={handleAddSlot}
          className="w-full py-2 rounded-xl bg-cyan-500 text-white font-black text-xs hover:bg-cyan-600 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus size={14} />
          إضافة الموعد
        </button>
      </div>

      {/* Slots List */}
      <div className="space-y-2">
        <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
          <Clock size={14} className="text-cyan-500" />
          المواعيد الحالية ({slotsList.length})
        </h4>

        {slotsList.length === 0 && (
          <p className="text-center text-slate-400 text-xs py-4">لا توجد مواعيد. أضف موعد جديد.</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          {slotsList.map((slot) => (
            <div
              key={`${slot.time}-${slot.label}`}
              className={`p-2 rounded-xl border-2 flex items-center justify-between transition-all ${slot.available ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="flex items-center gap-2">
                <Clock size={14} className={slot.available ? 'text-emerald-500' : 'text-slate-400'} />
                <span className="text-xs font-black text-slate-700" dir="ltr">{slot.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleAvailable(slot.time, slot.label)}
                  className={`p-1 rounded-lg transition-all ${slot.available ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}
                >
                  {slot.available ? <Check size={12} /> : <X size={12} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(slot.time, slot.label)}
                  className="p-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
