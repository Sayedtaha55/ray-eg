import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();
  const sections = [
    {
      title: t('privacy.s1Title'),
      content: t('privacy.s1Content')
    },
    {
      title: t('privacy.s2Title'),
      content: t('privacy.s2Content')
    },
    {
      title: t('privacy.s3Title'),
      content: t('privacy.s3Content')
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
          <div className="w-12 h-12 bg-[#00E5FF]/20 text-[#00E5FF] rounded-2xl flex items-center justify-center">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">{t('privacy.title')}</h1>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            {t('privacy.intro')}
          </p>

          <div className="space-y-12">
            {sections.map((section, index) => (
              <section key={index} className="space-y-4">
                <h2 className="text-2xl font-black text-slate-800 border-r-4 border-[#00E5FF] pr-4">{section.title}</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPage;
