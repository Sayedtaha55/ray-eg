import { Metadata } from 'next';
import Link from 'next/link';
import { Palette, Check, Sun, Moon } from 'lucide-react';
import { getThemes } from '@/lib/platform/services';

export const metadata: Metadata = {
  title: 'مكتبة الثيمات',
  description: 'اختر ثيماً لألوان وتصميم موقعك',
  alternates: { canonical: '/builder/themes' },
};

const fallbackThemes = [
  { id: 'th1', name: 'سماوي', isDark: false, category: 'modern', isPremium: false, designTokens: { colors: { primary: '#00E5FF', secondary: '#BD00FF', background: '#FFFFFF' } } },
  { id: 'th2', name: 'داكن', isDark: true, category: 'dark', isPremium: false, designTokens: { colors: { primary: '#00E5FF', secondary: '#BD00FF', background: '#0A0A0A' } } },
  { id: 'th3', name: 'ذهبي فاخر', isDark: true, category: 'luxury', isPremium: true, designTokens: { colors: { primary: '#D4AF37', secondary: '#1A1A1A', background: '#0A0A0A' } } },
  { id: 'th4', name: 'أبيض نقي', isDark: false, category: 'minimal', isPremium: false, designTokens: { colors: { primary: '#000000', secondary: '#64748B', background: '#FFFFFF' } } },
  { id: 'th5', name: 'زجاجي', isDark: false, category: 'glass', isPremium: false, designTokens: { colors: { primary: '#00E5FF', secondary: '#BD00FF', background: '#F0F4F8' } } },
  { id: 'th6', name: 'ملكي', isDark: false, category: 'elegant', isPremium: true, designTokens: { colors: { primary: '#7C3AED', secondary: '#0F172A', background: '#FAFAFA' } } },
  { id: 'th7', name: 'مؤسسي', isDark: false, category: 'corporate', isPremium: false, designTokens: { colors: { primary: '#2563EB', secondary: '#1E40AF', background: '#FFFFFF' } } },
  { id: 'th8', name: 'مرح', isDark: false, category: 'playful', isPremium: false, designTokens: { colors: { primary: '#F59E0B', secondary: '#EF4444', background: '#FFFBEB' } } },
];

export default async function ThemesPage() {
  let themes = fallbackThemes;
  try {
    const fetched = await getThemes();
    if (fetched && fetched.length > 0) themes = fetched as any;
  } catch {
    // use fallback
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-black py-8 md:py-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">مكتبة الثيمات</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold">اختر ثيماً لألوان وتصميم موقعك</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {themes.map((theme, i) => {
            const colors = (theme as any).designTokens?.colors || {};
            return (
              <div
                key={theme.id}
                className="group rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-brand hover:border-brand-cyan/20 transition-all animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Preview */}
                <div
                  className="aspect-video relative overflow-hidden p-4 flex flex-col justify-between"
                  style={{ backgroundColor: colors.background || '#FFFFFF' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: colors.primary || '#00E5FF' }} />
                    <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: colors.secondary || '#BD00FF', opacity: 0.3 }} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: colors.primary || '#00E5FF', opacity: 0.5 }} />
                    <div className="h-2 rounded-full w-1/2" style={{ backgroundColor: colors.secondary || '#BD00FF', opacity: 0.3 }} />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-lg" style={{ backgroundColor: colors.primary || '#00E5FF' }} />
                    <div className="h-6 w-12 rounded-lg border" style={{ borderColor: colors.secondary || '#BD00FF' }} />
                  </div>
                  {theme.isDark && (
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/30 backdrop-blur flex items-center justify-center">
                      <Moon className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  {!theme.isDark && (
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/50 backdrop-blur flex items-center justify-center">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                  )}
                  {theme.isPremium && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-black">
                      مميز
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4 flex items-center justify-between">
                  <h3 className="font-black text-sm">{theme.name}</h3>
                  <Link
                    href={`/builder/apply-theme?theme=${theme.id}`}
                    className="w-8 h-8 rounded-xl bg-brand-cyan/10 flex items-center justify-center hover:bg-brand-cyan/20 transition-all"
                  >
                    <Check className="w-4 h-4 text-brand-cyan" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
