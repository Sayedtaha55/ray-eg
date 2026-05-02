import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Info, MapPin, Phone, Clock, Star, Users, MessageCircle, Mic
} from 'lucide-react';
import InfoItem from './InfoItem';
import { shopHasWhatsApp, shopHasVoiceOrdering } from '@/utils/shopApps';

const MotionDiv = motion.div as any;

interface InfoTabProps {
  shop: any;
  currentDesign?: any;
  isVisible: (key: string, fallback?: boolean) => boolean;
  whatsappHref: string;
}

const InfoTab: React.FC<InfoTabProps> = ({ shop, currentDesign, isVisible, whatsappHref }) => {
  const { t } = useTranslation();
  const showShopFollowersCount = isVisible('shopFollowersCount', true);
  const primaryColor = String(currentDesign?.primaryColor || '').trim() || '#00E5FF';
  const buttonShape = String((currentDesign as any)?.buttonShape || '').trim() || 'rounded-2xl';
  const buttonPadding = String((currentDesign as any)?.buttonPadding || '').trim() || 'px-8 py-4';

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
              {t('shopProfile.infoTab')} <Info style={{ color: primaryColor }} />
            </h3>
            <p className="text-slate-600 leading-relaxed text-lg font-bold">
              {shop?.description || t('shopProfile.noDesc')}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem 
              icon={<MapPin />} 
              label={t('shopProfile.address')} 
              value={[shop?.governorate, shop?.city, shop?.addressDetailed].filter(Boolean).join(t('shopProfile.addressSeparator'))} 
            />
            <InfoItem 
              icon={<Phone />} 
              label={t('shopProfile.phone')} 
              value={shop?.phone} 
            />
            <InfoItem 
              icon={<Clock />} 
              label={t('shopProfile.workingHours')} 
              value={shop?.openingHours || t('shopProfile.unspecified')} 
            />
            {showShopFollowersCount && (
              <InfoItem 
                icon={<Users />} 
                label={t('shopProfile.followersLabel')} 
                value={`${shop?.followers || 0} ${t('shopProfile.followers')}`} 
              />
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-6 border-t border-slate-50 flex flex-wrap gap-4 justify-end">
            {whatsappHref && shopHasWhatsApp(shop) && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white rounded-2xl font-black hover:scale-105 transition-all shadow-lg shadow-green-500/20"
              >
                {t('shopProfile.whatsappChat')} <MessageCircle size={20} />
              </a>
            )}
            {shopHasVoiceOrdering(shop) && (
              <button
                onClick={() => window.open(whatsappHref || '#', '_blank')}
                className={`flex items-center gap-3 ${buttonPadding} text-white ${buttonShape} font-black hover:scale-105 transition-all shadow-lg`}
                style={{ backgroundColor: '#8B5CF6' }}
              >
                {t('shopProfile.voiceOrdering')} <Mic size={20} />
              </button>
            )}
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${shop?.latitude},${shop?.longitude}`, '_blank')}
              className={`flex items-center gap-3 ${buttonPadding} text-white ${buttonShape} font-black hover:scale-105 transition-all shadow-lg`}
              style={{ backgroundColor: primaryColor }}
            >
              {t('shopProfile.openMap')} <MapPin size={20} />
            </button>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default InfoTab;
