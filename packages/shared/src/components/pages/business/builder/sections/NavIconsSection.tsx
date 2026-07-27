import React from 'react';
import {
  Home, ShoppingBag, Utensils, Info, FileText, Search, Star, Heart,
  Grid3x3, LayoutGrid, Package, Tag, Store, ShoppingCart, Bell,
  MessageCircle, Phone, MapPin, Clock, Calendar, User, Users, Sparkles,
  Scissors, Armchair, Stethoscope, Pill, Car, Home as HomeIcon,
  Building2, Hotel, Plane, Camera, Image, Images, BookOpen,
  ThumbsUp, Award, Zap, Flame, Gift, Crown, Coffee, Pizza,
  UtensilsCrossed, Dumbbell, Brain, HeartPulse, Baby, Glasses,
  Watch, Shirt, Footprints, Wallet, CreditCard, Barcode,
  CheckCircle, CircleDot, ListChecks, Trello, Kanban,
  type LucideIcon,
} from 'lucide-react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  shop?: any;
};

const ICON_OPTIONS: { id: string; icon: LucideIcon; label: string }[] = [
  { id: 'Home', icon: Home, label: 'بيت' },
  { id: 'ShoppingBag', icon: ShoppingBag, label: 'شنطة تسوق' },
  { id: 'ShoppingCart', icon: ShoppingCart, label: 'عربة تسوق' },
  { id: 'Store', icon: Store, label: 'متجر' },
  { id: 'Package', icon: Package, label: 'طرد' },
  { id: 'Tag', icon: Tag, label: 'علامة' },
  { id: 'LayoutGrid', icon: LayoutGrid, label: 'شبكة' },
  { id: 'Grid3x3', icon: Grid3x3, label: 'مربعات' },
  { id: 'Utensils', icon: Utensils, label: 'مطعم' },
  { id: 'UtensilsCrossed', icon: UtensilsCrossed, label: 'طعام' },
  { id: 'Coffee', icon: Coffee, label: 'قهوة' },
  { id: 'Pizza', icon: Pizza, label: 'بيتزا' },
  { id: 'Info', icon: Info, label: 'معلومات' },
  { id: 'FileText', icon: FileText, label: 'ملف' },
  { id: 'BookOpen', icon: BookOpen, label: 'كتاب' },
  { id: 'Search', icon: Search, label: 'بحث' },
  { id: 'Star', icon: Star, label: 'نجمة' },
  { id: 'Heart', icon: Heart, label: 'قلب' },
  { id: 'HeartPulse', icon: HeartPulse, label: 'نبض' },
  { id: 'ThumbsUp', icon: ThumbsUp, label: 'إعجاب' },
  { id: 'Award', icon: Award, label: 'جائزة' },
  { id: 'Zap', icon: Zap, label: 'صاعقة' },
  { id: 'Flame', icon: Flame, label: 'نار' },
  { id: 'Gift', icon: Gift, label: 'هدية' },
  { id: 'Crown', icon: Crown, label: 'تاج' },
  { id: 'Sparkles', icon: Sparkles, label: 'بريق' },
  { id: 'Bell', icon: Bell, label: 'جرس' },
  { id: 'MessageCircle', icon: MessageCircle, label: 'رسالة' },
  { id: 'Phone', icon: Phone, label: 'هاتف' },
  { id: 'MapPin', icon: MapPin, label: 'موقع' },
  { id: 'Clock', icon: Clock, label: 'ساعة' },
  { id: 'Calendar', icon: Calendar, label: 'تقويم' },
  { id: 'User', icon: User, label: 'مستخدم' },
  { id: 'Users', icon: Users, label: 'مجموعة' },
  { id: 'Scissors', icon: Scissors, label: 'مقص' },
  { id: 'Armchair', icon: Armchair, label: 'كرسي' },
  { id: 'Stethoscope', icon: Stethoscope, label: 'طب' },
  { id: 'Pill', icon: Pill, label: 'دواء' },
  { id: 'Car', icon: Car, label: 'سيارة' },
  { id: 'Building2', icon: Building2, label: 'عقار' },
  { id: 'Hotel', icon: Hotel, label: 'فندق' },
  { id: 'Plane', icon: Plane, label: 'طيران' },
  { id: 'Camera', icon: Camera, label: 'كاميرا' },
  { id: 'Image', icon: Image, label: 'صورة' },
  { id: 'Images', icon: Images, label: 'ألبوم' },
  { id: 'Dumbbell', icon: Dumbbell, label: 'رياضة' },
  { id: 'Brain', icon: Brain, label: 'عقل' },
  { id: 'Baby', icon: Baby, label: 'أطفال' },
  { id: 'Glasses', icon: Glasses, label: 'نظارة' },
  { id: 'Watch', icon: Watch, label: 'ساعة يد' },
  { id: 'Shirt', icon: Shirt, label: 'ملابس' },
  { id: 'Footprints', icon: Footprints, label: 'أحذية' },
  { id: 'Wallet', icon: Wallet, label: 'محفظة' },
  { id: 'CreditCard', icon: CreditCard, label: 'بطاقة' },
  { id: 'Barcode', icon: Barcode, label: 'باركود' },
  { id: 'CheckCircle', icon: CheckCircle, label: 'تم' },
  { id: 'CircleDot', icon: CircleDot, label: 'نقطة' },
  { id: 'ListChecks', icon: ListChecks, label: 'قائمة' },
  { id: 'Trello', icon: Trello, label: 'لوحة' },
  { id: 'Kanban', icon: Kanban, label: 'كانبان' },
];

const ICON_MAP: Record<string, LucideIcon> = {};
for (const opt of ICON_OPTIONS) {
  ICON_MAP[opt.id] = opt.icon;
}

export function getNavIcon(iconId: string | undefined, fallback: LucideIcon): LucideIcon {
  if (!iconId) return fallback;
  return ICON_MAP[iconId] || fallback;
}

const NAV_TABS = [
  { key: 'home', label: 'الرئيسية', defaultIcon: 'Home' },
  { key: 'products', label: 'المنتجات / الخدمات', defaultIcon: 'ShoppingBag' },
  { key: 'gallery', label: 'المعرض', defaultIcon: 'Utensils' },
  { key: 'info', label: 'معلومات', defaultIcon: 'Info' },
  { key: 'customPage', label: 'الصفحات المخصصة', defaultIcon: 'FileText' },
  { key: 'follow', label: 'متابعة', defaultIcon: 'Heart' },
  { key: 'share', label: 'مشاركة', defaultIcon: 'Bell' },
];

const NavIconsSection: React.FC<Props> = ({ config, setConfig }) => {
  const navIcons: Record<string, string> = (config?.navIcons as Record<string, string>) || {};

  const setIcon = (key: string, iconId: string) => {
    setConfig((prev: any) => ({
      ...prev,
      navIcons: { ...(prev?.navIcons || {}), [key]: iconId },
    }));
  };

  const [activeTab, setActiveTab] = React.useState(NAV_TABS[0].key);
  const [search, setSearch] = React.useState('');

  const currentTab = NAV_TABS.find((t) => t.key === activeTab) || NAV_TABS[0];
  const currentIconId = navIcons[activeTab] || currentTab.defaultIcon;

  const filteredOptions = search.trim()
    ? ICON_OPTIONS.filter((opt) =>
        opt.label.includes(search.trim()) || opt.id.toLowerCase().includes(search.trim().toLowerCase())
      )
    : ICON_OPTIONS;

  return (
    <div className="space-y-5">
      {/* Tab selector */}
      <div className="flex flex-wrap gap-2">
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const iconId = navIcons[tab.key] || tab.defaultIcon;
          const IconComp = ICON_MAP[iconId] || ICON_MAP[tab.defaultIcon];
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-[0.97] ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <IconComp size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="h-px bg-slate-100" />

      {/* Current selection preview */}
      <div className="flex items-center justify-between flex-row-reverse p-4 rounded-2xl bg-slate-50/60 border border-slate-50">
        <span className="font-black text-xs text-slate-700">الأيقونة الحالية لـ {currentTab.label}</span>
        <div className="flex items-center gap-2">
          {(() => {
            const IconComp = ICON_MAP[currentIconId] || ICON_MAP[currentTab.defaultIcon];
            return <IconComp size={24} className="text-slate-700" />;
          })()}
          <span className="text-[10px] font-bold text-slate-400">{currentIconId}</span>
        </div>
      </div>

      {/* Reset button */}
      <button
        type="button"
        onClick={() => {
          setConfig((prev: any) => {
            const next = { ...(prev?.navIcons || {}) };
            delete next[activeTab];
            return { ...prev, navIcons: next };
          });
        }}
        className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-500 text-xs font-black hover:bg-slate-100 transition-all"
      >
        إعادة الافتراضي
      </button>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن أيقونة..."
          className="w-full py-2.5 pr-10 pl-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/40 transition-all"
        />
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {/* Icon grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[320px] overflow-y-auto p-1">
        {filteredOptions.map((opt) => {
          const isSelected = currentIconId === opt.id;
          const IconComp = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setIcon(activeTab, opt.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all active:scale-[0.95] ${
                isSelected
                  ? 'border-[#00E5FF] bg-cyan-50/50 shadow-sm'
                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
              }`}
              title={opt.label}
            >
              <IconComp
                size={22}
                className={isSelected ? 'text-[#00E5FF]' : 'text-slate-600'}
              />
              <span className={`text-[9px] font-bold leading-tight text-center ${isSelected ? 'text-[#00E5FF]' : 'text-slate-400'}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {filteredOptions.length === 0 && (
        <div className="text-center py-8 text-xs font-bold text-slate-400">
          لا توجد أيقونات مطابقة لبحثك
        </div>
      )}
    </div>
  );
};

export default NavIconsSection;
