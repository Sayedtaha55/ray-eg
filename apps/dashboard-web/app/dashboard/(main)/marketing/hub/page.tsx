'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Megaphone, RefreshCw, Info, X, Download, TrendingUp, TrendingDown,
  Mail, MessageSquare, Bell, Tag, CalendarHeart, Percent, Users,
  Eye, MousePointerClick, DollarSign, ArrowLeft, Activity, Target,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import Link from 'next/link';

type Campaign = {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'push' | 'coupon' | 'seasonal' | 'discount';
  status: 'active' | 'scheduled' | 'paused' | 'ended';
  sentCount: number;
  openCount: number;
  clickCount: number;
  revenue: number;
  startDate: string;
  endDate: string;
};

type HubData = {
  totalCampaigns: number;
  activeCampaigns: number;
  totalReach: number;
  totalEngagement: number;
  totalRevenue: number;
  avgROI: number;
  campaigns: Campaign[];
  channelStats: { channel: string; count: number; reach: number; revenue: number }[];
};

const CHANNEL_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; href: string }> = {
  email: { label: 'إيميل', icon: <Mail size={18} />, color: 'bg-blue-50 text-blue-600', href: '/dashboard/marketing/email-campaigns' },
  sms: { label: 'SMS', icon: <MessageSquare size={18} />, color: 'bg-green-50 text-green-600', href: '/dashboard/marketing/sms-campaigns' },
  push: { label: 'إشعار فوري', icon: <Bell size={18} />, color: 'bg-purple-50 text-purple-600', href: '/dashboard/marketing/push-notifications' },
  coupon: { label: 'كوبون', icon: <Tag size={18} />, color: 'bg-amber-50 text-amber-600', href: '/dashboard/marketing/coupons' },
  seasonal: { label: 'عرض موسمي', icon: <CalendarHeart size={18} />, color: 'bg-pink-50 text-pink-600', href: '/dashboard/marketing/seasonal-offers' },
  discount: { label: 'خصم', icon: <Percent size={18} />, color: 'bg-cyan-50 text-cyan-600', href: '/dashboard/marketing/discounts' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'نشط', color: 'bg-green-50 text-green-700' },
  scheduled: { label: 'مجدول', color: 'bg-blue-50 text-blue-700' },
  paused: { label: 'متوقف', color: 'bg-amber-50 text-amber-700' },
  ended: { label: 'منتهي', color: 'bg-slate-50 text-slate-600' },
};

export default function MarketingHubPage() {
  const [data, setData] = useState<HubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/marketing/hub/shop/${sid}`);
      setData({
        totalCampaigns: Number(res?.totalCampaigns ?? 0),
        activeCampaigns: Number(res?.activeCampaigns ?? 0),
        totalReach: Number(res?.totalReach ?? 0),
        totalEngagement: Number(res?.totalEngagement ?? 0),
        totalRevenue: Number(res?.totalRevenue ?? 0),
        avgROI: Number(res?.avgROI ?? 0),
        campaigns: (res?.campaigns || []).map((c: any) => ({
          id: String(c.id),
          name: c.name || '---',
          channel: c.channel || 'email',
          status: c.status || 'active',
          sentCount: Number(c.sentCount ?? 0),
          openCount: Number(c.openCount ?? 0),
          clickCount: Number(c.clickCount ?? 0),
          revenue: Number(c.revenue ?? 0),
          startDate: c.startDate || new Date().toISOString(),
          endDate: c.endDate || '',
        })),
        channelStats: (res?.channelStats || []).map((cs: any) => ({
          channel: cs.channel || 'email',
          count: Number(cs.count ?? 0),
          reach: Number(cs.reach ?? 0),
          revenue: Number(cs.revenue ?? 0),
        })),
      });
    } catch { setData(null); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const exportCSV = useCallback(() => {
    if (!data) return;
    const headers = ['Campaign', 'Channel', 'Status', 'Sent', 'Opened', 'Clicked', 'Revenue', 'Start Date', 'End Date'];
    const rows = data.campaigns.map(c => [c.name, c.channel, c.status, c.sentCount, c.openCount, c.clickCount, c.revenue, c.startDate, c.endDate]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'marketing-hub.csv';
    link.click();
  }, [data]);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'إجمالي الحملات', value: data.totalCampaigns, icon: Megaphone, color: 'bg-blue-50 text-blue-600' },
      { label: 'حملات نشطة', value: data.activeCampaigns, icon: Activity, color: 'bg-green-50 text-green-600' },
      { label: 'إجمالي الوصول', value: data.totalReach.toLocaleString(), icon: Users, color: 'bg-purple-50 text-purple-600' },
      { label: 'التفاعل', value: data.totalEngagement.toLocaleString(), icon: Target, color: 'bg-amber-50 text-amber-600' },
      { label: 'الإيرادات', value: `${data.totalRevenue.toLocaleString()} ج.م`, icon: DollarSign, color: 'bg-cyan-50 text-cyan-600' },
      { label: 'متوسط ROI', value: `${data.avgROI.toFixed(1)}%`, icon: data.avgROI >= 0 ? TrendingUp : TrendingDown, color: data.avgROI >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700' },
    ];
  }, [data]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Megaphone size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">مركز التسويق</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">لوحة تحكم موحدة لجميع أدوات التسويق والحملات</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => loadData()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
          <RefreshCw size={18} /> تحديث
        </button>
        <button onClick={exportCSV} disabled={!data} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50">
          <Download size={18} /> تصدير CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Megaphone size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد بيانات تسويقية حالياً</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
                <div className={`p-2 rounded-xl ${s.color}`}><s.icon size={20} /></div>
                <div className="min-w-0"><p className="text-xs font-bold text-slate-400 truncate">{s.label}</p><p className="text-sm font-black text-slate-900 truncate">{s.value}</p></div>
              </div>
            ))}
          </div>

          {/* Channel Cards */}
          <div>
            <h2 className="font-bold text-slate-900 text-sm mb-3">قنوات التسويق</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(CHANNEL_CONFIG).map(([key, config]) => {
                const channelStat = data.channelStats.find(cs => cs.channel === key);
                return (
                  <Link key={key} href={config.href} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 bg-white hover:border-[#00E5FF] hover:shadow-md transition-all">
                    <div className={`p-3 rounded-xl ${config.color}`}>{config.icon}</div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900 text-xs">{config.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{channelStat ? `${channelStat.count} حملة` : '0 حملة'}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Channel Performance */}
          {data.channelStats.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 text-sm mb-4">أداء القنوات</h2>
              <div className="space-y-3">
                {data.channelStats.map((cs, i) => {
                  const config = CHANNEL_CONFIG[cs.channel] || CHANNEL_CONFIG.email;
                  const maxRevenue = Math.max(...data.channelStats.map(c => c.revenue), 1);
                  const widthPct = (cs.revenue / maxRevenue) * 100;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.color} shrink-0`}>{config.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-700">{config.label}</span>
                          <span className="text-xs font-bold text-slate-900">{cs.revenue.toLocaleString()} ج.م</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00E5FF] rounded-full transition-all" style={{ width: `${Math.max(widthPct, 2)}%` }} />
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 shrink-0 w-16 text-left">{cs.reach.toLocaleString()} وصول</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Campaigns */}
          <div>
            <h2 className="font-bold text-slate-900 text-sm mb-3">الحملات</h2>
            {data.campaigns.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <Megaphone size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-slate-400 font-bold text-sm">لا توجد حملات حالياً</p>
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="space-y-3 md:hidden">
                  {data.campaigns.slice(0, 10).map((c) => {
                    const config = CHANNEL_CONFIG[c.channel] || CHANNEL_CONFIG.email;
                    const statusConfig = STATUS_CONFIG[c.status] || STATUS_CONFIG.active;
                    return (
                      <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`p-1.5 rounded-lg ${config.color} shrink-0`}>{config.icon}</div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-sm truncate">{c.name}</div>
                              <div className="text-xs text-slate-400">{config.label}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ${statusConfig.color}`}>{statusConfig.label}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          <div className="text-center"><div className="text-[10px] text-slate-400">وصلت</div><div className="text-xs font-bold text-slate-700">{c.sentCount}</div></div>
                          <div className="text-center"><div className="text-[10px] text-slate-400">فتحت</div><div className="text-xs font-bold text-slate-700">{c.openCount}</div></div>
                          <div className="text-center"><div className="text-[10px] text-slate-400">نقرت</div><div className="text-xs font-bold text-slate-700">{c.clickCount}</div></div>
                          <div className="text-center"><div className="text-[10px] text-slate-400">إيراد</div><div className="text-xs font-bold text-green-600">{c.revenue.toLocaleString()}</div></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto touch-auto">
                  <table className="w-full text-right border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 text-xs font-semibold text-slate-500">الحملة</th>
                        <th className="p-4 text-xs font-semibold text-slate-500">القناة</th>
                        <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                        <th className="p-4 text-xs font-semibold text-slate-500">وصلت</th>
                        <th className="p-4 text-xs font-semibold text-slate-500">فتحت</th>
                        <th className="p-4 text-xs font-semibold text-slate-500">نقرت</th>
                        <th className="p-4 text-xs font-semibold text-slate-500">الإيرادات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.campaigns.slice(0, 15).map((c) => {
                        const config = CHANNEL_CONFIG[c.channel] || CHANNEL_CONFIG.email;
                        const statusConfig = STATUS_CONFIG[c.status] || STATUS_CONFIG.active;
                        return (
                          <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="p-4"><div className="font-bold text-slate-900 text-sm">{c.name}</div></td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${config.color}`}>{config.icon} {config.label}</span>
                            </td>
                            <td className="p-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusConfig.color}`}>{statusConfig.label}</span></td>
                            <td className="p-4"><div className="text-slate-600 text-sm">{c.sentCount.toLocaleString()}</div></td>
                            <td className="p-4"><div className="text-slate-600 text-sm">{c.openCount.toLocaleString()}</div></td>
                            <td className="p-4"><div className="text-slate-600 text-sm">{c.clickCount.toLocaleString()}</div></td>
                            <td className="p-4"><div className="font-bold text-green-600 text-sm">{c.revenue.toLocaleString()} ج.م</div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Guide Modal */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل مركز التسويق</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">لوحة تحكم موحدة لجميع أدوات التسويق والحملات في مكان واحد.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Megaphone size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• نظرة عامة على جميع الحملات النشطة</li>
                  <li>• إحصائيات موحدة لكل القنوات</li>
                  <li>• إنشاء حملة جديدة بنقرة واحدة</li>
                  <li>• تتبع أداء الحملات في الوقت الفعلي</li>
                  <li>• تقارير ROI لكل قناة تسويقية</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Target size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">القنوات المتاحة</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إيميل • SMS • إشعارات فورية</li>
                  <li>• كوبونات • عروض موسمية • خصومات</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
