import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Brain, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

const InsightsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const insights = [
    { type: 'trend', title: isArabic ? 'ارتفاع المبيعات في عطلة نهاية الأسبوع' : 'Weekend sales surge', text: isArabic ? 'المبيعات ترتفع 35% يومي الجمعة والسبت. ننصح بزيادة المخزون قبل weekends.' : 'Sales increase 35% on Fridays and Saturdays. Consider increasing inventory before weekends.', icon: <TrendingUp size={20} />, color: 'bg-green-50 text-green-600' },
    { type: 'alert', title: isArabic ? 'منتج على وشك النفاد' : 'Product running low', text: isArabic ? 'منتج "أ" سي نفاد خلال 3 أيام بناءً على معدل البيع الحالي.' : 'Product "A" will run out in 3 days based on current sales rate.', icon: <AlertTriangle size={20} />, color: 'bg-amber-50 text-amber-600' },
    { type: 'tip', title: isArabic ? 'وقت أفضل للنشر' : 'Best posting time', text: isArabic ? 'أفضل وقت للنشر على وسائل التواصل هو 7-9 مساءً.' : 'Best time to post on social media is 7-9 PM.', icon: <Lightbulb size={20} />, color: 'bg-blue-50 text-blue-600' },
    { type: 'trend', title: isArabic ? 'عملاء جدد متزايدون' : 'Growing new customers', text: isArabic ? 'عدد العملاء الجدد تزايد 27% هذا الشهر، معظمهم من البحث المباشر.' : 'New customers grew 27% this month, mostly from direct search.', icon: <TrendingUp size={20} />, color: 'bg-green-50 text-green-600' },
    { type: 'alert', title: isArabic ? 'معدل ارتداد مرتفع' : 'High bounce rate', text: isArabic ? 'صفحة /blog لديها معدل ارتداد 52%. تحتاج تحسين المحتوى.' : 'Page /blog has 52% bounce rate. Content needs improvement.', icon: <AlertTriangle size={20} />, color: 'bg-red-50 text-red-600' },
    { type: 'tip', title: isArabic ? 'فرصة لزيادة متوسط الطلب' : 'Upsell opportunity', text: isArabic ? 'العملاء الذين يشترون "أ" غالباً يشترون "ب". ننصح بعرض توصية مشتركة.' : 'Customers buying "A" often buy "B". Consider cross-selling.', icon: <Lightbulb size={20} />, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white"><Brain size={24} /></div>
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'رؤى الذكاء الاصطناعي' : 'AI Insights'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تحليلات ذكية لأداء متجرك' : 'Smart analytics for your store'}</p></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'رؤى اليوم' : "Today's Insights", value: insights.length, color: 'bg-purple-50 text-purple-600' },
          { label: isArabic ? 'تنبيهات' : 'Alerts', value: insights.filter(i => i.type === 'alert').length, color: 'bg-red-50 text-red-600' },
          { label: isArabic ? 'اتجاهات' : 'Trends', value: insights.filter(i => i.type === 'trend').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'نصائح' : 'Tips', value: insights.filter(i => i.type === 'tip').length, color: 'bg-blue-50 text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Sparkles size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {insights.map((ins, i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl ${ins.color} flex-shrink-0`}>{ins.icon}</div>
              <div>
                <p className="font-bold text-sm mb-1">{ins.title}</p>
                <p className="text-sm text-slate-500">{ins.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPage;
