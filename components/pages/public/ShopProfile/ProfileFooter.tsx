import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Info, Users, Clock, ShoppingBag } from 'lucide-react';

const MotionDiv = motion.div as any;

interface ProfileFooterProps {
  shop: any;
  currentDesign: any;
  footerBg: string;
  footerTextColor: string;
  isVisible: (key: string, fallback?: boolean) => boolean;
  isBold: boolean;
}

const ProfileFooter: React.FC<ProfileFooterProps> = ({
  shop,
  currentDesign,
  footerBg,
  footerTextColor,
  isVisible,
  isBold,
}) => {
  const showFooter = isVisible('footer', true);
  const showFooterQuickLinks = isVisible('footerQuickLinks', true);
  const showFooterContact = isVisible('footerContact', true);

  if (!showFooter) return null;

  return (
    <footer
      className="relative z-10 transition-all duration-500 border-t"
      style={{ backgroundColor: footerBg, color: footerTextColor, borderColor: `${footerTextColor}15` }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
          {/* Shop Info Column */}
          <div className="text-center md:text-right space-y-6">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <img
                src={shop.logoUrl || '/brand/logo.png'}
                className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover bg-white"
                alt={shop.name}
              />
              <h4 className={`font-black ${isBold ? 'text-2xl' : 'text-xl'}`}>
                {shop.name}
              </h4>
            </div>
            <p className="opacity-70 text-sm leading-relaxed font-bold">
              {shop.description || `أفضل ${shop.category === 'RESTAURANT' ? 'الأكلات' : 'المنتجات'} تجدها هنا في ${shop.name}.`}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
              <div className="bg-white/10 p-3 rounded-2xl">
                <Users size={20} />
              </div>
              <div className="text-right">
                <p className="text-[10px] opacity-50 font-black">المتابعون</p>
                <p className="text-sm font-black">{shop.followers || 0} متابع</p>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          {showFooterQuickLinks && (
            <div className="text-center md:text-right space-y-6">
              <h5 className="font-black text-lg">روابط سريعة</h5>
              <ul className="space-y-4 font-bold opacity-70 text-sm">
                <li><a href="#" className="hover:opacity-100 transition-opacity">الرئيسية</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">العروض</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">سياسة الاسترجاع</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">الشروط والأحكام</a></li>
              </ul>
            </div>
          )}

          {/* Contact Column */}
          {showFooterContact && (
            <div className="text-center md:text-right space-y-6">
              <h5 className="font-black text-lg">تواصل معنا</h5>
              <div className="space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-3 opacity-70 hover:opacity-100 transition-opacity">
                  <span className="text-sm font-bold">{shop.phone}</span>
                  <Phone size={18} />
                </div>
                {shop.email && (
                  <div className="flex items-center justify-center md:justify-start gap-3 opacity-70 hover:opacity-100 transition-opacity">
                    <span className="text-sm font-bold">{shop.email}</span>
                    <Mail size={18} />
                  </div>
                )}
                <div className="flex items-center justify-center md:justify-start gap-3 opacity-70">
                  <span className="text-sm font-bold">{shop.city}، {shop.governorate}</span>
                  <MapPin size={18} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 text-center text-[10px] md:text-xs font-bold opacity-40">
          <p>© {new Date().getFullYear()} {shop.name}. جميع الحقوق محفوظة. تم التطوير بواسطة MNMKNK</p>
        </div>
      </div>
    </footer>
  );
};

export default ProfileFooter;
