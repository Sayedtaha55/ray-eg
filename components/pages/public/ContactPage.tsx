import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-right" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#BD00FF]/20 text-[#BD00FF] rounded-2xl flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">تواصل معنا</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <p className="text-xl text-slate-600 leading-relaxed">
              نحن هنا لمساعدتك. يمكنك التواصل معنا عبر أي من القنوات التالية:
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">البريد الإلكتروني</h3>
                  <p className="text-slate-500">support@mnmknk.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">الهاتف</h3>
                  <p className="text-slate-500">+20 123 456 7890</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">العنوان</h3>
                  <p className="text-slate-500">القاهرة، جمهورية مصر العربية</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <form className="space-y-4" onClick={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="font-black text-sm text-slate-700">الاسم</label>
                <input type="text" className="w-full px-6 py-4 rounded-xl bg-white border border-slate-200 focus:border-[#BD00FF] outline-none transition-all" placeholder="اسمه الكريم" />
              </div>
              <div className="space-y-2">
                <label className="font-black text-sm text-slate-700">البريد الإلكتروني</label>
                <input type="email" className="w-full px-6 py-4 rounded-xl bg-white border border-slate-200 focus:border-[#BD00FF] outline-none transition-all" placeholder="example@mail.com" />
              </div>
              <div className="space-y-2">
                <label className="font-black text-sm text-slate-700">الرسالة</label>
                <textarea className="w-full px-6 py-4 rounded-xl bg-white border border-slate-200 focus:border-[#BD00FF] outline-none transition-all h-32 resize-none" placeholder="كيف يمكننا مساعدتك؟" />
              </div>
              <button className="w-full py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all mt-4">إرسال الرسالة</button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage;
