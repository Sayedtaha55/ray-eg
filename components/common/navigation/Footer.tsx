import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const WhatsAppIcon = (props: { size?: number }) => {
    const s = typeof props?.size === 'number' ? props.size : 18;
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 2C6.477 2 2 6.145 2 11.26c0 2.007.688 3.866 1.86 5.367L3 22l5.633-1.76c1.413.747 3.046 1.172 4.367 1.172 5.523 0 10-4.145 10-9.26C23 6.145 17.523 2 12 2Z"
          fill="currentColor"
          opacity="0.22"
        />
        <path
          d="M12 3.5c4.66 0 8.5 3.46 8.5 7.76 0 4.3-3.84 7.76-8.5 7.76-1.25 0-2.81-.39-4.1-1.12l-.42-.24-3.25 1.02.92-3.06-.27-.4C4.13 14.2 3.5 12.78 3.5 11.26 3.5 6.96 7.34 3.5 12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M9.4 8.5c-.2-.45-.4-.47-.58-.48h-.5c-.17 0-.45.06-.68.3-.23.25-.9.86-.9 2.09 0 1.23.92 2.42 1.05 2.59.13.17 1.78 2.72 4.34 3.7 2.13.82 2.56.66 3.02.62.46-.04 1.5-.6 1.71-1.18.21-.57.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3-.25-.13-1.5-.71-1.73-.8-.23-.09-.4-.13-.57.13-.17.26-.66.8-.81.96-.15.17-.3.19-.56.06-.25-.13-1.07-.38-2.03-1.2-.75-.63-1.25-1.4-1.4-1.64-.15-.25-.02-.38.12-.5.11-.1.25-.26.38-.39.13-.13.17-.22.25-.37.08-.15.04-.28-.02-.39-.06-.11-.52-1.23-.72-1.68Z"
          fill="currentColor"
        />
      </svg>
    );
  };

  const footerSections = [
    {
      title: 'الخدمات',
      links: [
        { name: 'العروض', href: '/offers' },
        { name: 'التوصيل', href: '/delivery' },
      ],
    },
    {
      title: 'للتجار',
      links: [
        { name: 'إنشاء متجر', href: '/business/register' },
        { name: 'تسجيل الدخول', href: '/business/login' },
        { name: 'تسجيل مندوب توصيل', href: '/business/courier-signup' },
        { name: 'الأسعار', href: '/pricing' },
        { name: 'الدعم', href: '/support' },
      ],
    },
    {
      title: 'عن MNMKNK',
      links: [
        { name: 'من نحن', href: '/about' },
        { name: 'الشروط والأحكام', href: '/terms' },
        { name: 'سياسة الخصوصية', href: '/privacy' },
        { name: 'اتصل بنا', href: '/contact' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61587556276694' },
    { icon: WhatsAppIcon as any, href: 'https://wa.me/201067461059' },
    { icon: Twitter, href: 'https://twitter.com/mnmknk' },
    { icon: Instagram, href: 'https://instagram.com/mnmknk' },
    { icon: Youtube, href: 'https://youtube.com/mnmknk' },
  ];

  return (
    <footer className="bg-slate-900 border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-[#00E5FF] to-[#BD00FF] rounded-xl" />
              <span className="text-2xl font-black text-white">MNMKNK</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              منصتك الأولى للتسوق الإلكتروني في مصر. اكتشف أفضل المتاجر والمنتجات والعروض في مكان واحد.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-white/10 text-white hover:bg-[#00E5FF] hover:text-black rounded-xl flex items-center justify-center transition-all"
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-white font-black text-lg">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00E5FF]/20 text-[#00E5FF] rounded-xl flex items-center justify-center">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-white font-black text-sm">البريد الإلكتروني</p>
                <a
                  href="mailto:mnmknk.eg@gmail.com"
                  className="text-slate-400 text-sm hover:text-white transition-colors"
                >
                  mnmknk.eg@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00E5FF]/20 text-[#00E5FF] rounded-xl flex items-center justify-center">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-white font-black text-sm">الهاتف</p>
                <a
                  href="tel:01067461059"
                  className="text-slate-400 text-sm hover:text-white transition-colors"
                >
                  01067461059
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00E5FF]/20 text-[#00E5FF] rounded-xl flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-white font-black text-sm">العنوان</p>
                <p className="text-slate-400 text-sm">القاهرة، مصر</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center md:justify-end gap-3">
            <motion.a
              href="mailto:mnmknk.eg@gmail.com"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-[#00E5FF]/40 hover:bg-white/15 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(0,229,255,0.25)]"
              aria-label="Gmail"
            >
              <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
            </motion.a>

            <motion.a
              href="https://wa.me/201067461059"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-emerald-400/40 hover:bg-white/15 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(16,185,129,0.25)]"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon size={16} />
            </motion.a>

            <motion.a
              href="https://www.facebook.com/profile.php?id=61587556276694"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-blue-400/40 hover:bg-white/15 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(96,165,250,0.25)]"
              aria-label="Facebook"
            >
              <Facebook size={16} className="sm:w-[18px] sm:h-[18px]" />
            </motion.a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {currentYear} MNMKNK. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
