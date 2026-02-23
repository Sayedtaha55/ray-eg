import React from 'react';
import { motion } from 'framer-motion';
import { 
  Info, MapPin, Phone, Clock, Star, Users, MessageCircle
} from 'lucide-react';
import InfoItem from './InfoItem';

const MotionDiv = motion.div as any;

interface InfoTabProps {
  shop: any;
  isVisible: (key: string, fallback?: boolean) => boolean;
  whatsappHref: string;
}

const InfoTab: React.FC<InfoTabProps> = ({ shop, isVisible, whatsappHref }) => {
  const showShopFollowersCount = isVisible('shopFollowersCount', true);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 md:p-12 space-y-10">
          {/* Bio Section */}
          <div className="text-right">
            <h3 className="font-black text-2xl mb-4 flex items-center gap-3 justify-end">
              عن المحل <Info className="text-[#00E5FF]" />
            </h3>
            <p className="text-slate-600 leading-relaxed text-lg font-bold">
              {shop?.description || 'لا يوجد وصف متاح حالياً لهذا المحل.'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem 
              icon={<MapPin />} 
              label="العنوان" 
              value={`${shop?.governorate || ''}، ${shop?.city || ''} ${shop?.addressDetailed ? `، ${shop.addressDetailed}` : ''}`} 
            />
            <InfoItem 
              icon={<Phone />} 
              label="رقم التواصل" 
              value={shop?.phone} 
            />
            <InfoItem 
              icon={<Clock />} 
              label="ساعات العمل" 
              value={shop?.openingHours || 'غير محدد'} 
            />
            {showShopFollowersCount && (
              <InfoItem 
                icon={<Users />} 
                label="المتابعون" 
                value={`${shop?.followers || 0} متابع`} 
              />
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-6 border-t border-slate-50 flex flex-wrap gap-4 justify-end">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white rounded-2xl font-black hover:scale-105 transition-all shadow-lg shadow-green-500/20"
              >
                تواصل واتساب <MessageCircle size={20} />
              </a>
            )}
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${shop?.latitude},${shop?.longitude}`, '_blank')}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:scale-105 transition-all shadow-lg"
            >
              فتح الخريطة <MapPin size={20} />
            </button>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default InfoTab;
