'use client';

import React from 'react';
import { Home, ShoppingBag, Info, FileText, Heart, MessageCircle, Phone, MapPin, type LucideIcon } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface NavIconsSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: UnifiedBuilderConfig) => void;
}

const ICON_OPTIONS: { id: string; icon: LucideIcon; label: string }[] = [
  { id: 'Home', icon: Home, label: 'بيت' },
  { id: 'ShoppingBag', icon: ShoppingBag, label: 'شنطة تسوق' },
  { id: 'Info', icon: Info, label: 'معلومات' },
  { id: 'FileText', icon: FileText, label: 'ملف' },
  { id: 'Heart', icon: Heart, label: 'قلب' },
  { id: 'MessageCircle', icon: MessageCircle, label: 'رسالة' },
  { id: 'Phone', icon: Phone, label: 'هاتف' },
  { id: 'MapPin', icon: MapPin, label: 'موقع' },
];

const ICON_MAP: Record<string, LucideIcon> = {};
for (const opt of ICON_OPTIONS) {
  ICON_MAP[opt.id] = opt.icon;
}

const NAV_TABS = [
  { key: 'home', label: 'الرئيسية', defaultIcon: 'Home' },
  { key: 'products', label: 'المنتجات / الخدمات', defaultIcon: 'ShoppingBag' },
  { key: 'info', label: 'معلومات', defaultIcon: 'Info' },
  { key: 'contact', label: 'تواصل', defaultIcon: 'MessageCircle' },
  { key: 'follow', label: 'متابعة', defaultIcon: 'Heart' },
];

export default function NavIconsSection({ config, onChange }: NavIconsSectionProps) {
  const navIcons = config.navIcons || {};

  const setIcon = (tabKey: string, iconId: string) => {
    onChange({
      ...config,
      navIcons: {
        ...navIcons,
        [tabKey]: iconId,
      },
    });
  };

  const getIcon = (tabKey: string) => {
    const iconId = navIcons[tabKey];
    const tab = NAV_TABS.find(t => t.key === tabKey);
    const defaultIconId = tab?.defaultIcon || 'Home';
    return ICON_MAP[iconId || defaultIconId] || Home;
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
        أيقونات التنقل السفلي
      </div>

      <div className="space-y-3">
        {NAV_TABS.map((tab) => {
          const CurrentIcon = getIcon(tab.key);
          return (
            <div key={tab.key} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <CurrentIcon size={20} className="text-slate-600" />
                <span className="font-bold text-sm">{tab.label}</span>
              </div>

              <div className="flex gap-1">
                {ICON_OPTIONS.slice(0, 8).map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = navIcons[tab.key] === opt.id || 
                    (!navIcons[tab.key] && opt.id === (NAV_TABS.find(t => t.key === tab.key)?.defaultIcon));
                  
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setIcon(tab.key, opt.id)}
                      className={`p-2 rounded-lg transition-all ${
                        isSelected ? 'bg-brand-cyan text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                      }`}
                      title={opt.label}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}