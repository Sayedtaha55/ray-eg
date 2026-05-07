'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Eye, MousePointer } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

export default function PortalDashboardPage() {
  const t = useT();
  const router = useRouter();
  const { dir } = useLocale();
  const [owner, setOwner] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('portal_token');
        if (!token) { router.replace('/portal/login'); return; }
        const [meRes, listRes] = await Promise.all([
          clientFetch<any>('/v1/portal/me'),
          clientFetch<any[]>('/v1/portal/listings'),
        ]);
        setOwner(meRes);
        const list = Array.isArray(listRes) ? listRes : [];
        setListings(list);

        let views = 0, clicks = 0;
        const top5 = list.slice(0, 5);
        const analyticsResults = await Promise.all(top5.map((l: any) => clientFetch<any>(`/v1/portal/listings/${l.id}/analytics?days=30`).catch(() => null)));
        for (const a of analyticsResults) {
          if (!a) continue;
          views += (a.byType?.LISTING_VIEW || 0);
          clicks += (a.byType?.WEBSITE_CLICK || 0) + (a.byType?.WHATSAPP_CLICK || 0) + (a.byType?.PHONE_CLICK || 0) + (a.byType?.DIRECTIONS_CLICK || 0);
        }
        setTotalViews(views);
        setTotalClicks(clicks);
      } catch {
        router.replace('/portal/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = { APPROVED: 'bg-green-100 text-green-700', PENDING: 'bg-yellow-100 text-yellow-700', REJECTED: 'bg-red-100 text-red-700', SUSPENDED: 'bg-gray-100 text-gray-600' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.PENDING}`}>{t(`portal.listings.${status.toLowerCase()}`, status)}</span>;
  };

  return (
    <div dir={dir} className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {owner?.name ? t('portal.dashboard.welcome', 'مرحباً {{name}}').replace('{{name}}', owner.name) : t('portal.dashboard.welcomeEmail', 'مرحباً').replace('{{email}}', owner?.email || '')}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{owner?.email || owner?.phone || ''}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500">{t('portal.dashboard.totalListings', 'إجمالي القوائم')}</p>
              <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Eye className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-gray-500">{t('portal.dashboard.totalViews', 'إجمالي المشاهدات')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><MousePointer className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-sm text-gray-500">{t('portal.dashboard.totalClicks', 'إجمالي النقرات')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalClicks}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('portal.dashboard.quickActions', 'إجراءات سريعة')}</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/portal/listings" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">{t('portal.dashboard.editListing', 'تعديل القوائم')}</Link>
          <Link href="/portal/analytics" className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100">{t('portal.dashboard.viewAnalytics', 'التحليلات')}</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t('portal.layout.listings', 'القوائم')}</h2>
          <Link href="/portal/listings" className="text-sm text-blue-600 hover:text-blue-800 font-medium">{t('portal.listings.edit', 'تعديل')} →</Link>
        </div>
        {listings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">{t('portal.dashboard.noListings', 'لا توجد قوائم')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('portal.dashboard.claimFirst', 'أضف قائمتك الأولى')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t('portal.edit.titleField', 'العنوان')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('portal.listings.status', 'الحالة')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('portal.listings.branches', 'الفروع')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('portal.listings.views', 'المشاهدات')}</th>
                  <th className="px-4 py-3 text-start font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{l.title}</td>
                    <td className="px-4 py-3">{statusBadge(l.status)}</td>
                    <td className="px-4 py-3 text-gray-600">{l.branches?.length || 0}</td>
                    <td className="px-4 py-3 text-gray-600">{l._count?.analyticsEvents || 0}</td>
                    <td className="px-4 py-3">
                      <Link href={`/portal/listings/${l.id}/branches`} className="text-blue-600 hover:text-blue-800 font-medium">{t('portal.listings.edit', 'تعديل')}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
