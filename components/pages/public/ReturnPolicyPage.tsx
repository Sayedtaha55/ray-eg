import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const ReturnPolicyPage: React.FC = () => {
  const { t } = useTranslation();
  const sections = [
    {
      title: t('returnPolicy.s1Title'),
      content: t('returnPolicy.s1Content')
    },
    {
      title: t('returnPolicy.s2Title'),
      content: t('returnPolicy.s2Content')
    },
    {
      title: t('returnPolicy.s3Title'),
      content: t('returnPolicy.s3Content')
    },
    {
      title: t('returnPolicy.s4Title'),
      content: t('returnPolicy.s4Content')
    },
    {
      title: t('returnPolicy.s5Title'),
      content: t('returnPolicy.s5Content')
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-right" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-600 rounded-2xl flex items-center justify-center">
            <RotateCcw size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">{t('returnPolicy.title')}</h1>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            {t('returnPolicy.intro')}
          </p>

          <div className="space-y-12">
            {sections.map((section, index) => (
              <section key={index} className="space-y-4">
                <h2 className="text-2xl font-black text-slate-800 border-r-4 border-emerald-500 pr-4">{section.title}</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReturnPolicyPage;
