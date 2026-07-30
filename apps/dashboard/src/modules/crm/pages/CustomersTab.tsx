import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Megaphone, Search as SearchIcon, UserCheck, UserMinus, Users, Repeat, TrendingUp, AlertTriangle, Crown, Clock, Calendar, ShoppingBag, Download, X, Phone, Mail, Wallet, ShoppingBag as BagIcon, ChevronLeft, Filter, Eye } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { useTranslation } from 'react-i18next';
import { getShopActivityVocabulary } from '@/utils/businessActivityVocabulary';

type Props = { shopId: string; shop?: any };

function normalizePhone(phone: string): string {
  return String(phone || '').replace(/[\s+\-()]/g, '').replace(/^0/, '').replace(/^20/, '').trim();
}

function exportCustomersCSV(customers: any[]) {
  const headers = ['الاسم', 'الهاتف', 'الإيميل', 'عدد الطلبات', 'إجمالي الإنفاق', 'الحالة'];
  const rows = customers.map((c) => [
    c.name || 'عميل',
    c.phone || '',
    c.email || '',
    String(c.orders || c.orderCount || 0),
    String(c.totalSpent || 0),
    c.status || 'active',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `customers-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function MiniBarChart({ data, color = 'bg-blue-500' }: { data: { month: string; total: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex items-end gap-1.5 h-12">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t ${color} opacity-80 transition-all hover:opacity-100`}
            style={{ height: `${Math.max((d.total / max) * 100, 4)}%` }}
            title={`${d.month}: ${d.total}`}
          />
        </div>
      ))}
    </div>
  );
}

const CustomersTab: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const activityVocab = getShopActivityVocabulary(shop, i18n.language);
  const locale = String(i18n.language || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US';
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'all' | 'top' | 'atRisk' | 'churned'>('all');
  const [spendingFilter, setSpendingFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { addToast } = useToast();

  const loadCustomers = useCallback(async () => {
    try {
      const [data, analyticsData] = await Promise.all([
        ApiService.getShopCustomers(shopId),
        ApiService.getCustomerAnalytics(shopId),
      ]);
      setCustomers(data);
      setAnalytics(analyticsData);
    } catch {
      addToast(t('business.customers.loadFailed'), 'error');
    } finally {
      setLoading(false);
    }
  }, [shopId, addToast, t]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const toggleStatus = async (id: string) => {
    try {
      const customer = customers.find((c) => c.id === id);
      const newStatus = customer.status === 'active' ? 'blocked' : 'active';
      await ApiService.updateCustomerStatus(id, newStatus);
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
      addToast(t(`business.customers.${newStatus === 'active' ? 'activated' : 'deactivated'}`), 'success');
    } catch {
      addToast(t('business.customers.updateStatusFailed'), 'error');
    }
  };

  const sendPromotion = async (customerId: string) => {
    try {
      await ApiService.sendCustomerPromotion(customerId, shopId);
      addToast(t('business.customers.promotionSent'), 'success');
    } catch {
      addToast(t('business.customers.promotionFailed'), 'error');
    }
  };

  const openCustomerDetail = async (customerId: string) => {
    setSelectedCustomer(customers.find((c) => c.id === customerId));
    setDetailLoading(true);
    setCustomerDetail(null);
    try {
      const detail = await ApiService.getCustomerDetail(shopId, customerId);
      setCustomerDetail(detail);
    } catch {
      addToast('فشل تحميل تفاصيل العميل', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeCustomerDetail = () => {
    setSelectedCustomer(null);
    setCustomerDetail(null);
  };

  const handleExportCSV = () => {
    if (sectionCustomers.length === 0) {
      addToast('لا يوجد عملاء للتصدير', 'error');
      return;
    }
    exportCustomersCSV(sectionCustomers);
    addToast('تم تصدير قائمة العملاء', 'success');
  };

  const normalizeSearch = normalizePhone(searchTerm);
  const isPhoneSearch = /^\d+$/.test(normalizeSearch) && normalizeSearch.length > 0;

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch = !searchTerm ||
        c.name?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (isPhoneSearch && normalizePhone(c.phone || '').includes(normalizeSearch));
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const total = Number(c.totalSpent || 0);
      const matchesSpending =
        spendingFilter === 'all' ||
        (spendingFilter === 'high' && total >= 1000) ||
        (spendingFilter === 'medium' && total >= 200 && total < 1000) ||
        (spendingFilter === 'low' && total < 200);
      return matchesSearch && matchesStatus && matchesSpending;
    });
  }, [customers, searchTerm, isPhoneSearch, statusFilter, spendingFilter]);

  const sectionCustomers = (() => {
    if (!analytics) return filtered;
    if (activeSection === 'top') {
      const topIds = new Set((analytics.topCustomers || []).map((c: any) => c.id));
      return filtered.filter((c) => topIds.has(c.id));
    }
    if (activeSection === 'atRisk') {
      const riskIds = new Set((analytics.atRiskCustomers || []).map((c: any) => c.id));
      return filtered.filter((c) => riskIds.has(c.id));
    }
    if (activeSection === 'churned') {
      const churnedIds = new Set((analytics.churnedCustomers || []).map((c: any) => c.id));
      return filtered.filter((c) => churnedIds.has(c.id));
    }
    return filtered;
  })();

  const formatDays = (days: number) => {
    if (days === 0) return 'اليوم';
    if (days === 1) return 'أمس';
    if (days < 7) return `منذ ${days} أيام`;
    if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
    if (days < 365) return `منذ ${Math.floor(days / 30)} أشهر`;
    return `منذ ${Math.floor(days / 365)} سنوات`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-center py-20">
          <span className="text-slate-400 font-semibold">{t('business.customers.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Customers */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-slate-500">إجمالي العملاء</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{analytics.totalCustomers}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              +{analytics.newCustomersThisMonth} جديد هذا الشهر
            </p>
          </div>

          {/* Retention Rate */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Repeat className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-slate-500">نسبة العائدين</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{analytics.retentionRate}%</p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {analytics.returningCustomers} عميل عائد
            </p>
          </div>

          {/* Avg Visits */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-slate-500">متوسط الزيارات</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{analytics.avgVisitsPerCustomer}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">زيارة لكل عميل</p>
          </div>

          {/* At Risk */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-semibold text-slate-500">معرضون للتوقف</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{analytics.atRiskCustomers?.length || 0}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {(analytics.churnedCustomers?.length || 0)} توقفوا بالفعل
            </p>
          </div>
        </div>
      )}

      {/* Section Tabs */}
      {analytics && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeSection === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 inline ml-2" />
            كل العملاء
          </button>
          <button
            onClick={() => setActiveSection('top')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeSection === 'top'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Crown className="w-4 h-4 inline ml-2" />
            أفضل العملاء
          </button>
          <button
            onClick={() => setActiveSection('atRisk')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeSection === 'atRisk'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline ml-2" />
            معرضون للتوقف
            {analytics.atRiskCustomers?.length > 0 && (
              <span className="mr-2 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">
                {analytics.atRiskCustomers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('churned')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeSection === 'churned'
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4 inline ml-2" />
            توقفوا عن الشراء
            {analytics.churnedCustomers?.length > 0 && (
              <span className="mr-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                {analytics.churnedCustomers.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* At-Risk Alert Banner */}
      {analytics && activeSection === 'atRisk' && analytics.atRiskCustomers?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-800">
            هؤلاء العملاء لم يطلبوا منذ 60-90 يوماً — تواصل معهم قبل أن يتركوا نهائياً!
          </p>
        </div>
      )}

      {/* Churned Alert Banner */}
      {analytics && activeSection === 'churned' && analytics.churnedCustomers?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-800">
            هؤلاء العملاء لم يطلبوا منذ أكثر من 90 يوماً — أرسل لهم عرضاً خاصاً لإعادتهم!
          </p>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">تصفية:</span>
        </div>
        <select
          value={spendingFilter}
          onChange={(e) => setSpendingFilter(e.target.value as any)}
          className="bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium border-none outline-none cursor-pointer hover:bg-slate-100 transition-all"
        >
          <option value="all">كل المستويات</option>
          <option value="high">إنفاق عالي (1000+)</option>
          <option value="medium">إنفاق متوسط (200-1000)</option>
          <option value="low">إنفاق منخفض (&lt;200)</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium border-none outline-none cursor-pointer hover:bg-slate-100 transition-all"
        >
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="blocked">محظور</option>
        </select>
        <div className="flex-1" />
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all"
        >
          <Download className="w-4 h-4" />
          تصدير CSV
        </button>
      </div>

      {/* Customer Table */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6 flex-row-reverse">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
            {activeSection === 'top' ? 'أفضل العملاء' :
             activeSection === 'atRisk' ? 'عملاء معرضون للتوقف' :
             activeSection === 'churned' ? 'عملاء توقفوا عن الشراء' :
             activityVocab.customersTabLabel}
          </h3>
          <div className="relative w-full md:w-96">
            <SearchIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`${activityVocab.customerSingular}...`}
              className="w-full bg-slate-50 rounded-lg py-3 sm:py-4 pr-14 pl-6 font-medium outline-none border-none text-right focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-500">{activityVocab.customerSingular}</th>
                <th className="p-4 text-xs font-semibold text-slate-500">{t('business.customers.phone')}</th>
                <th className="p-4 text-xs font-semibold text-slate-500">{t('business.customers.totalPurchases')}</th>
                <th className="p-4 text-xs font-semibold text-slate-500">{t('business.customers.orderCount')}</th>
                <th className="p-4 text-xs font-semibold text-slate-500">آخر زيارة</th>
                <th className="p-4 text-xs font-semibold text-slate-500 text-left">{t('business.customers.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sectionCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400 font-semibold">
                    {searchTerm ? t('business.customers.noSearchResults') : t('business.customers.noData')}
                  </td>
                </tr>
              ) : (
                sectionCustomers.map((c: any) => {
                  const lastVisitDays = c.lastVisitDays ?? (c.lastPurchaseDate ? Math.floor((Date.now() - new Date(c.lastPurchaseDate).getTime()) / (86400000)) : null);
                  const isAtRisk = lastVisitDays !== null && lastVisitDays >= 60 && lastVisitDays < 90;
                  const isChurned = lastVisitDays !== null && lastVisitDays >= 90;
                  const isTop = activeSection === 'top' || (c.totalSpent && c.orders > 3);
                  return (
                    <tr key={c.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4 flex-row-reverse">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                            isTop ? 'bg-amber-100 text-amber-600' : isChurned ? 'bg-red-100 text-red-500' : isAtRisk ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {isTop && activeSection === 'top' ? <Crown size={18} /> : c.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold">{c.name || t('business.customers.unnamed')}</p>
                            <p className="text-xs text-slate-500 font-medium">{c.email || t('business.customers.noEmail')}</p>
                            {c.convertedFromReservation && (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">{t('business.customers.convertedFromReservation')}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-900">{c.phone || '---'}</td>
                      <td className="p-4 font-semibold text-slate-900">{t('business.customers.currency')} {(c.totalSpent || 0).toLocaleString()}</td>
                      <td className="p-4 font-semibold text-slate-500">{c.orders || c.orderCount || 0} {t('business.customers.orders')}</td>
                      <td className="p-4">
                        <div>
                          {lastVisitDays !== null ? (
                            <span className={`text-xs font-semibold ${
                              isChurned ? 'text-red-500' : isAtRisk ? 'text-amber-600' : 'text-slate-500'
                            }`}>
                              {formatDays(lastVisitDays)}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">---</span>
                          )}
                          {c.firstPurchaseItem && <p className="text-xs text-slate-500">{c.firstPurchaseItem}</p>}
                        </div>
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openCustomerDetail(c.id)}
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold text-xs hover:bg-blue-600 hover:text-white transition-all"
                            title="عرض التفاصيل"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={() => sendPromotion(c.id)}
                            className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-semibold text-xs hover:bg-purple-600 hover:text-white transition-all"
                            title="إرسال عرض ترويجي"
                          >
                            <Megaphone size={12} />
                          </button>
                          <button
                            onClick={() => toggleStatus(c.id)}
                            className={`px-4 py-2.5 rounded-lg font-semibold text-xs transition-all ${
                              c.status === 'active'
                                ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                                : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'
                            }`}
                          >
                            {c.status === 'active' ? <UserMinus size={12} /> : <UserCheck size={12} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeCustomerDetail}
          />

          {/* Drawer */}
          <div className="relative ml-auto w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                  customerDetail?.stats?.isChurned ? 'bg-red-100 text-red-500' :
                  customerDetail?.stats?.isAtRisk ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {selectedCustomer?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{customerDetail?.customer?.name || selectedCustomer?.name || 'عميل'}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {customerDetail?.stats?.isChurned ? 'توقف عن الشراء' :
                     customerDetail?.stats?.isAtRisk ? 'معرض للتوقف' :
                     'عميل نشط'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCustomerDetail}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : customerDetail ? (
              <div className="p-6 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-3">
                  {customerDetail.customer?.phone && (
                    <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-sm font-semibold text-slate-700 truncate">{customerDetail.customer.phone}</span>
                    </div>
                  )}
                  {customerDetail.customer?.email && (
                    <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-sm font-semibold text-slate-700 truncate">{customerDetail.customer.email}</span>
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <ShoppingBag className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{customerDetail.stats?.totalOrders || 0}</p>
                    <p className="text-xs font-semibold text-slate-500">طلبات</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Wallet className="w-5 h-5 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{(customerDetail.stats?.totalSpent || 0).toLocaleString()}</p>
                    <p className="text-xs font-semibold text-slate-500">إجمالي الإنفاق</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{customerDetail.stats?.avgOrderValue || 0}</p>
                    <p className="text-xs font-semibold text-slate-500">متوسط الطلب</p>
                  </div>
                </div>

                {/* Spending Chart */}
                {customerDetail.monthlySpending && customerDetail.monthlySpending.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-3">الإنفاق الشهري (آخر 6 أشهر)</p>
                    <MiniBarChart data={customerDetail.monthlySpending} color="bg-blue-500" />
                    <div className="flex justify-between mt-2">
                      {customerDetail.monthlySpending.map((m: any, i: number) => (
                        <span key={i} className="text-xs text-slate-400 font-semibold">{m.month.split(' ')[0]}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Favorite Products */}
                {customerDetail.favoriteProducts && customerDetail.favoriteProducts.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-3">المنتجات المفضلة</p>
                    <div className="space-y-2">
                      {customerDetail.favoriteProducts.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                          <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                          <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-lg">{p.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order History */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-3">سجل الطلبات</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {customerDetail.orders && customerDetail.orders.length > 0 ? (
                      customerDetail.orders.map((o: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              o.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
                              o.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-600' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              <BagIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{t('business.customers.currency')} {o.total.toLocaleString()}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(o.date).toLocaleDateString(locale)} {new Date(o.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                            o.status === 'DELIVERED' ? 'bg-green-50 text-green-600' :
                            o.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600' :
                            'bg-slate-50 text-slate-500'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-4">لا يوجد طلبات</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => sendPromotion(selectedCustomer.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white bg-purple-500 hover:bg-purple-600 transition-all"
                  >
                    <Megaphone className="w-4 h-4" />
                    إرسال عرض ترويجي
                  </button>
                  <button
                    onClick={() => { toggleStatus(selectedCustomer.id); closeCustomerDetail(); }}
                    className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      selectedCustomer.status === 'active'
                        ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                        : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    {selectedCustomer.status === 'active' ? 'حظر' : 'تفعيل'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-slate-400 font-semibold">لا توجد بيانات متاحة</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersTab;
