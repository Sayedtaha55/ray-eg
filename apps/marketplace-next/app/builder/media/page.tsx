import { Metadata } from 'next';
import { Upload, Image as ImageIcon, Trash2, Search } from 'lucide-react';
import { getMediaAssets } from '@/lib/platform/services';

export const metadata: Metadata = {
  title: 'مكتبة الوسائط',
  robots: { index: false, follow: false },
};

export default async function MediaLibraryPage() {
  let assets: any[] = [];
  try {
    assets = await getMediaAssets('current');
  } catch {
    assets = [];
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-black py-8 md:py-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">مكتبة الوسائط</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">أدر صور وملفات موقعك</p>
          </div>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-gradient text-white font-black text-sm hover:shadow-glow-cyan transition-all">
            <Upload className="w-5 h-5" />
            رفع ملف
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <input
            type="text"
            placeholder="بحث في الوسائط..."
            className="w-full bg-white dark:bg-slate-900/50 rounded-2xl py-3 pr-12 pl-4 font-bold text-sm border border-slate-100 dark:border-slate-800 focus:border-brand-cyan/20 outline-none"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>

        {/* Assets Grid */}
        {assets.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="group relative aspect-square rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 overflow-hidden">
                {asset.type === 'image' && asset.url ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition-all">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-white font-bold truncate">{asset.name}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center">
            <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="font-black text-lg mb-2">لا توجد ملفات</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-6">ارفع أول ملف لبدء استخدام مكتبة الوسائط</p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-gradient text-white font-black text-sm hover:shadow-glow-cyan transition-all">
              <Upload className="w-5 h-5" />
              رفع ملف
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
