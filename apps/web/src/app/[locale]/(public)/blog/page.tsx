'use client';

import Link from 'next/link';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';

const BLOG_POSTS = [
  {
    slug: 'welcome-to-ray',
    title: 'Welcome to Ray — Your Local Business Guide',
    excerpt: 'Discover how Ray connects you with the best local businesses, offers, and services in your area.',
    date: '2025-01-15',
    category: 'Announcements',
    readTime: '3 min',
  },
  {
    slug: 'how-to-get-best-deals',
    title: 'How to Get the Best Deals on Ray',
    excerpt: 'Tips and tricks for finding the best offers and discounts from shops near you.',
    date: '2025-01-20',
    category: 'Tips',
    readTime: '4 min',
  },
  {
    slug: 'merchant-guide',
    title: 'Merchant Guide: Setting Up Your Online Store',
    excerpt: 'A step-by-step guide for merchants to create and manage their store on Ray.',
    date: '2025-02-01',
    category: 'Guides',
    readTime: '6 min',
  },
  {
    slug: 'delivery-explained',
    title: 'How Delivery Works on Ray',
    excerpt: 'Everything you need to know about placing orders and getting them delivered to your door.',
    date: '2025-02-10',
    category: 'Guides',
    readTime: '5 min',
  },
  {
    slug: 'map-listings',
    title: 'Add Your Business to the Ray Map',
    excerpt: 'Learn how to list your business on our interactive map for free and reach more customers.',
    date: '2025-02-20',
    category: 'Tips',
    readTime: '3 min',
  },
  {
    slug: 'courier-program',
    title: 'Join Our Courier Program',
    excerpt: 'Earn money on your schedule by delivering orders for local businesses in your area.',
    date: '2025-03-01',
    category: 'Announcements',
    readTime: '4 min',
  },
];

export default function BlogPage() {
  const t = useT();
  const { locale, dir } = useLocale();
  const isRtl = dir === 'rtl';

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8" dir={dir}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF]" />
            <BookOpen className="relative z-10 text-white" size={28} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">{t('blog.title', 'Blog')}</h1>
          <p className="text-slate-400 font-bold text-sm mt-2">{t('blog.subtitle', 'News, tips, and guides from the Ray team')}</p>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/${locale}/blog/${post.slug}`}
              className="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all"
            >
              <div className="p-6 sm:p-8">
                <div className={`flex items-center gap-2 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] font-black bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-0.5 rounded-full">{post.category}</span>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Calendar size={10} /> {post.date}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300">{post.readTime}</span>
                </div>
                <h2 className="text-lg font-black mb-2 group-hover:text-[#00E5FF] transition-colors">{post.title}</h2>
                <p className="text-slate-400 font-bold text-sm line-clamp-2">{post.excerpt}</p>
                <div className={`flex items-center gap-1 mt-4 text-[#00E5FF] font-black text-xs ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {t('blog.readMore', 'Read More')} <ArrowRight size={12} className={isRtl ? 'rotate-180' : ''} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
