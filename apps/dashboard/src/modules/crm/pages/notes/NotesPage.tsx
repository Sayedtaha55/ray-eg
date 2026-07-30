import React, { useState } from 'react';
import { StickyNote, Plus, Search, X, Calendar, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Note = { id: string; title: string; content: string; customerName: string; date: string; color: 'yellow' | 'blue' | 'green' | 'pink' };

const COLOR_STYLES: Record<string, string> = {
  yellow: 'bg-amber-50 border-amber-200', blue: 'bg-blue-50 border-blue-200', green: 'bg-green-50 border-green-200', pink: 'bg-pink-50 border-pink-200',
};

const NotesPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', title: isArabic ? 'ملاحظة مهمة' : 'Important note', content: isArabic ? 'العميل يفضل التواصل صباحاً' : 'Customer prefers morning contact', customerName: 'Ahmed', date: '2026-07-28', color: 'yellow' },
    { id: '2', title: isArabic ? 'تذكير' : 'Reminder', content: isArabic ? 'متابعة طلب العميل' : 'Follow up on customer order', customerName: 'Sara', date: '2026-07-27', color: 'blue' },
  ]);

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الملاحظات' : 'Notes'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'ملاحظات العملاء' : 'Customer notes'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'ملاحظة جديدة' : 'New Note'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الملاحظات' : 'Total Notes', value: notes.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'هذا الأسبوع' : 'This Week', value: notes.filter(n => { const d = new Date(n.date); const w = new Date(); return d > new Date(w.getTime() - 7 * 86400000); }).length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'صفراء' : 'Yellow', value: notes.filter(n => n.color === 'yellow').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'زرقاء' : 'Blue', value: notes.filter(n => n.color === 'blue').length, color: 'bg-blue-50 text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><StickyNote size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((n) => (
          <div key={n.id} className={`p-4 rounded-2xl border-2 ${COLOR_STYLES[n.color] || COLOR_STYLES.yellow} transition-colors hover:shadow-md`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><StickyNote size={16} className="text-slate-400" /><p className="font-bold text-sm">{n.title}</p></div>
            </div>
            <p className="text-sm text-slate-600 mb-3">{n.content}</p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1"><User size={10} /> {n.customerName}</span>
              <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(n.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'ملاحظة جديدة' : 'New Note'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'العنوان' : 'Title'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'اسم العميل' : 'Customer name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <textarea placeholder={isArabic ? 'المحتوى' : 'Content'} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <div className="flex gap-2">
                {(['yellow', 'blue', 'green', 'pink'] as const).map(c => <div key={c} className={`w-8 h-8 rounded-lg border-2 ${COLOR_STYLES[c]} cursor-pointer hover:scale-110 transition-transform`} />)}
              </div>
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
