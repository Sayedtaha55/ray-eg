
import React from 'react';
import { motion } from 'framer-motion';
import { Info, Target, Rocket, AlertTriangle, Cpu, Users } from 'lucide-react';

const MotionDiv = motion.div as any;

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 text-right" dir="rtl">
      <div className="text-center mb-24">
         <MotionDiv 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest mb-8"
         >
            <Info className="w-4 h-4 text-[#00E5FF]" />
            قصة "تست"
         </MotionDiv>
         <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-tight">نحن نبني <br/><span className="text-[#00E5FF]">مستقبل التجارة.</span></h1>
         <p className="text-slate-400 text-xl md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed">
            "تست" هي منصة مصرية طموحة تهدف لربط المتاجر والمطاعم بعملائها بذكاء فائق وتجربة مستخدم لا تُنسى.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
        <div className="p-12 bg-slate-50 rounded-[3.5rem] space-y-6">
           <Target className="w-12 h-12 text-[#BD00FF]" />
           <h3 className="text-3xl font-black">رؤيتنا</h3>
           <p className="text-slate-500 font-bold leading-loose">
              أن يصبح كل محل في مصر قادراً على امتلاك واجهة رقمية عالمية ونظام إدارة ذكي في دقائق، دون تعقيدات تقنية.
           </p>
        </div>
        <div className="p-12 bg-slate-900 text-white rounded-[3.5rem] space-y-6">
           <Cpu className="w-12 h-12 text-[#00E5FF]" />
           <h3 className="text-3xl font-black">تقنياتنا</h3>
           <p className="text-slate-400 font-bold leading-loose">
              نستخدم أحدث تقنيات الذكاء الاصطناعي (Gemini) لنضمن لك عروضاً حقيقية وتجربة تسوق مخصصة لكل مستخدم.
           </p>
        </div>
      </div>

      <MotionDiv 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-amber-50 border-2 border-amber-200 p-12 md:p-20 rounded-[4rem] text-center mb-32 relative overflow-hidden"
      >
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <AlertTriangle size={120} className="text-amber-500" />
         </div>
         <div className="relative z-10">
            <h2 className="text-4xl font-black text-amber-900 mb-8 flex items-center justify-center gap-4">
              نحن في مرحلة التجربة <AlertTriangle className="text-amber-500" />
            </h2>
            <p className="text-amber-800 text-lg md:text-xl font-bold leading-loose max-w-3xl mx-auto">
               منصة "تست" حالياً في مرحلة الـ <span className="underline">Beta Test</span>. هذا يعني أن بعض الميزات قد لا تعمل بأفضل أداء ممكن، ونحن نعمل ليل نهار لتحسين التجربة. 
               رأيك واقتراحاتك هي الوقود الذي يحركنا لنكون النسخة الأفضل دائماً.
            </p>
         </div>
      </MotionDiv>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
         <div className="space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-900"><Rocket /></div>
            <h4 className="font-black text-xl">سرعة فائقة</h4>
         </div>
         <div className="space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-900"><Users /></div>
            <h4 className="font-black text-xl">فريق مصري</h4>
         </div>
         <div className="space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-900"><ShieldCheck /></div>
            <h4 className="font-black text-xl">أمان كامل</h4>
         </div>
      </div>
    </div>
  );
};

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

export default AboutPage;
