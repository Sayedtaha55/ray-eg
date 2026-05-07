'use client';

import React from 'react';
import { useBuilderSections, BuilderRenderCtx } from './registry';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '@/i18n/useT';

const MotionDiv = motion.div as any;

interface SectionRendererProps extends BuilderRenderCtx {
  activeBuilderTab?: string;
  toggleSection?: (id: string) => void;
  openSection?: string;
}

const SectionRenderer: React.FC<SectionRendererProps> = (props) => {
  const { activeBuilderTab, toggleSection, openSection, ...renderProps } = props;
  const t = useT();
  const BUILDER_SECTIONS = useBuilderSections();

  if (activeBuilderTab) {
    const s = BUILDER_SECTIONS.find(x => String(x.id) === String(activeBuilderTab));
    if (!s) return null;
    return <>{s.render(renderProps)}</>;
  }

  return (
    <div className="space-y-4">
      {BUILDER_SECTIONS.map(s => (
        <div key={s.id} className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white">
          <button type="button" onClick={() => toggleSection?.(s.id)} className="w-full px-5 py-4 flex items-center justify-between transition-colors hover:bg-slate-50 active:scale-[0.99]">
            <div className="flex items-center gap-2 flex-row-reverse">{s.icon}<span className="font-black text-sm">{s.title}</span></div>
            <ChevronLeft className={`w-5 h-5 transition-transform ${openSection === s.id ? 'rotate-90' : 'rotate-180'}`} />
          </button>
          <AnimatePresence initial={false}>
            {openSection === s.id && (
              <MotionDiv initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5 overflow-hidden">
                {typeof s.render === 'function' ? s.render(renderProps) : null}
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default React.memo(SectionRenderer);
