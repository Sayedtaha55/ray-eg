import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Book } from 'lucide-react';

const TermsPage: React.FC = () => {
  const { t } = useTranslation();
  const sections = [
    {
      title: t('terms.s1Title'),
      content: t('terms.s1Content')
    },
    {
      title: t('terms.s2Title'),
      content: t('terms.s2Content')
    },
    {
      title: t('terms.s3Title'),
      content: t('terms.s3Content')
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
          <div className="w-12 h-12 bg-[#BD00FF]/20 text-[#BD00FF] rounded-2xl flex items-center justify-center">
            <Book size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">{t('terms.title')}</h1>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            {t('terms.intro')}
          </p>

          <div className="space-y-12">
            {sections.map((section, index) => (
              <section key={index} className="space-y-4">
                <h2 className="text-2xl font-black text-slate-800 border-r-4 border-[#BD00FF] pr-4">{section.title}</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsPage;
