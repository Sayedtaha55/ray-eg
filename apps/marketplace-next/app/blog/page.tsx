import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Clock, Store, PackageCheck, Zap, BarChart3, Smartphone, Shield, ArrowLeft } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'المدونة',
  description: 'مقالات ونصائح حول التجارة الإلكترونية وإدارة الأعمال',
  alternates: { canonical: '/blog' },
  openGraph: { title: 'المدونة - من مكانك', description: 'مقالات ونصائح حول التجارة الإلكترونية وإدارة الأعمال', url: '/blog', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'المدونة - من مكانك', description: 'مقالات ونصائح حول التجارة الإلكترونية وإدارة الأعمال' },
};

const blogPosts = [
  { id: 1, slug: 'start-your-online-store', title: 'ابدأ متجرك الإلكتروني', excerpt: 'دليل شامل لبدء متجرك الإلكتروني من الصفر', date: '15 يناير 2025', readTime: '5 دقائق', category: 'تجارة إلكترونية', icon: Store, catColor: 'bg-brand-cyan/10 text-cyan-600' },
  { id: 2, slug: 'inventory-management-secrets', title: 'أسرار إدارة المخزون', excerpt: 'كيفية إدارة مخزونك بكفاءة عالية', date: '20 يناير 2025', readTime: '7 دقائق', category: 'إدارة الأعمال', icon: PackageCheck, catColor: 'bg-brand-purple/10 text-purple-600' },
  { id: 3, slug: 'why-you-need-all-in-one-platform', title: 'لماذا تحتاج منصة متكاملة؟', excerpt: 'فوائد استخدام منصة واحدة لكل احتياجاتك', date: '25 يناير 2025', readTime: '4 دقائق', category: 'من مكانك', icon: Zap, catColor: 'bg-slate-100 text-slate-600' },
  { id: 4, slug: 'digital-marketing-for-merchants', title: 'التسويق الرقمي للتجار', excerpt: 'استراتيجيات التسويق الرقمي لزيادة مبيعاتك', date: '1 فبراير 2025', readTime: '6 دقائق', category: 'تسويق رقمي', icon: BarChart3, catColor: 'bg-amber-50 text-amber-700' },
  { id: 5, slug: 'mobile-first-store-design', title: 'تصميم المتجر للموبايل أولاً', excerpt: 'أهمية التصميم المتجاوب للمتاجر الإلكترونية', date: '5 فبراير 2025', readTime: '5 دقائق', category: 'تقنية', icon: Smartphone, catColor: 'bg-emerald-50 text-emerald-700' },
  { id: 6, slug: 'secure-your-store-data', title: 'حماية بيانات متجرك', excerpt: 'نصائح لحماية بيانات متجرك وعملائك', date: '10 فبراير 2025', readTime: '8 دقائق', category: 'نصائح للتجار', icon: Shield, catColor: 'bg-rose-50 text-rose-700' },
];

export default function BlogPage() {
  const blogLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'مدونة من مكانك',
    url: `${siteConfig.url}/blog`,
    description: 'مقالات ونصائح حول التجارة الإلكترونية وإدارة الأعمال',
    publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }} />
        <div className="flex items-center gap-4 mb-10 md:mb-14">
          <div className="w-12 h-12 bg-brand-cyan/10 text-brand-cyan rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter">المدونة</h1>
            <p className="text-slate-400 text-sm md:text-base font-bold mt-1">مقالات ونصائح حول التجارة والإدارة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all block"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${post.catColor}`}>{post.category}</span>
                <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-brand-cyan group-hover:bg-brand-cyan/10 flex items-center justify-center mb-4 transition-colors">
                <post.icon className="w-5 h-5" />
              </div>
              <h2 className="text-lg md:text-xl font-black mb-3 tracking-tight group-hover:text-brand-cyan transition-colors">{post.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed font-bold mb-4">{post.excerpt}</p>
              <span className="text-slate-400 text-xs font-bold">{post.date}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
