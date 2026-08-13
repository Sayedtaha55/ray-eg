import Link from 'next/link';
import { Check, Star, Download, Eye } from 'lucide-react';

const categories = [
  { id: 'all', label: 'الكل' },
  { id: 'restaurant', label: 'مطاعم' },
  { id: 'clinic', label: 'عيادات' },
  { id: 'retail', label: 'تجزئة' },
  { id: 'beauty', label: 'تجميل' },
  { id: 'professional', label: 'خدمات' },
  { id: 'ecommerce', label: 'متاجر' },
  { id: 'landing-page', label: 'صفحات هبوط' },
];

const fallbackTemplates = [
  { id: 't1', name: 'مطعم عصري', slug: 'modern-restaurant', category: 'restaurant', thumbnail: '', isPremium: false, rating: 4.8, downloadCount: 1200 },
  { id: 't2', name: 'عيادة طبية', slug: 'medical-clinic', category: 'clinic', thumbnail: '', isPremium: false, rating: 4.9, downloadCount: 980 },
  { id: 't3', name: 'متجر فاخر', slug: 'luxury-store', category: 'retail', thumbnail: '', isPremium: true, rating: 4.7, downloadCount: 750 },
  { id: 't4', name: 'صالون تجميل', slug: 'beauty-salon', category: 'beauty', thumbnail: '', isPremium: false, rating: 4.6, downloadCount: 650 },
  { id: 't5', name: 'خدمات احترافية', slug: 'professional-services', category: 'professional', thumbnail: '', isPremium: true, rating: 4.8, downloadCount: 520 },
  { id: 't6', name: 'متجر إلكتروني', slug: 'ecommerce-shop', category: 'ecommerce', thumbnail: '', isPremium: false, rating: 4.9, downloadCount: 2100 },
  { id: 't7', name: 'صفحة هبوط', slug: 'landing-page', category: 'landing-page', thumbnail: '', isPremium: false, rating: 4.5, downloadCount: 1800 },
  { id: 't8', name: 'مطعم فاخر', slug: 'luxury-restaurant', category: 'restaurant', thumbnail: '', isPremium: true, rating: 4.9, downloadCount: 450 },
];

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const activeCategory = category || 'all';

  let templates = fallbackTemplates;
  // TODO: Replace with actual API call
  // try {
  //   const fetched = await getTemplates(activeCategory !== 'all' ? activeCategory : undefined);
  //   if (fetched && fetched.length > 0) templates = fetched;
  // } catch {
  //   // use fallback
  // }

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">القوالب</h1>
          <p className="text-slate-500 font-bold">اختر قالباً جاهزاً لبدء موقعك</p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/dashboard/website/templates${cat.id !== 'all' ? `?category=${cat.id}` : ''}`}
              className={`px-4 py-2 rounded-full text-sm font-black transition-all ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((tpl, i) => (
            <div
              key={tpl.id}
              className="group rounded-3xl bg-white border border-slate-100 overflow-hidden hover:shadow-md hover:border-slate-200 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
                {tpl.thumbnail ? (
                  <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-black text-slate-300">{tpl.name.charAt(0)}</span>
                  </div>
                )}
                {tpl.isPremium && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-black">
                    مميز
                  </div>
                )}
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Link href={`/dashboard/commercial/builder?template=${tpl.id}`} className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-all" title="معاينة">
                    <Eye className="w-5 h-5 text-white" />
                  </Link>
                  <Link href={`/dashboard/website/create?template=${tpl.slug}`} className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-slate-800 transition-all" title="استخدام">
                    <Check className="w-5 h-5 text-white" />
                  </Link>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="font-black text-sm mb-2 truncate">{tpl.name}</h3>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {tpl.rating}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 font-bold">
                    <Download className="w-3.5 h-3.5" />
                    {tpl.downloadCount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}