import Link from 'next/link';
import { Rocket, Globe, Calendar, History, CheckCircle, AlertCircle } from 'lucide-react';

export default async function BuilderPublishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let versions: any[] = [];
  // TODO: Replace with actual API call
  // try {
  //   versions = await getVersionHistory(id);
  // } catch {
  //   versions = [];
  // }

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">النشر</h1>
        <p className="text-slate-500 font-bold mb-8">انشر موقعك أو جددوله</p>

        {/* Publish Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-3xl bg-white border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="font-black mb-2">نشر فوري</h3>
            <p className="text-sm text-slate-500 font-bold mb-4">انشر موقعك فوراً ليكون متاحاً للجميع</p>
            <button className="w-full py-3 rounded-2xl bg-green-500 text-white font-black text-sm hover:bg-green-600 transition-all">
              نشر الآن
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-black mb-2">جدولة النشر</h3>
            <p className="text-sm text-slate-500 font-bold mb-4">حدد تاريخ ووقت نشر موقعك تلقائياً</p>
            <input type="datetime-local" className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm font-bold border border-transparent focus:border-purple-200 outline-none mb-3" />
            <button className="w-full py-3 rounded-2xl bg-purple-600 text-white font-black text-sm hover:bg-purple-700 transition-all">
              جدولة
            </button>
          </div>
        </div>

        {/* Domain Status */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="font-black">حالة النطاق</h3>
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
            <div>
              <p className="font-bold text-sm" dir="ltr">mnmknk.com/my-shop</p>
              <p className="text-xs text-slate-400 font-bold mt-1">نطاق فرعي — نشط</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <Link href="/dashboard/website/domains" className="block mt-3 text-center text-sm font-black text-blue-600 hover:underline">
            إدارة النطاقات
          </Link>
        </div>

        {/* Version History */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 p-6 border-b border-slate-100">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="font-black">سجل الإصدارات</h3>
          </div>
          {versions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all">
                  <div>
                    <span className="font-black text-sm">v{v.version}</span>
                    <span className="text-xs text-slate-400 font-bold mr-3">{new Date(v.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <button className="text-xs font-black text-blue-600 hover:underline">استعادة</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-bold">لا يوجد سجل إصدارات بعد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}