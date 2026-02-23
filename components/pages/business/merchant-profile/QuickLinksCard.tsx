import React from 'react';
import { motion } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

interface QuickLinksCardProps {
  buildDashboardUrl: (tab?: string) => string;
}

const QuickLinksCard: React.FC<QuickLinksCardProps> = ({ buildDashboardUrl }) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="lg:col-span-5 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-10"
    >
      <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6">روابط سريعة</h2>

      <div className="space-y-3">
        <Link
          to={buildDashboardUrl()}
          className="w-full flex items-center justify-between flex-row-reverse gap-3 px-6 py-5 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all"
        >
          <span>لوحة التحكم</span>
          <span className="text-white/70">→</span>
        </Link>

        <Link
          to={buildDashboardUrl('builder')}
          className="w-full flex items-center justify-between flex-row-reverse gap-3 px-6 py-5 rounded-2xl bg-slate-100 text-slate-900 font-black text-sm hover:bg-black group transition-all"
        >
          <span className="group-hover:text-white transition-colors">هوية المتجر (Page Builder)</span>
          <span className="text-slate-500 group-hover:text-white transition-colors">→</span>
        </Link>
      </div>
    </MotionDiv>
  );
};

export default React.memo(QuickLinksCard);
