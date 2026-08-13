'use client';

import React, { useState } from 'react';
import { Stethoscope, Shield, User2, CheckCircle2, Plus, X, Edit2, Trash2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  icon: 'Stethoscope' | 'Shield' | 'User2' | 'CheckCircle2';
  duration: string;
  price: number;
}

interface ServicesSectionEnhancedProps {
  config: any;
  onChange: (updates: any) => void;
  activityType: 'CLINIC' | 'SALON' | 'HOTEL' | 'RESTAURANT' | 'GENERAL';
}

const ICONS = [
  { id: 'Stethoscope', icon: Stethoscope, name: 'طبي' },
  { id: 'Shield', icon: Shield, name: 'حماية' },
  { id: 'User2', icon: User2, name: 'مستخدم' },
  { id: 'CheckCircle2', icon: CheckCircle2, name: 'تحقق' },
];

const VOCABULARY: Record<string, { service: string; services: string }> = {
  CLINIC: { service: 'خدمة طبية', services: 'الخدمات الطبية' },
  SALON: { service: 'خدمة تجميل', services: 'الخدمات التجميلية' },
  HOTEL: { service: 'خدمة فندقية', services: 'الخدمات الفندقية' },
  RESTAURANT: { service: 'خدمة مطعم', services: 'خدمات المطعم' },
  GENERAL: { service: 'خدمة', services: 'الخدمات' },
};

export default function ServicesSectionEnhanced({
  config,
  onChange,
  activityType,
}: ServicesSectionEnhancedProps) {
  const [services, setServices] = useState<Service[]>(config.services || []);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const vocab = VOCABULARY[activityType] || VOCABULARY.GENERAL;

  const handleAddService = () => {
    if (!editingService) return;

    const newService: Service = {
      id: Date.now().toString(),
      name: editingService.name,
      icon: editingService.icon,
      duration: editingService.duration,
      price: editingService.price,
    };

    const updatedServices = [...services, newService];
    setServices(updatedServices);
    onChange({ services: updatedServices });
    
    setEditingService(null);
    setIsAdding(false);
  };

  const handleUpdateService = () => {
    if (!editingService) return;

    const updatedServices = services.map((s) =>
      s.id === editingService.id ? editingService : s
    );

    setServices(updatedServices);
    onChange({ services: updatedServices });
    
    setEditingService(null);
  };

  const handleDeleteService = (id: string) => {
    const updatedServices = services.filter((s) => s.id !== id);
    setServices(updatedServices);
    onChange({ services: updatedServices });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsAdding(false);
  };

  const getIconComponent = (iconName: string) => {
    const icon = ICONS.find((i) => i.id === iconName);
    return icon ? icon.icon : User2;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">{vocab.services}</h3>
        <button
          onClick={() => {
            setEditingService({
              id: '',
              name: '',
              icon: 'CheckCircle2',
              duration: '30 دقيقة',
              price: 0,
            });
            setIsAdding(true);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-cyan text-white text-xs font-bold hover:bg-brand-cyan/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة
        </button>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center flex-shrink-0">
                {React.createElement(getIconComponent(service.icon), {
                  className: 'w-6 h-6 text-brand-cyan',
                })}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{service.name}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>⏱️ {service.duration}</span>
                  <span>💰 {service.price} ر.س</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditService(service)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <Edit2 className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingService) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {isAdding ? `إضافة ${vocab.service}` : `تعديل ${vocab.service}`}
              </h3>
              <button
                onClick={() => {
                  setEditingService(null);
                  setIsAdding(false);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">الاسم</label>
                <input
                  type="text"
                  value={editingService?.name || ''}
                  onChange={(e) =>
                    setEditingService((prev) => ({ ...(prev || { id: '', name: '', icon: 'Stethoscope', duration: '', price: 0 }), name: e.target.value }))
                  }
                  placeholder={`اسم ${vocab.service}`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">الأيقونة</label>
                <div className="grid grid-cols-4 gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon.id}
                      onClick={() =>
                        setEditingService((prev) => ({ ...(prev || { id: '', name: '', icon: 'Stethoscope', duration: '', price: 0 }), icon: icon.id as any }))
                      }
                      className={`p-3 rounded-xl border-2 transition-all ${
                        editingService?.icon === icon.id
                          ? 'border-brand-cyan bg-brand-cyan/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {React.createElement(icon.icon, {
                        className: 'w-6 h-6',
                      })}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">المدة</label>
                <input
                  type="text"
                  value={editingService?.duration || ''}
                  onChange={(e) =>
                    setEditingService((prev) => ({ ...(prev || { id: '', name: '', icon: 'Stethoscope', duration: '', price: 0 }), duration: e.target.value }))
                  }
                  placeholder="مثال: 30 دقيقة"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">السعر</label>
                <input
                  type="number"
                  min="0"
                  value={editingService?.price || 0}
                  onChange={(e) =>
                    setEditingService((prev) => ({ ...(prev || { id: '', name: '', icon: 'Stethoscope', duration: '', price: 0 }), price: parseFloat(e.target.value) }))
                  }
                  placeholder="السعر بالريال"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={isAdding ? handleAddService : handleUpdateService}
                  className="flex-1 py-2 px-4 rounded-xl bg-brand-cyan text-white font-bold text-sm"
                >
                  {isAdding ? 'إضافة' : 'حفظ'}
                </button>
                <button
                  onClick={() => {
                    setEditingService(null);
                    setIsAdding(false);
                  }}
                  className="flex-1 py-2 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}