import React from 'react';
import { BUILDER_SECTIONS } from './registry';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

const Section = ({ id, title, icon, render, toggleSection, openSection }: any) => (
  <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white">
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className="w-full px-5 py-4 flex items-center justify-between transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99]"
    >
      <div className="flex items-center gap-2 flex-row-reverse">
        {icon}
        <span className="font-black text-sm">{title}</span>
      </div>
      <ChevronLeft className={`w-5 h-5 transition-transform ${openSection === id ? 'rotate-90' : 'rotate-180'}`} />
    </button>
    <AnimatePresence initial={false}>
      {openSection === id && (
        <MotionDiv
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-5 pb-5 overflow-hidden"
        >
          {typeof render === 'function' ? render() : null}
        </MotionDiv>
      )}
    </AnimatePresence>
  </div>
);

const SectionRenderer: React.FC<SectionRendererProps> = (props) => {
  const { activeBuilderTab, toggleSection, openSection, ...renderProps } = props;

  const isClinic = props.shop?.category === 'SERVICE';



  const visibleSections = BUILDER_SECTIONS.filter((s) => {
    if (isClinic) {
      return [
        'themes',
        'clinicDoctors',
        'clinicBooking',
        'clinicServices',
        'homeExperience',
        'footer',
        'customPages',
      ].includes(s.id);
    }
    return ![
      'clinicDoctors',
      'clinicBooking',
      'clinicServices',
    ].includes(s.id);
  });

  if (activeBuilderTab) {
    const s = visibleSections.find((x) => String(x.id) === String(activeBuilderTab));
    if (!s) return null;
    return <>{s.render(renderProps)}</>;
  }

  return (
    <div className="space-y-4">
      {visibleSections.map((s) => (
        <Section
          key={s.id}
          id={s.id}
          title={s.title}
          icon={s.icon}
          toggleSection={toggleSection}
          openSection={openSection}
          render={() => s.render(renderProps)}
        />
      ))}
    </div>
  );
};

export default React.memo(SectionRenderer);
