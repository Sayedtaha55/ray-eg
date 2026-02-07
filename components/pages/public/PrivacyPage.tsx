import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  const sections = [
    {
      title: 'المعلومات التي نجمعها',
      content: 'نجمع المعلومات التي تقدمها لنا مباشرة، مثل الاسم، رقم الهاتف، والبريد الإلكتروني عند إنشاء حساب أو إجراء طلب.'
    },
    {
      title: 'كيف نستخدم معلوماتك',
      content: 'نستخدم معلوماتك لمعالجة طلباتك، تحسين خدماتنا، والتواصل معك بشأن التحديثات والعروض.'
    },
    {
      title: 'حماية البيانات',
      content: 'نحن نتخذ تدابير أمنية تقنية وتنظيمية مناسبة لحماية بياناتك الشخصية من الوصول غير المصرح به.'
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
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">سياسة الخصوصية</h1>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            نحن في "من مكانك" نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية تعاملنا مع معلوماتك.
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
