import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const ReturnPolicyPage: React.FC = () => {
  const sections = [
    {
      title: 'نظرة عامة',
      content: 'تهدف سياسة الاسترجاع إلى توضيح حقوقك وخياراتك عند وجود مشكلة في الطلب. قد تختلف تفاصيل الاسترجاع والاستبدال حسب كل متجر.'
    },
    {
      title: 'المنتجات القابلة للاسترجاع',
      content: 'يتم قبول الاسترجاع عادةً للمنتجات بحالتها الأصلية، غير مستخدمة، ومع وجود الفاتورة/إثبات الشراء وفي خلال المدة المحددة من المتجر.'
    },
    {
      title: 'المنتجات غير القابلة للاسترجاع',
      content: 'قد لا تكون بعض المنتجات قابلة للاسترجاع مثل المنتجات الاستهلاكية المفتوحة أو المنتجات المخصصة أو أي منتج يحدده المتجر ضمن شروطه.'
    },
    {
      title: 'طريقة تقديم طلب الاسترجاع',
      content: 'يمكنك التواصل مباشرة مع المتجر من خلال وسائل التواصل المتاحة في صفحة المتجر (مثل الهاتف أو واتساب) لبدء طلب الاسترجاع، وسيقوم المتجر بإبلاغك بالخطوات.'
    },
    {
      title: 'المبالغ المستردة',
      content: 'في حال قبول الاسترجاع، تختلف آلية استرداد المبلغ حسب طريقة الدفع وسياسة المتجر. قد يستغرق الاسترداد عدة أيام عمل.'
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
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">سياسة الاسترجاع</h1>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            هذه صفحة عامة لسياسة الاسترجاع على منصة "من مكانك". السياسة التفصيلية قد تختلف من متجر لآخر حسب طبيعة المنتجات وشروط المتجر.
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
