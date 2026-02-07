import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Book, Shield, MessageSquare, ChevronRight } from 'lucide-react';

const SupportPage: React.FC = () => {
  const faqs = [
    {
      question: 'كيف يمكنني الطلب من الموقع؟',
      answer: 'يمكنك اختيار المنتج الذي تريده، إضافة إلى السلة، ثم إكمال بيانات التوصيل وتأكيد الطلب.'
    },
    {
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'نوفر حالياً الدفع عند الاستلام، وقريباً سنوفر خيارات الدفع الإلكتروني.'
    },
    {
      question: 'كيف يمكنني تتبع طلبي؟',
      answer: 'يمكنك تتبع حالة طلبك من خلال صفحة "طلباتي" في ملفك الشخصي.'
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
            <HelpCircle size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">مركز المساعدة</h1>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">الأسئلة الشائعة</h2>
          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-black text-lg text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="p-8 bg-slate-900 text-white rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <h3 className="text-xl font-black">ما زلت بحاجة للمساعدة؟</h3>
            <p className="text-slate-400">فريق الدعم الفني متواجد لمساعدتك في أي وقت</p>
          </div>
          <button className="px-8 py-4 bg-[#00E5FF] text-black font-black rounded-xl hover:scale-105 transition-all">
            تواصل معنا
          </button>
        </section>
      </motion.div>
    </div>
  );
};

export default SupportPage;
