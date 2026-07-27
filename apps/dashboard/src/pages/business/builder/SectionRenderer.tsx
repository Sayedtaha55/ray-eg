import React from 'react';
import { BUILDER_SECTIONS } from './registry';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isShopBookingActivity, getShopBookingActivityType, getBookingActivityById, getVocabulary } from '../bookings/config';
import type { BookingActivityType } from '../bookings/config';
import type { BuilderSectionId } from './registry';

const MotionDiv = motion.div as any;

interface SectionRendererProps {
  activeBuilderTab?: string;
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  shop?: any;
  logoDataUrl: string;
  setLogoDataUrl: React.Dispatch<React.SetStateAction<string>>;
  logoFile: File | null;
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
  logoSaving: boolean;
  onSaveLogo: () => void;
  bannerFile: File | null;
  setBannerFile: React.Dispatch<React.SetStateAction<File | null>>;
  bannerPreview: string;
  setBannerPreview: React.Dispatch<React.SetStateAction<string>>;
  backgroundFile: File | null;
  setBackgroundFile: React.Dispatch<React.SetStateAction<File | null>>;
  backgroundPreview: string;
  setBackgroundPreview: React.Dispatch<React.SetStateAction<string>>;
  toggleSection?: (id: string) => void;
  openSection?: string;
  forceBookingMode?: boolean;
  bookingActivityType?: string;
}

const Section = ({ id, title, icon, render, toggleSection, openSection }: any) => {
  const isOpen = openSection === id;
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full px-4 py-3 flex items-center gap-2.5 transition-colors hover:bg-slate-50 active:scale-[0.99]"
      >
        {icon}
        <span className="font-bold text-sm flex-1 text-right">{title}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 overflow-hidden"
          >
            {typeof render === 'function' ? render() : null}
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

const SECTION_GROUPS = {
  booking: (activityLabel = 'الحجوزات') => [
    { label: 'هوية المتجر وثيماته', ids: ['themes', 'colors', 'headerFooter'] },
    { label: activityLabel, ids: ['bookingProviders', 'bookingServices', 'bookingSlots'] },
    { label: 'الصفحات', ids: ['homeExperience', 'footer', 'customPages', 'customCss'] },
    { label: 'الأيقونات', ids: ['navIcons'] },
    { label: 'صفحات الهبوط', ids: ['landingTheme', 'landingHero', 'landingFeatures', 'landingSections', 'landingFaq', 'landingStyle', 'landingUrl'] },
  ],
  default: [
    { label: 'هوية المتجر وألوانه', ids: ['themes', 'colors', 'background'] },
    { label: 'الصفحة الرئيسية', ids: ['homeExperience', 'banner', 'header', 'headerFooter'] },
    { label: 'المنتجات', ids: ['productCard', 'categories', 'imageShape', 'productEditor', 'productPage', 'shoppingMode'] },
    { label: 'صفحات الهبوط', ids: ['landingTheme', 'landingHero', 'landingFeatures', 'landingSections', 'landingFaq', 'landingStyle', 'landingUrl'] },
    { label: 'التصميم والتنسيق', ids: ['layout', 'typography', 'buttons', 'navIcons'] },
    { label: 'إعدادات إضافية', ids: ['footer', 'customPages', 'customCss'] },
  ],
};

// Compute a builder section title that adapts to the active booking activity
// vocabulary so a single set of sections works for clinics, salons, hotels, etc.
const getActivityAwareSectionTitle = (
  sectionId: string,
  baseTitle: string,
  activityType?: string,
): string => {
  if (!activityType) return baseTitle;
  const vocab = getVocabulary(activityType as BookingActivityType);
  switch (sectionId) {
    case 'bookingProviders':
    case 'clinicDoctors':
      return vocab.providerPlural;
    case 'bookingServices':
    case 'clinicServices':
      return vocab.servicePlural;
    case 'bookingSlots':
    case 'clinicBooking':
      return 'الحجز';
    default:
      return baseTitle;
  }
};

// Map legacy builder tab IDs to their current names.
const BUILDER_TAB_ID_COMPAT: Record<string, string> = {
  clinicDoctors: 'bookingProviders',
  clinicServices: 'bookingServices',
  clinicBooking: 'bookingSlots',
};

const SectionRenderer: React.FC<SectionRendererProps> = (props) => {
  const { activeBuilderTab, toggleSection, openSection, forceBookingMode, bookingActivityType: bookingActivityTypeProp, ...renderProps } = props;

  const normalizedActiveBuilderTab = activeBuilderTab ? (BUILDER_TAB_ID_COMPAT[activeBuilderTab] || activeBuilderTab) : activeBuilderTab;
  const bookingActivityType = bookingActivityTypeProp || getShopBookingActivityType(props.shop);
  const bookingActivityDef = bookingActivityType ? getBookingActivityById(bookingActivityType) : undefined;
  const isBookingActivity = forceBookingMode || Boolean(bookingActivityType) || isShopBookingActivity(props.shop);

  const visibleSections = BUILDER_SECTIONS.filter((s) => {
    if (isBookingActivity) {
      return [
        'themes',
        'colors',
        'headerFooter',
        'bookingProviders',
        'bookingSlots',
        'bookingServices',
        'homeExperience',
        'footer',
        'customPages',
        'customCss',
        'navIcons',
      ].includes(s.id);
    }
    return ![
      'bookingProviders',
      'bookingSlots',
      'bookingServices',
      'clinicDoctors',
      'clinicBooking',
      'clinicServices',
    ].includes(s.id);
  });

  if (normalizedActiveBuilderTab) {
    const s = visibleSections.find((x) => String(x.id) === String(normalizedActiveBuilderTab));
    if (!s) return null;
    return <>{s.render(renderProps)}</>;
  }

  const groups = isBookingActivity ? SECTION_GROUPS.booking(bookingActivityDef?.title || 'الحجوزات') : SECTION_GROUPS.default;
  const sectionsById = new Map(visibleSections.map((s) => [s.id, s]));

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const groupSections = group.ids
          .map((id) => sectionsById.get(id as any))
          .filter((s): s is NonNullable<typeof s> => Boolean(s));
        if (groupSections.length === 0) return null;
        return (
          <div key={group.label} className="space-y-2">
            <span className="block px-1 text-[11px] font-bold text-slate-400">{group.label}</span>
            <div className="space-y-2">
              {groupSections.map((s) => (
                <Section
                  key={s.id}
                  id={s.id}
                  title={getActivityAwareSectionTitle(s.id, s.title, bookingActivityType)}
                  icon={s.icon}
                  toggleSection={toggleSection}
                  openSection={openSection}
                  render={() => s.render(renderProps)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(SectionRenderer);
