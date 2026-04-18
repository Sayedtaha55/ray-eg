import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Phone, MapPin, Facebook } from 'lucide-react';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
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
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">{t('contact.title')}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <p className="text-xl text-slate-600 leading-relaxed">
              {t('contact.intro')}
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">{t('contact.email')}</h3>
                  <p className="text-slate-500">mnmknk.eg@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">{t('contact.phone')}</h3>
                  <p className="text-slate-500">01067461059</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">{t('contact.address')}</h3>
                  <p className="text-slate-500">{t('contact.addressValue')}</p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-3">
                  <a
                    href="https://wa.me/201067461059"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-black text-xs hover:bg-green-100 transition-all"
                  >
                    <span className="text-green-600">{t('contact.whatsapp')}</span>
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61587556276694"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-black text-xs hover:bg-blue-100 transition-all"
                  >
                    <Facebook size={14} /> {t('contact.facebook')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <form className="space-y-4" onClick={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="font-black text-sm text-slate-700">{t('contact.nameLabel')}</label>
                <input type="text" className="w-full px-6 py-4 rounded-xl bg-white border border-slate-200 focus:border-[#BD00FF] outline-none transition-all" placeholder={t('contact.namePlaceholder')} />
              </div>
              <div className="space-y-2">
                <label className="font-black text-sm text-slate-700">{t('contact.emailLabel')}</label>
                <input type="email" className="w-full px-6 py-4 rounded-xl bg-white border border-slate-200 focus:border-[#BD00FF] outline-none transition-all" placeholder="example@mail.com" />
              </div>
              <div className="space-y-2">
                <label className="font-black text-sm text-slate-700">{t('contact.messageLabel')}</label>
                <textarea className="w-full px-6 py-4 rounded-xl bg-white border border-slate-200 focus:border-[#BD00FF] outline-none transition-all h-32 resize-none" placeholder={t('contact.messagePlaceholder')} />
              </div>
              <button className="w-full py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all mt-4">{t('contact.send')}</button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage;
