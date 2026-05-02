import React from 'react';
import { ArrowLeft, Clock, ChevronLeft } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Link, useParams } = ReactRouterDOM as any;

const categoryColorClasses: Record<string, string> = {
  'ecommerce': 'bg-[#00E5FF]/10 text-[#0097A7]',
  'businessManagement': 'bg-[#BD00FF]/10 text-[#9C27B0]',
  'mnmknk': 'bg-slate-100 text-slate-600',
  'digitalMarketing': 'bg-amber-50 text-amber-700',
  'tech': 'bg-emerald-50 text-emerald-700',
  'merchantTips': 'bg-rose-50 text-rose-700',
};

const blogPosts = [
  {
    id: 1,
    slug: 'start-your-online-store',
    titleKey: 'blog.post1.title',
    excerptKey: 'blog.post1.excerpt',
    dateKey: 'blog.post1.date',
    readTimeKey: 'blog.post1.readTime',
    categoryKey: 'ecommerce',
    contentKeys: ['blog.post1.p1', 'blog.post1.p2', 'blog.post1.p3', 'blog.post1.p4', 'blog.post1.p5', 'blog.post1.p6'],
  },
  {
    id: 2,
    slug: 'inventory-management-secrets',
    titleKey: 'blog.post2.title',
    excerptKey: 'blog.post2.excerpt',
    dateKey: 'blog.post2.date',
    readTimeKey: 'blog.post2.readTime',
    categoryKey: 'businessManagement',
    contentKeys: ['blog.post2.p1', 'blog.post2.p2', 'blog.post2.p3', 'blog.post2.p4', 'blog.post2.p5'],
  },
  {
    id: 3,
    slug: 'why-you-need-all-in-one-platform',
    titleKey: 'blog.post3.title',
    excerptKey: 'blog.post3.excerpt',
    dateKey: 'blog.post3.date',
    readTimeKey: 'blog.post3.readTime',
    categoryKey: 'mnmknk',
    contentKeys: ['blog.post3.p1', 'blog.post3.p2', 'blog.post3.p3', 'blog.post3.p4', 'blog.post3.p5', 'blog.post3.p6'],
  },
  {
    id: 4,
    slug: 'digital-marketing-for-merchants',
    titleKey: 'blog.post4.title',
    excerptKey: 'blog.post4.excerpt',
    dateKey: 'blog.post4.date',
    readTimeKey: 'blog.post4.readTime',
    categoryKey: 'digitalMarketing',
    contentKeys: ['blog.post4.p1', 'blog.post4.p2', 'blog.post4.p3', 'blog.post4.p4', 'blog.post4.p5', 'blog.post4.p6'],
  },
  {
    id: 5,
    slug: 'mobile-first-store-design',
    titleKey: 'blog.post5.title',
    excerptKey: 'blog.post5.excerpt',
    dateKey: 'blog.post5.date',
    readTimeKey: 'blog.post5.readTime',
    categoryKey: 'tech',
    contentKeys: ['blog.post5.p1', 'blog.post5.p2', 'blog.post5.p3', 'blog.post5.p4', 'blog.post5.p5', 'blog.post5.p6'],
  },
  {
    id: 6,
    slug: 'secure-your-store-data',
    titleKey: 'blog.post6.title',
    excerptKey: 'blog.post6.excerpt',
    dateKey: 'blog.post6.date',
    readTimeKey: 'blog.post6.readTime',
    categoryKey: 'merchantTips',
    contentKeys: ['blog.post6.p1', 'blog.post6.p2', 'blog.post6.p3', 'blog.post6.p4', 'blog.post6.p5', 'blog.post6.p6'],
  },
];

const BlogPostPage: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center text-right" dir="rtl">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-4">{t('blog.notFound')}</h1>
          <Link to="/blog" className="text-[#0097A7] font-bold">{t('blog.backToBlog')}</Link>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-right" dir="rtl">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 md:py-24">
        <Link to="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          {t('blog.backToBlog')}
        </Link>

        <article>
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColorClasses[post.categoryKey] || 'bg-slate-100 text-slate-600'}`}>
                {t('blog.categories.' + post.categoryKey)}
              </span>
              <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t(post.readTimeKey)}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4">{t(post.titleKey)}</h1>
            <p className="text-slate-400 text-sm font-medium">{t(post.dateKey)}</p>
          </header>

          <div className="prose prose-slate max-w-none">
            {post.contentKeys.map((key, idx) => (
              <p key={idx} className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">
                {t(key)}
              </p>
            ))}
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200">
            <h2 className="text-xl font-black text-slate-900 mb-6">{t('blog.relatedPosts')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/blog/${rp.slug}`}
                  className="bg-white rounded-xl p-4 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all"
                >
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${categoryColorClasses[rp.categoryKey] || 'bg-slate-100 text-slate-600'}`}>
                    {t('blog.categories.' + rp.categoryKey)}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">{t(rp.titleKey)}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/business"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors"
          >
            {t('blog.backToBusiness')}
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
