import React from 'react';
import { Globe, Smartphone, Monitor, Tablet, Eye, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

const TrafficPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const sources = [
    { source: isArabic ? 'بحث مباشر' : 'Direct', visits: 4200, percentage: 34, color: 'bg-blue-500' },
    { source: isArabic ? 'محركات البحث' : 'Search Engines', visits: 3500, percentage: 28, color: 'bg-green-500' },
    { source: isArabic ? 'وسائل التواصل' : 'Social Media', visits: 2800, percentage: 22, color: 'bg-purple-500' },
    { source: isArabic ? 'إحالات' : 'Referrals', visits: 1200, percentage: 10, color: 'bg-amber-500' },
    { source: isArabic ? 'بريد إلكتروني' : 'Email', visits: 800, percentage: 6, color: 'bg-pink-500' },
  ];

  const devices = [
    { device: isArabic ? 'موبايل' : 'Mobile', icon: <Smartphone size={20} />, percentage: 65, visits: 8125 },
    { device: isArabic ? 'كمبيوتر' : 'Desktop', icon: <Monitor size={20} />, percentage: 28, visits: 3500 },
    { device: isArabic ? 'تابلت' : 'Tablet', icon: <Tablet size={20} />, percentage: 7, visits: 875 },
  ];

  const pages = [
    { url: '/', views: 5200, bounce: 32 },
    { url: '/products', views: 3800, bounce: 28 },
    { url: '/about', views: 1800, bounce: 45 },
    { url: '/contact', views: 950, bounce: 38 },
    { url: '/blog', views: 720, bounce: 52 },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'تحليل الزوار' : 'Traffic Analytics'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'مصادر الزوار وسلوكهم' : 'Visitor sources and behavior'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الزوار' : 'Total Visitors', value: '12,500', color: 'bg-blue-50 text-blue-600', icon: <Eye size={20} /> },
          { label: isArabic ? 'زوار فريدون' : 'Unique Visitors', value: '8,200', color: 'bg-green-50 text-green-600', icon: <Globe size={20} /> },
          { label: isArabic ? 'متوسط مدة الزيارة' : 'Avg Session', value: '4:32', color: 'bg-purple-50 text-purple-600', icon: <Clock size={20} /> },
          { label: isArabic ? 'معدل الارتداد' : 'Bounce Rate', value: '38%', color: 'bg-amber-50 text-amber-600', icon: <TrendingUp size={20} /> },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="p-5 rounded-2xl border border-slate-100">
          <h4 className="font-black mb-4 flex items-center gap-2"><Globe size={16} /> {isArabic ? 'مصادر الزوار' : 'Traffic Sources'}</h4>
          <div className="space-y-3">
            {sources.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1"><span className="text-sm font-bold">{s.source}</span><span className="text-sm text-slate-500">{s.visits.toLocaleString()} ({s.percentage}%)</span></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.percentage}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-100">
          <h4 className="font-black mb-4 flex items-center gap-2"><Smartphone size={16} /> {isArabic ? 'الأجهزة' : 'Devices'}</h4>
          <div className="space-y-4">
            {devices.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600">{d.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1"><span className="text-sm font-bold">{d.device}</span><span className="text-sm text-slate-500">{d.visits.toLocaleString()} ({d.percentage}%)</span></div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${d.percentage}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-slate-100">
        <h4 className="font-black mb-4 flex items-center gap-2"><ExternalLink size={16} /> {isArabic ? 'الصفحات الأكثر زيارة' : 'Top Pages'}</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-right border-b border-slate-100">
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الصفحة' : 'Page'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المشاهدات' : 'Views'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'معدل الارتداد' : 'Bounce Rate'}</th>
            </tr></thead>
            <tbody>
              {pages.map((p, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 font-bold font-mono text-blue-600">{p.url}</td>
                  <td className="py-3 text-slate-600">{p.views.toLocaleString()}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.bounce > 45 ? 'bg-red-100 text-red-600' : p.bounce > 35 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{p.bounce}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrafficPage;
