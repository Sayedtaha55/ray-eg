import React, { useEffect, useRef, useState } from 'react';
import {
  Facebook, Instagram, MessageCircle, Send, Youtube, Twitter, Linkedin,
  Globe, Phone, Save, Check, Plus, X, Link as LinkIcon, Music2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  shop: any;
  onSaved?: () => void;
  adminShopId?: string;
}

type SocialPlatform = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  placeholder: string;
  prefix?: string;
};

const PLATFORMS: SocialPlatform[] = [
  { id: 'facebook', label: 'Facebook', icon: <Facebook size={20} />, color: 'text-blue-600', placeholder: 'https://facebook.com/yourpage', prefix: 'https://facebook.com/' },
  { id: 'instagram', label: 'Instagram', icon: <Instagram size={20} />, color: 'text-pink-600', placeholder: 'https://instagram.com/youraccount', prefix: 'https://instagram.com/' },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={20} />, color: 'text-green-600', placeholder: 'https://wa.me/201234567890', prefix: 'https://wa.me/' },
  { id: 'telegram', label: 'Telegram', icon: <Send size={20} />, color: 'text-cyan-600', placeholder: 'https://t.me/yourchannel', prefix: 'https://t.me/' },
  { id: 'youtube', label: 'YouTube', icon: <Youtube size={20} />, color: 'text-red-600', placeholder: 'https://youtube.com/@yourchannel', prefix: 'https://youtube.com/' },
  { id: 'twitter', label: 'Twitter / X', icon: <Twitter size={20} />, color: 'text-slate-900', placeholder: 'https://twitter.com/youraccount', prefix: 'https://twitter.com/' },
  { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={20} />, color: 'text-blue-700', placeholder: 'https://linkedin.com/company/yourcompany', prefix: 'https://linkedin.com/' },
  { id: 'tiktok', label: 'TikTok', icon: <Music2 size={20} />, color: 'text-slate-900', placeholder: 'https://tiktok.com/@youraccount', prefix: 'https://tiktok.com/' },
  { id: 'snapchat', label: 'Snapchat', icon: <Globe size={20} />, color: 'text-yellow-500', placeholder: 'https://snapchat.com/add/youraccount', prefix: 'https://snapchat.com/add/' },
  { id: 'website', label: 'Website', icon: <Globe size={20} />, color: 'text-indigo-600', placeholder: 'https://yourwebsite.com' },
];

const SocialMediaSettings: React.FC<Props> = ({ shop, onSaved }) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isArabic = String(i18n?.language || '').toLowerCase().startsWith('ar');

  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [savedLinks, setSavedLinks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const layout = shop?.layoutConfig && typeof shop.layoutConfig === 'object' ? shop.layoutConfig : {};
    const social = (layout as any)?.socialLinks || {};
    const normalized: Record<string, string> = {};
    for (const platform of PLATFORMS) {
      normalized[platform.id] = String(social[platform.id] || '');
    }
    setSocialLinks(normalized);
    setSavedLinks({ ...normalized });
  }, [shop]);

  const hasChanges = JSON.stringify(socialLinks) !== JSON.stringify(savedLinks);

  const handleChange = (platformId: string, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platformId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const layout = shop?.layoutConfig && typeof shop.layoutConfig === 'object' ? { ...shop.layoutConfig } : {};
      const updated = {
        ...layout,
        socialLinks: { ...socialLinks },
      };
      await ApiService.updateMyShop({ layoutConfig: updated });
      setSavedLinks({ ...socialLinks });
      toast({ title: isArabic ? 'تم حفظ الروابط' : 'Links saved', description: isArabic ? 'تم تحديث روابط السوشيال ميديا' : 'Social media links updated' });
      onSaved?.();
    } catch (err) {
      toast({ title: isArabic ? 'خطأ' : 'Error', description: isArabic ? 'فشل حفظ الروابط' : 'Failed to save links', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const connectedCount = Object.values(savedLinks).filter(v => String(v).trim()).length;
  const visiblePlatforms = showAll ? PLATFORMS : PLATFORMS.slice(0, 6);

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-900">{isArabic ? 'روابط السوشيال ميديا' : 'Social Media Links'}</h3>
          <p className="text-sm text-slate-400 font-bold mt-1">
            {isArabic ? 'اربط حساباتك على منصات التواصل — تظهر في موقعك وتُستخدم في مركز التسويق' : 'Link your social media accounts — they appear on your website and integrate with the Marketing Center'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl">
          <Check size={16} className="text-green-500" />
          <span className="text-xs font-black text-slate-600">{connectedCount} {isArabic ? 'متصل' : 'connected'}</span>
        </div>
      </div>

      {/* Connected Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visiblePlatforms.map((platform) => {
          const value = socialLinks[platform.id] || '';
          const isConnected = String(savedLinks[platform.id] || '').trim() !== '';
          return (
            <div
              key={platform.id}
              className={`p-4 rounded-2xl border transition-all ${isConnected ? 'border-green-200 bg-green-50/30' : 'border-slate-100 bg-slate-50/50'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${platform.color} shadow-sm`}>
                  {platform.icon}
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm text-slate-900">{platform.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    {isConnected ? (isArabic ? 'متصل' : 'Connected') : (isArabic ? 'غير متصل' : 'Not Connected')}
                  </p>
                </div>
                {isConnected && (
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon size={14} className="text-slate-300 shrink-0" />
                <input
                  type="url"
                  value={value}
                  onChange={(e) => handleChange(platform.id, e.target.value)}
                  placeholder={platform.placeholder}
                  className="flex-1 px-3 py-2.5 bg-white rounded-xl border border-slate-100 text-xs font-bold focus:outline-none focus:border-purple-300 transition-colors"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More / Less */}
      {!showAll && PLATFORMS.length > 6 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          {isArabic ? `عرض جميع المنصات (${PLATFORMS.length - 6} إضافية)` : `Show all platforms (${PLATFORMS.length - 6} more)`}
        </button>
      )}
      {showAll && PLATFORMS.length > 6 && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
        >
          <X size={14} />
          {isArabic ? 'عرض أقل' : 'Show Less'}
        </button>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 font-bold">
          {hasChanges ? (isArabic ? 'تغييرات غير محفوظة' : 'Unsaved changes') : (isArabic ? 'كل الروابط محفوظة' : 'All links saved')}
        </p>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
            hasChanges && !saving
              ? 'bg-slate-900 text-white hover:bg-black'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Save size={14} />
          {saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ الروابط' : 'Save Links')}
        </button>
      </div>
    </div>
  );
};

export default SocialMediaSettings;
