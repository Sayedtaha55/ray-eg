import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'الخدمات',
      links: [
        { name: 'المتاجر', href: '/shops' },
        { name: 'المطاعم', href: '/restaurants' },
        { name: 'العروض', href: '/offers' },
        { name: 'التوصيل', href: '/delivery' },
      ],
    },
    {
      title: 'للتجار',
      links: [
        { name: 'إنشاء متجر', href: '/business/register' },
        { name: 'تسجيل الدخول', href: '/business/login' },
        { name: 'الأسعار', href: '/pricing' },
        { name: 'الدعم', href: '/support' },
      ],
    },
    {
      title: 'عن RAY',
      links: [
        { name: 'من نحن', href: '/about' },
        { name: 'الشروط والأحكام', href: '/terms' },
        { name: 'سياسة الخصوصية', href: '/privacy' },
        { name: 'اتصل بنا', href: '/contact' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/ray' },
    { icon: Twitter, href: 'https://twitter.com/ray' },
    { icon: Instagram, href: 'https://instagram.com/ray' },
    { icon: Youtube, href: 'https://youtube.com/ray' },
  ];

  return (
    <footer className="bg-slate-900 border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-[#00E5FF] to-[#BD00FF] rounded-xl" />
              <span className="text-2xl font-black text-white">RAY</span>
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
                <p className="text-slate-400 text-sm">info@ray.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00E5FF]/20 text-[#00E5FF] rounded-xl flex items-center justify-center">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-white font-black text-sm">الهاتف</p>
                <p className="text-slate-400 text-sm">+20 123 456 7890</p>
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
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-slate-400 text-sm">
            © {currentYear} RAY. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
