import React, { useEffect, useMemo, useState } from 'react';
import {
  Megaphone, Facebook, Instagram, MessageCircle, Mail, Send, Smartphone,
  TrendingUp, Eye, MousePointerClick, DollarSign, Target, Plus, BarChart3,
  Zap, Users, ArrowRight, ExternalLink, Clock, CheckCircle2, Pause, Play,
  Activity, Gift, Bell, ShoppingCart, Repeat, AlertTriangle,
  Link2, Copy, Layout, Share2,
  TrendingDown, Smartphone as MobileIcon, Monitor, Tablet,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = {
  shopId: string;
  shop?: any;
  onNavigate?: (tab: string) => void;
};

type CampaignPlatform = 'facebook' | 'instagram' | 'whatsapp' | 'sms' | 'email' | 'in_app';
type CampaignStatus = 'active' | 'paused' | 'draft' | 'completed';

type Campaign = {
  id: string;
  name: string;
  platform: CampaignPlatform;
  status: CampaignStatus;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate?: string;
};

const PLATFORM_CONFIG: Record<CampaignPlatform, { label: { ar: string; en: string }; icon: React.ReactNode; color: string; bgColor: string }> = {
  facebook: { label: { ar: 'فيسبوك', en: 'Facebook' }, icon: <Facebook size={18} />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  instagram: { label: { ar: 'انستجرام', en: 'Instagram' }, icon: <Instagram size={18} />, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  whatsapp: { label: { ar: 'واتساب', en: 'WhatsApp' }, icon: <MessageCircle size={18} />, color: 'text-green-600', bgColor: 'bg-green-50' },
  sms: { label: { ar: 'رسائل نصية', en: 'SMS' }, icon: <Smartphone size={18} />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  email: { label: { ar: 'بريد إلكتروني', en: 'Email' }, icon: <Mail size={18} />, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  in_app: { label: { ar: 'إشعار داخل التطبيق', en: 'In-App Notification' }, icon: <Bell size={18} />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
};

const STATUS_CONFIG: Record<CampaignStatus, { label: { ar: string; en: string }; color: string; bgColor: string; icon: React.ReactNode }> = {
  active: { label: { ar: 'نشط', en: 'Active' }, color: 'text-green-600', bgColor: 'bg-green-100', icon: <Play size={12} /> },
  paused: { label: { ar: 'متوقف مؤقتاً', en: 'Paused' }, color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <Pause size={12} /> },
  draft: { label: { ar: 'مسودة', en: 'Draft' }, color: 'text-slate-500', bgColor: 'bg-slate-100', icon: <Clock size={12} /> },
  completed: { label: { ar: 'منتهي', en: 'Completed' }, color: 'text-blue-600', bgColor: 'bg-blue-100', icon: <CheckCircle2 size={12} /> },
};

const MarketingTab: React.FC<Props> = ({ shopId, shop, onNavigate }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [activeSection, setActiveSection] = useState<'overview' | 'campaigns' | 'audience' | 'tools' | 'landing_pages' | 'tracking' | 'analytics'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<any>(null);

  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await ApiService.getCustomerAnalytics(shopId);
        if (!cancelled) setCustomerAnalytics(data);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [shopId]);

  const stats = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cvr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const roas = totalSpent > 0 ? (totalConversions * 100) / totalSpent : 0;
    return { activeCampaigns, totalBudget, totalSpent, totalImpressions, totalClicks, totalConversions, ctr, cvr, roas };
  }, [campaigns]);

  const quickActions = [
    {
      id: 'facebook_ads',
      label: 'Facebook Ads',
      desc: isArabic ? 'إنشاء حملة على فيسبوك' : 'Create Facebook campaign',
      icon: <Facebook size={24} />,
      color: 'from-blue-500 to-blue-700',
      url: 'https://www.facebook.com/adsmanager',
    },
    {
      id: 'instagram_ads',
      label: 'Instagram Ads',
      desc: isArabic ? 'إنشاء حملة على انستجرام' : 'Create Instagram campaign',
      icon: <Instagram size={24} />,
      color: 'from-pink-500 to-purple-600',
      url: 'https://www.facebook.com/adsmanager',
    },
    {
      id: 'whatsapp_campaign',
      label: 'WhatsApp Campaign',
      desc: isArabic ? 'حملة رسائل واتساب' : 'WhatsApp message campaign',
      icon: <MessageCircle size={24} />,
      color: 'from-green-500 to-green-700',
      url: 'https://business.whatsapp.com/',
    },
    {
      id: 'sms_campaign',
      label: 'SMS Campaign',
      desc: isArabic ? 'حملة رسائل نصية' : 'Text message campaign',
      icon: <Smartphone size={24} />,
      color: 'from-purple-500 to-purple-700',
      action: 'create_campaign',
    },
    {
      id: 'email_campaign',
      label: 'Email Campaign',
      desc: isArabic ? 'حملة بريد إلكتروني' : 'Email marketing campaign',
      icon: <Mail size={24} />,
      color: 'from-cyan-500 to-cyan-700',
      action: 'create_campaign',
    },
    {
      id: 'in_app_notification',
      label: isArabic ? 'إشعار داخل التطبيق' : 'In-App Notification',
      desc: isArabic ? 'إرسال إشعار للعملاء' : 'Send notification to customers',
      icon: <Bell size={24} />,
      color: 'from-amber-500 to-orange-600',
      action: 'navigate_notifications',
    },
    {
      id: 'promotions',
      label: isArabic ? 'عروض ترويجية' : 'Promotions',
      desc: isArabic ? 'إنشاء كوبونات وعروض' : 'Create coupons and offers',
      icon: <Gift size={24} />,
      color: 'from-rose-500 to-pink-600',
      action: 'navigate_promotions',
    },
    {
      id: 'audience_segment',
      label: isArabic ? 'تقسيم الجمهور' : 'Audience Segments',
      desc: isArabic ? 'استهداف فئة محددة' : 'Target specific segment',
      icon: <Users size={24} />,
      color: 'from-indigo-500 to-blue-600',
      action: 'navigate_customers',
    },
  ];

  const handleActionClick = (action: any) => {
    if (action === 'navigate_notifications') onNavigate?.('notifications');
    else if (action === 'navigate_promotions') onNavigate?.('promotions');
    else if (action === 'navigate_customers') onNavigate?.('customers');
    else if (action === 'create_campaign') setShowCreateModal(true);
  };

  const overviewStats = [
    { label: isArabic ? 'الحملات النشطة' : 'Active Campaigns', value: stats.activeCampaigns, icon: <Megaphone size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: isArabic ? 'إجمالي الميزانية' : 'Total Budget', value: `${t('business.reports.currency')} ${stats.totalBudget.toLocaleString()}`, icon: <DollarSign size={20} />, color: 'bg-green-50 text-green-600' },
    { label: isArabic ? 'إجمالي الإنفاق' : 'Total Spent', value: `${t('business.reports.currency')} ${stats.totalSpent.toLocaleString()}`, icon: <Target size={20} />, color: 'bg-amber-50 text-amber-600' },
    { label: isArabic ? 'معدل النقر (CTR)' : 'CTR', value: `${stats.ctr.toFixed(1)}%`, icon: <MousePointerClick size={20} />, color: 'bg-purple-50 text-purple-600' },
    { label: isArabic ? 'الظهور' : 'Impressions', value: stats.totalImpressions.toLocaleString(), icon: <Eye size={20} />, color: 'bg-cyan-50 text-cyan-600' },
    { label: isArabic ? 'النقرات' : 'Clicks', value: stats.totalClicks.toLocaleString(), icon: <MousePointerClick size={20} />, color: 'bg-indigo-50 text-indigo-600' },
    { label: isArabic ? 'التحويلات' : 'Conversions', value: stats.totalConversions.toLocaleString(), icon: <TrendingUp size={20} />, color: 'bg-emerald-50 text-emerald-600' },
    { label: isArabic ? 'معدل التحويل (CVR)' : 'CVR', value: `${stats.cvr.toFixed(1)}%`, icon: <Activity size={20} />, color: 'bg-rose-50 text-rose-600' },
  ];

  const audienceSegments = useMemo(() => {
    if (!customerAnalytics) return [];
    return [
      {
        label: isArabic ? 'إجمالي العملاء' : 'Total Customers',
        value: customerAnalytics.totalCustomers || 0,
        color: 'bg-blue-500',
        icon: <Users size={18} />,
      },
      {
        label: isArabic ? 'عملاء جدد هذا الشهر' : 'New This Month',
        value: customerAnalytics.newCustomersThisMonth || 0,
        color: 'bg-green-500',
        icon: <Plus size={18} />,
      },
      {
        label: isArabic ? 'عملاء عائدون' : 'Returning',
        value: customerAnalytics.returningCustomers || 0,
        color: 'bg-purple-500',
        icon: <Repeat size={18} />,
      },
      {
        label: isArabic ? 'أفضل العملاء' : 'Top Customers',
        value: customerAnalytics.topCustomers?.length || 0,
        color: 'bg-amber-500',
        icon: <Target size={18} />,
      },
      {
        label: isArabic ? 'معرضون للتوقف' : 'At Risk',
        value: customerAnalytics.atRiskCustomers?.length || 0,
        color: 'bg-orange-500',
        icon: <AlertTriangle size={18} />,
      },
      {
        label: isArabic ? 'توقفوا (Churned)' : 'Churned',
        value: customerAnalytics.churnedCustomers?.length || 0,
        color: 'bg-red-500',
        icon: <Clock size={18} />,
      },
    ];
  }, [customerAnalytics]);

  const sectionTabs = [
    { id: 'overview' as const, label: isArabic ? 'نظرة عامة' : 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'campaigns' as const, label: isArabic ? 'الحملات' : 'Campaigns', icon: <Megaphone size={16} /> },
    { id: 'landing_pages' as const, label: isArabic ? 'صفحات الهبوط' : 'Landing Pages', icon: <Layout size={16} /> },
    { id: 'tracking' as const, label: isArabic ? 'روابط التتبع' : 'Tracking Links', icon: <Link2 size={16} /> },
    { id: 'analytics' as const, label: isArabic ? 'التحليلات' : 'Analytics', icon: <Activity size={16} /> },
    { id: 'audience' as const, label: isArabic ? 'الجمهور' : 'Audience', icon: <Users size={16} /> },
    { id: 'tools' as const, label: isArabic ? 'أدوات التسويق' : 'Marketing Tools', icon: <Zap size={16} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Section Tabs */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
              <Megaphone size={24} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">{isArabic ? 'مركز التسويق' : 'Marketing Center'}</h3>
              <p className="text-xs text-slate-400 font-bold">{isArabic ? 'إدارة الحملات والإعلانات الممولة من مكان واحد' : 'Manage campaigns and sponsored ads all in one place'}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-black transition-all"
          >
            <Plus size={16} />
            {isArabic ? 'حملة جديدة' : 'New Campaign'}
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sectionTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => action.url ? window.open(action.url, '_blank') : handleActionClick(action.action)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white font-bold text-xs hover:scale-105 transition-transform shadow-sm`}
                >
                  {action.icon}
                  <span className="text-center">{action.label}</span>
                  <span className="text-[10px] opacity-80 text-center">{action.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Campaigns Section */}
      {activeSection === 'campaigns' && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          {campaigns.length === 0 ? (
            <div className="py-20 text-center">
              <Megaphone size={64} className="mx-auto mb-4 text-slate-200" />
              <p className="font-black text-xl text-slate-300 mb-2">{isArabic ? 'لا توجد حملات بعد' : 'No campaigns yet'}</p>
              <p className="text-sm text-slate-400 mb-6">{isArabic ? 'ابدأ بإنشاء حملتك التسويقية الأولى' : 'Start by creating your first marketing campaign'}</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs inline-flex items-center gap-2 hover:bg-black transition-all"
              >
                <Plus size={16} />
                {isArabic ? 'إنشاء حملة' : 'Create Campaign'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const platform = PLATFORM_CONFIG[campaign.platform];
                const status = STATUS_CONFIG[campaign.status];
                const progress = campaign.budget > 0 ? Math.min(100, (campaign.spent / campaign.budget) * 100) : 0;
                return (
                  <div key={campaign.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${platform.bgColor} ${platform.color}`}>
                          {platform.icon}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{campaign.name}</p>
                          <p className="text-xs text-slate-400 font-bold">{isArabic ? platform.label.ar : platform.label.en}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${status.bgColor} ${status.color}`}>
                        {status.icon}
                        {isArabic ? status.label.ar : status.label.en}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{isArabic ? 'الظهور' : 'Impr.'}</p>
                        <p className="text-sm font-black text-slate-900">{campaign.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{isArabic ? 'النقرات' : 'Clicks'}</p>
                        <p className="text-sm font-black text-slate-900">{campaign.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{isArabic ? 'التحويلات' : 'Conv.'}</p>
                        <p className="text-sm font-black text-slate-900">{campaign.conversions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{isArabic ? 'الإنفاق' : 'Spent'}</p>
                        <p className="text-sm font-black text-slate-900">{t('business.reports.currency')} {campaign.spent.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-l from-purple-500 to-pink-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{progress.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Audience Section */}
      {activeSection === 'audience' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Users size={18} className="text-blue-500" />
              {isArabic ? 'تقسيم الجمهور' : 'Audience Segments'}
            </h4>
            <p className="text-xs text-slate-400 font-bold mb-6">{isArabic ? 'استهدف العملاء حسب سلوكهم ومستوى تفاعلهم' : 'Target customers by behavior and engagement'}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {audienceSegments.map((seg, i) => (
                <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${seg.color} text-white`}>
                    {seg.icon}
                  </div>
                  <p className="text-2xl font-black text-slate-900">{seg.value}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{seg.label}</p>
                  <button className="mt-3 text-[10px] font-black text-blue-500 flex items-center gap-1 hover:gap-2 transition-all">
                    {isArabic ? 'استهداف' : 'Target'} <ArrowRight size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Targeting Options */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Target size={18} className="text-purple-500" />
              {isArabic ? 'خيارات الاستهداف' : 'Targeting Options'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: isArabic ? 'استهداف حسب العمر' : 'Age Targeting', desc: isArabic ? 'حدد الفئة العمرية المناسبة' : 'Define the right age group' },
                { label: isArabic ? 'استهداف حسب الموقع' : 'Location Targeting', desc: isArabic ? 'استهدف عملاء في منطقة محددة' : 'Target customers in a specific area' },
                { label: isArabic ? 'استهداف حسب الاهتمامات' : 'Interest Targeting', desc: isArabic ? 'بناءً على سلوك الشراء' : 'Based on purchase behavior' },
                { label: isArabic ? 'إعادة استهداف العملاء غير النشطين' : 'Retarget Inactive Customers', desc: isArabic ? 'تواصل مع العملاء الذين لم يزروا متجرك مؤخراً' : 'Reach customers who haven\'t visited recently' },
                { label: isArabic ? 'استهداف أفضل العملاء' : 'Target Top Customers', desc: isArabic ? 'عروض خاصة للعملاء المخلصين' : 'Special offers for loyal customers' },
                { label: isArabic ? 'استهداف العملاء المعرضين للتوقف' : 'Target At-Risk Customers', desc: isArabic ? 'حملات احتفاظ للعملاء المعرضين للتوقف' : 'Retention campaigns for at-risk customers' },
              ].map((opt, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer">
                  <div>
                    <p className="text-sm font-black text-slate-900">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{opt.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tools Section */}
      {activeSection === 'tools' && (
        <div className="space-y-6">
          {/* Ad Platform Integration */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <ExternalLink size={18} className="text-blue-500" />
              {isArabic ? 'منصات الإعلانات' : 'Ad Platforms'}
            </h4>
            <p className="text-xs text-slate-400 font-bold mb-6">{isArabic ? 'اربط حساباتك على منصات الإعلانات وتابع أداءها من هنا' : 'Connect your ad platform accounts and track performance here'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Facebook Ads Manager', desc: isArabic ? 'إدارة إعلانات فيسبوك و انستجرام' : 'Manage Facebook & Instagram ads', icon: <Facebook size={24} />, color: 'bg-blue-50 text-blue-600', url: 'https://www.facebook.com/adsmanager' },
                { name: 'Google Ads', desc: isArabic ? 'إعلانات جوجل و يوتيوب' : 'Google & YouTube ads', icon: <BarChart3 size={24} />, color: 'bg-red-50 text-red-600', url: 'https://ads.google.com/' },
                { name: 'WhatsApp Business', desc: isArabic ? 'حملات واتساب للأعمال' : 'WhatsApp business campaigns', icon: <MessageCircle size={24} />, color: 'bg-green-50 text-green-600', url: 'https://business.whatsapp.com/' },
                { name: 'TikTok Ads', desc: isArabic ? 'إعلانات تيك توك' : 'TikTok ads', icon: <Smartphone size={24} />, color: 'bg-slate-50 text-slate-900', url: 'https://ads.tiktok.com/' },
              ].map((platform, i) => (
                <button
                  key={i}
                  onClick={() => window.open(platform.url, '_blank')}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all text-right"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${platform.color}`}>
                    {platform.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm text-slate-900">{platform.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{platform.desc}</p>
                  </div>
                  <ExternalLink size={16} className="text-slate-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Marketing Tools */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              {isArabic ? 'أدوات التسويق' : 'Marketing Tools'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: isArabic ? 'مولد كوبونات' : 'Coupon Generator', desc: isArabic ? 'إنشاء أكواد خصم' : 'Create discount codes', icon: <Gift size={20} />, action: 'navigate_promotions' },
                { label: isArabic ? 'إشعار جماعي' : 'Bulk Notification', desc: isArabic ? 'إرسال إشعار لكل العملاء' : 'Send notification to all customers', icon: <Bell size={20} />, action: 'navigate_notifications' },
                { label: isArabic ? 'رسالة واتساب' : 'WhatsApp Message', desc: isArabic ? 'حملة رسائل مباشرة' : 'Direct message campaign', icon: <Send size={20} />, action: 'navigate_customers' },
                { label: isArabic ? 'تقرير الأداء' : 'Performance Report', desc: isArabic ? 'تحليل نتائج الحملات' : 'Analyze campaign results', icon: <BarChart3 size={20} />, action: 'navigate_reports' },
                { label: isArabic ? 'عروض العملاء' : 'Customer Offers', desc: isArabic ? 'عروض خاصة للعملاء المخلصين' : 'Special offers for loyal customers', icon: <Users size={20} />, action: 'navigate_customers' },
                { label: isArabic ? 'سلة المتروكة' : 'Abandoned Cart', desc: isArabic ? 'استعادة العملاء المترددين' : 'Recover hesitant customers', icon: <ShoppingCart size={20} />, action: 'navigate_abandoned' },
              ].map((tool, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (tool.action === 'navigate_promotions') onNavigate?.('promotions');
                    else if (tool.action === 'navigate_notifications') onNavigate?.('notifications');
                    else if (tool.action === 'navigate_customers') onNavigate?.('customers');
                    else if (tool.action === 'navigate_reports') onNavigate?.('reports');
                    else if (tool.action === 'navigate_abandoned') onNavigate?.('abandonedCart');
                  }}
                  className="flex flex-col items-center gap-2 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600">
                    {tool.icon}
                  </div>
                  <span className="text-xs font-black text-slate-900">{tool.label}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{tool.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Landing Pages Section */}
      {activeSection === 'landing_pages' && (
        <LandingPagesSection shop={shop} shopId={shopId} />
      )}

      {/* UTM Tracking Section */}
      {activeSection === 'tracking' && (
        <UTMTrackingSection shop={shop} shopId={shopId} />
      )}

      {/* Analytics Section */}
      {activeSection === 'analytics' && (
        <AnalyticsSection stats={stats} campaigns={campaigns} customerAnalytics={customerAnalytics} t={t} />
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">{isArabic ? 'حملة جديدة' : 'New Campaign'}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'اسم الحملة' : 'Campaign Name'}</label>
                <input
                  type="text"
                  placeholder={isArabic ? 'مثال: حملة الصيف' : 'e.g. Summer Sale'}
                  className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-purple-300"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'المنصة' : 'Platform'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-transparent hover:border-purple-200 transition-all ${config.bgColor}`}
                    >
                      <span className={config.color}>{config.icon}</span>
                      <span className="text-[10px] font-bold text-slate-600">{isArabic ? config.label.ar : config.label.en}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'الميزانية' : 'Budget'}</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-purple-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'تاريخ البداية' : 'Start Date'}</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-purple-300"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'الجمهور المستهدف' : 'Target Audience'}</label>
                <select className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-purple-300">
                  <option>{isArabic ? 'كل العملاء' : 'All Customers'}</option>
                  <option>{isArabic ? 'عملاء جدد' : 'New Customers'}</option>
                  <option>{isArabic ? 'عملاء عائدون' : 'Returning Customers'}</option>
                  <option>{isArabic ? 'أفضل العملاء' : 'Top Customers'}</option>
                  <option>{isArabic ? 'معرضون للتوقف' : 'At Risk'}</option>
                </select>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-full py-4 bg-gradient-to-l from-purple-600 to-pink-600 text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all"
              >
                {isArabic ? 'إنشاء الحملة' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
 * Landing Pages Section — صفحات الهبوط
 * ═══════════════════════════════════════════════════════════ */
type LandingPage = {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  visits: number;
  conversions: number;
  bounceRate: number;
  createdAt: string;
};

const LandingPagesSection: React.FC<{ shop: any; shopId: string }> = ({ shop, shopId }) => {
  const { i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '', description: '' });

  useEffect(() => {
    const layout = shop?.layoutConfig && typeof shop.layoutConfig === 'object' ? shop.layoutConfig : {};
    const pages = (layout as any)?.landingPages || [];
    if (Array.isArray(pages)) setLandingPages(pages);
  }, [shop]);

  const shopSlug = shop?.slug || shop?.id || '';
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/s/${shopSlug}` : `/s/${shopSlug}`;

  const handleCreate = () => {
    const page: LandingPage = {
      id: `lp_${Date.now()}`,
      title: newPage.title || 'صفحة هبوط جديدة',
      slug: newPage.slug || `campaign-${Date.now()}`,
      status: 'draft',
      visits: 0,
      conversions: 0,
      bounceRate: 0,
      createdAt: new Date().toISOString(),
    };
    setLandingPages(prev => [...prev, page]);
    setNewPage({ title: '', slug: '', description: '' });
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    setLandingPages(prev => prev.filter(p => p.id !== id));
  };

  const handlePublish = (id: string) => {
    setLandingPages(prev => prev.map(p => p.id === id ? { ...p, status: 'published' as const } : p));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layout size={18} className="text-purple-500" />
              {isArabic ? 'صفحات الهبوط' : 'Landing Pages'}
            </h4>
            <p className="text-xs text-slate-400 font-bold mt-1">{isArabic ? 'أنشئ صفحات هبوط مخصصة لحملاتك الإعلانية وتتبع أداءها' : 'Create custom landing pages for your ad campaigns and track performance'}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-black transition-all"
          >
            <Plus size={14} />
            {isArabic ? 'صفحة جديدة' : 'New Page'}
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 p-3 rounded-xl text-center">
            <p className="text-xl font-black text-slate-900">{landingPages.length}</p>
            <p className="text-[10px] font-bold text-slate-400">{isArabic ? 'إجمالي الصفحات' : 'Total Pages'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl text-center">
            <p className="text-xl font-black text-green-600">{landingPages.filter(p => p.status === 'published').length}</p>
            <p className="text-[10px] font-bold text-slate-400">{isArabic ? 'منشورة' : 'Published'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl text-center">
            <p className="text-xl font-black text-amber-600">{landingPages.filter(p => p.status === 'draft').length}</p>
            <p className="text-[10px] font-bold text-slate-400">{isArabic ? 'مسودات' : 'Drafts'}</p>
          </div>
        </div>
      </div>

      {/* Landing Pages List */}
      {landingPages.length === 0 ? (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="py-16 text-center">
            <Layout size={56} className="mx-auto mb-4 text-slate-200" />
            <p className="font-black text-lg text-slate-300 mb-2">{isArabic ? 'لا توجد صفحات هبوط بعد' : 'No landing pages yet'}</p>
            <p className="text-sm text-slate-400 mb-6">{isArabic ? 'أنشئ صفحة هبوط مخصصة لحملتك الإعلانية' : 'Create a custom landing page for your ad campaign'}</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs inline-flex items-center gap-2 hover:bg-black transition-all"
            >
              <Plus size={16} />
              {isArabic ? 'إنشاء صفحة هبوط' : 'Create Landing Page'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {landingPages.map((page) => {
            const pageUrl = `${baseUrl}/${page.slug}`;
            const conversionRate = page.visits > 0 ? (page.conversions / page.visits) * 100 : 0;
            return (
              <div key={page.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <Layout size={18} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-900">{page.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Link2 size={10} className="text-slate-300" />
                        <span className="text-[10px] text-slate-400 font-bold truncate max-w-[200px]">{pageUrl}</span>
                        <button
                          onClick={() => navigator.clipboard?.writeText(pageUrl)}
                          className="text-slate-300 hover:text-slate-600 ml-1"
                        >
                          <Copy size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${page.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {page.status === 'published' ? (isArabic ? 'منشور' : 'Published') : (isArabic ? 'مسودة' : 'Draft')}
                    </span>
                    {page.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(page.id)}
                        className="text-[10px] font-black text-blue-500 hover:text-blue-700"
                      >
                        {isArabic ? 'نشر' : 'Publish'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="text-[10px] font-black text-red-400 hover:text-red-600"
                    >
                      {isArabic ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{isArabic ? 'الزيارات' : 'Visits'}</p>
                    <p className="text-sm font-black text-slate-900">{page.visits.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{isArabic ? 'التحويلات' : 'Conv.'}</p>
                    <p className="text-sm font-black text-slate-900">{page.conversions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{isArabic ? 'معدل التحويل' : 'CVR'}</p>
                    <p className="text-sm font-black text-green-600">{conversionRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{isArabic ? 'معدل الارتداد' : 'Bounce'}</p>
                    <p className="text-sm font-black text-amber-600">{page.bounceRate.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Landing Page Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">{isArabic ? 'صفحة هبوط جديدة' : 'New Landing Page'}</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'عنوان الصفحة' : 'Page Title'}</label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) => setNewPage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={isArabic ? 'مثال: عرض الصيف 2026' : 'e.g. Summer Offer 2026'}
                  className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-purple-300"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'الرابط (Slug)' : 'URL Slug'}</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold truncate">{baseUrl}/</span>
                  <input
                    type="text"
                    value={newPage.slug}
                    onChange={(e) => setNewPage(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="summer-offer"
                    className="flex-1 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-purple-300"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'وصف الصفحة' : 'Description'}</label>
                <textarea
                  value={newPage.description}
                  onChange={(e) => setNewPage(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={isArabic ? 'وصف موجز لصفحة الهبوط...' : 'Brief description of the landing page...'}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-purple-300 resize-none"
                />
              </div>
              <button
                onClick={handleCreate}
                className="w-full py-4 bg-gradient-to-l from-purple-600 to-pink-600 text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all"
              >
                {isArabic ? 'إنشاء الصفحة' : 'Create Page'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
 * UTM Tracking Section — مولد روابط التتبع
 * ═══════════════════════════════════════════════════════════ */
const UTMTrackingSection: React.FC<{ shop: any; shopId: string }> = ({ shop, shopId }) => {
  const { i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [utm, setUtm] = useState({
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
  });
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedLinks, setSavedLinks] = useState<any[]>([]);

  const shopSlug = shop?.slug || shop?.id || '';
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/s/${shopSlug}` : `/s/${shopSlug}`;

  const generateUrl = () => {
    const params = new URLSearchParams();
    if (utm.source) params.append('utm_source', utm.source);
    if (utm.medium) params.append('utm_medium', utm.medium);
    if (utm.campaign) params.append('utm_campaign', utm.campaign);
    if (utm.term) params.append('utm_term', utm.term);
    if (utm.content) params.append('utm_content', utm.content);
    const qs = params.toString();
    setGeneratedUrl(qs ? `${baseUrl}?${qs}` : baseUrl);
  };

  const handleCopy = () => {
    if (generatedUrl) {
      navigator.clipboard?.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveLink = () => {
    if (!generatedUrl) return;
    const link = {
      id: `utm_${Date.now()}`,
      url: generatedUrl,
      ...utm,
      clicks: 0,
      createdAt: new Date().toISOString(),
    };
    setSavedLinks(prev => [link, ...prev]);
    setUtm({ source: '', medium: '', campaign: '', term: '', content: '' });
    setGeneratedUrl('');
  };

  const sourcePresets = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'google', label: 'Google Ads' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'snapchat', label: 'Snapchat' },
  ];

  const mediumPresets = [
    { value: 'cpc', label: isArabic ? 'CPC (إعلان مدفوع)' : 'CPC (Paid Ad)' },
    { value: 'social', label: isArabic ? 'Social (سوشيال ميديا)' : 'Social Media' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'referral', label: 'Referral' },
    { value: 'organic', label: 'Organic' },
  ];

  return (
    <div className="space-y-6">
      {/* UTM Generator */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <h4 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
          <Link2 size={18} className="text-purple-500" />
          {isArabic ? 'مولد روابط التتبع (UTM Builder)' : 'UTM Link Builder'}
        </h4>
        <p className="text-xs text-slate-400 font-bold mb-6">{isArabic ? 'أنشئ روابط مخصصة لحملاتك لتتبع مصادر الزيارات والنقرات' : 'Create custom tracking links for your campaigns to monitor traffic sources and clicks'}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'المصدر (utm_source) *' : 'Source (utm_source) *'}</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {sourcePresets.map(p => (
                <button
                  key={p.value}
                  onClick={() => setUtm(prev => ({ ...prev, source: p.value }))}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${utm.source === p.value ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={utm.source}
              onChange={(e) => setUtm(prev => ({ ...prev, source: e.target.value }))}
              placeholder="facebook"
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-purple-300"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'الوسيط (utm_medium) *' : 'Medium (utm_medium) *'}</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {mediumPresets.map(p => (
                <button
                  key={p.value}
                  onClick={() => setUtm(prev => ({ ...prev, medium: p.value }))}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${utm.medium === p.value ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={utm.medium}
              onChange={(e) => setUtm(prev => ({ ...prev, medium: e.target.value }))}
              placeholder="cpc"
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-purple-300"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'اسم الحملة (utm_campaign)' : 'Campaign (utm_campaign)'}</label>
            <input
              type="text"
              value={utm.campaign}
              onChange={(e) => setUtm(prev => ({ ...prev, campaign: e.target.value }))}
              placeholder="summer_sale_2026"
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-purple-300"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'الكلمة (utm_term)' : 'Term (utm_term)'}</label>
            <input
              type="text"
              value={utm.term}
              onChange={(e) => setUtm(prev => ({ ...prev, term: e.target.value }))}
              placeholder="shoes"
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-purple-300"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-black text-slate-400 uppercase mb-2 block">{isArabic ? 'المحتوى (utm_content)' : 'Content (utm_content)'}</label>
          <input
            type="text"
            value={utm.content}
            onChange={(e) => setUtm(prev => ({ ...prev, content: e.target.value }))}
            placeholder="banner_top / sidebar_ad"
            className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold focus:outline-none focus:border-purple-300"
          />
        </div>

        <button
          onClick={generateUrl}
          className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all mb-4"
        >
          {isArabic ? 'توليد الرابط' : 'Generate Link'}
        </button>

        {generatedUrl && (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-purple-400 uppercase mb-1">{isArabic ? 'الرابط المُولّد' : 'Generated URL'}</p>
                <p className="text-xs font-bold text-slate-900 break-all">{generatedUrl}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className={`px-3 py-2 rounded-xl font-black text-[10px] flex items-center gap-1 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                  {copied ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ' : 'Copy')}
                </button>
                <button
                  onClick={handleSaveLink}
                  className="px-3 py-2 rounded-xl font-black text-[10px] bg-slate-900 text-white hover:bg-black flex items-center gap-1"
                >
                  <Plus size={12} />
                  {isArabic ? 'حفظ' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saved Links */}
      {savedLinks.length > 0 && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Link2 size={18} className="text-blue-500" />
            {isArabic ? 'الروابط المحفوظة' : 'Saved Links'} ({savedLinks.length})
          </h4>
          <div className="space-y-3">
            {savedLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{link.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {link.source && <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{link.source}</span>}
                    {link.medium && <span className="text-[10px] font-black text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">{link.medium}</span>}
                    {link.campaign && <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full">{link.campaign}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-900">{link.clicks}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">{isArabic ? 'نقرات' : 'Clicks'}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard?.writeText(link.url)}
                    className="text-slate-300 hover:text-slate-600"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
 * Analytics Section — التحليلات الشاملة
 * ═══════════════════════════════════════════════════════════ */
const AnalyticsSection: React.FC<{ stats: any; campaigns: Campaign[]; customerAnalytics: any; t: any }> = ({ stats, campaigns, customerAnalytics, t }) => {
  const { i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const trafficSources = [
    { source: 'Facebook', visits: 1240, percentage: 35, color: 'bg-blue-500' },
    { source: 'Instagram', visits: 890, percentage: 25, color: 'bg-pink-500' },
    { source: 'Google', visits: 720, percentage: 20, color: 'bg-red-500' },
    { source: 'Direct', visits: 380, percentage: 11, color: 'bg-slate-500' },
    { source: 'WhatsApp', visits: 200, percentage: 6, color: 'bg-green-500' },
    { source: 'Other', visits: 120, percentage: 3, color: 'bg-amber-500' },
  ];

  const deviceBreakdown = [
    { device: isArabic ? 'موبايل' : 'Mobile', icon: <MobileIcon size={16} />, percentage: 65, color: 'text-purple-600' },
    { device: isArabic ? 'كمبيوتر' : 'Desktop', icon: <Monitor size={16} />, percentage: 25, color: 'text-blue-600' },
    { device: isArabic ? 'تابلت' : 'Tablet', icon: <Tablet size={16} />, percentage: 10, color: 'text-cyan-600' },
  ];

  const conversionFunnel = [
    { stage: isArabic ? 'زوار' : 'Visitors', count: 3550, percentage: 100 },
    { stage: isArabic ? 'تفاعلوا' : 'Engaged', count: 1420, percentage: 40 },
    { stage: isArabic ? 'أضافوا للسلة' : 'Added to Cart', count: 530, percentage: 15 },
    { stage: isArabic ? 'اشتروا' : 'Purchased', count: 213, percentage: 6 },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Activity size={18} className="text-purple-500" />
          {isArabic ? 'تحليلات شاملة' : 'Comprehensive Analytics'}
        </h4>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black ${timeRange === r ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
            >
              {r === '7d' ? (isArabic ? '7 أيام' : '7 Days') : r === '30d' ? (isArabic ? '30 يوم' : '30 Days') : (isArabic ? '90 يوم' : '90 Days')}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <Eye size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalImpressions.toLocaleString()}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">{isArabic ? 'إجمالي الظهور' : 'Impressions'}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={12} className="text-green-500" />
            <span className="text-[10px] font-bold text-green-500">+12.5%</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
            <MousePointerClick size={20} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalClicks.toLocaleString()}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">{isArabic ? 'إجمالي النقرات' : 'Total Clicks'}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={12} className="text-green-500" />
            <span className="text-[10px] font-bold text-green-500">+8.3%</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <TrendingUp size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalConversions.toLocaleString()}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">{isArabic ? 'التحويلات' : 'Conversions'}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={12} className="text-green-500" />
            <span className="text-[10px] font-bold text-green-500">+15.7%</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{t('business.reports.currency')} {stats.totalSpent.toLocaleString()}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">{isArabic ? 'إجمالي الإنفاق' : 'Total Spent'}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown size={12} className="text-red-500" />
            <span className="text-[10px] font-bold text-red-500">-3.2%</span>
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <h4 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
          <Share2 size={18} className="text-blue-500" />
          {isArabic ? 'مصادر الزيارات' : 'Traffic Sources'}
        </h4>
        <p className="text-xs text-slate-400 font-bold mb-6">{isArabic ? 'من أين يأتي زوارك؟ توزيع الزيارات حسب المصدر' : 'Where are your visitors coming from? Traffic distribution by source'}</p>
        <div className="space-y-3">
          {trafficSources.map((src) => (
            <div key={src.source}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-700">{src.source}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">{src.visits.toLocaleString()}</span>
                  <span className="text-[10px] font-black text-slate-400">{src.percentage}%</span>
                </div>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${src.color}`} style={{ width: `${src.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Funnel + Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h4 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
            <Target size={18} className="text-purple-500" />
            {isArabic ? 'قمع التحويل' : 'Conversion Funnel'}
          </h4>
          <p className="text-xs text-slate-400 font-bold mb-6">{isArabic ? 'رحلة العميل من الزيارة حتى الشراء' : 'Customer journey from visit to purchase'}</p>
          <div className="space-y-4">
            {conversionFunnel.map((step, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-700">{step.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{step.count.toLocaleString()}</span>
                    <span className="text-[10px] font-black text-slate-400">{step.percentage}%</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-purple-500 to-pink-500"
                    style={{ width: `${step.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h4 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
            <Smartphone size={18} className="text-cyan-500" />
            {isArabic ? 'توزيع الأجهزة' : 'Device Breakdown'}
          </h4>
          <p className="text-xs text-slate-400 font-bold mb-6">{isArabic ? 'من أي أجهزة يزور عملاؤك متجرك' : 'Which devices do your customers use to visit your store'}</p>
          <div className="space-y-4">
            {deviceBreakdown.map((dev) => (
              <div key={dev.device} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${dev.color}`}>
                  {dev.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-700">{dev.device}</span>
                    <span className="text-xs font-black text-slate-500">{dev.percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-slate-400" style={{ width: `${dev.percentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Performance Table */}
      {campaigns.length > 0 && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-500" />
            {isArabic ? 'أداء الحملات' : 'Campaign Performance'}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-right py-3 px-2 font-black text-slate-400 uppercase">{isArabic ? 'الحملة' : 'Campaign'}</th>
                  <th className="text-right py-3 px-2 font-black text-slate-400 uppercase">{isArabic ? 'الظهور' : 'Impr.'}</th>
                  <th className="text-right py-3 px-2 font-black text-slate-400 uppercase">{isArabic ? 'النقرات' : 'Clicks'}</th>
                  <th className="text-right py-3 px-2 font-black text-slate-400 uppercase">CTR</th>
                  <th className="text-right py-3 px-2 font-black text-slate-400 uppercase">{isArabic ? 'تحويلات' : 'Conv.'}</th>
                  <th className="text-right py-3 px-2 font-black text-slate-400 uppercase">{isArabic ? 'إنفاق' : 'Spent'}</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
                  return (
                    <tr key={c.id} className="border-b border-slate-50">
                      <td className="py-3 px-2 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-2 font-bold text-slate-600">{c.impressions.toLocaleString()}</td>
                      <td className="py-3 px-2 font-bold text-slate-600">{c.clicks.toLocaleString()}</td>
                      <td className="py-3 px-2 font-black text-purple-600">{ctr.toFixed(1)}%</td>
                      <td className="py-3 px-2 font-black text-green-600">{c.conversions}</td>
                      <td className="py-3 px-2 font-bold text-slate-600">{t('business.reports.currency')} {c.spent.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingTab;
