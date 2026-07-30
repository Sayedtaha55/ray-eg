import React from 'react';
import { Brain, TrendingUp, Package, Users, DollarSign, ShoppingCart, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

const RecommendationsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const recommendations = [
    { category: isArabic ? 'المخزون' : 'Inventory', icon: <Package size={20} />, title: isArabic ? 'إعادة طلب منتج ب' : 'Reorder Product B', text: isArabic ? 'المخزون منخفض، يُنصح بطلب 50 وحدة إضافية' : 'Stock is low, recommend ordering 50 more units', impact: isArabic ? 'عالي' : 'High', color: 'bg-amber-50 text-amber-600' },
    { category: isArabic ? 'التسعير' : 'Pricing', icon: <DollarSign size={20} />, title: isArabic ? 'تعديل سعر منتج ج' : 'Adjust Product C price', text: isArabic ? 'السعر الحالي أقل من السوق بـ 15%' : 'Current price is 15% below market average', impact: isArabic ? 'متوسط' : 'Medium', color: 'bg-green-50 text-green-600' },
    { category: isArabic ? 'العملاء' : 'Customers', icon: <Users size={20} />, title: isArabic ? 'استهداف العملاء غير النشطين' : 'Target inactive customers', text: isArabic ? '124 عميل لم يشتروا منذ 30 يوم. أرسل عرض خاص' : '124 customers haven\'t purchased in 30 days. Send special offer', impact: isArabic ? 'عالي' : 'High', color: 'bg-purple-50 text-purple-600' },
    { category: isArabic ? 'المبيعات' : 'Sales', icon: <ShoppingCart size={20} />, title: isArabic ? 'عرض حزم منتجات' : 'Bundle products', text: isArabic ? 'العملاء يشترون أ و ب معاً. أنشئ حزمة بخصم 10%' : 'Customers buy A and B together. Create a 10% off bundle', impact: isArabic ? 'متوسط' : 'Medium', color: 'bg-blue-50 text-blue-600' },
    { category: isArabic ? 'التسويق' : 'Marketing', icon: <TrendingUp size={20} />, title: isArabic ? 'زيادة ميزانية الإعلانات' : 'Increase ad budget', text: isArabic ? 'إعلانات الجمعة تحقق ROI 4x. زيادة الميزانية' : 'Friday ads achieve 4x ROI. Increase budget', impact: isArabic ? 'عالي' : 'High', color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white"><Brain size={24} /></div>
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'توصيات الذكاء الاصطناعي' : 'AI Recommendations'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'توصيات لتحسين أداء متجرك' : 'Recommendations to improve your store'}</p></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي التوصيات' : 'Total Recommendations', value: recommendations.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'تأثير عالي' : 'High Impact', value: recommendations.filter(r => r.impact === (isArabic ? 'عالي' : 'High')).length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'تأثير متوسط' : 'Medium Impact', value: recommendations.filter(r => r.impact === (isArabic ? 'متوسط' : 'Medium')).length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'تم تنفيذها' : 'Implemented', value: 0, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Brain size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {recommendations.map((r, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${r.color}`}>{r.icon}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">{r.title}</p>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-bold">{r.category}</span>
                </div>
                <p className="text-sm text-slate-500">{r.text}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${r.impact === (isArabic ? 'عالي' : 'High') ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{r.impact}</span>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors">{isArabic ? 'تنفيذ' : 'Apply'} <ArrowRight size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPage;
