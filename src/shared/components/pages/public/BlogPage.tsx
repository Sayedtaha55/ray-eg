import React, { useState } from 'react';
import { BookOpen, ArrowLeft, Clock, Tag, ChevronLeft, Store, PackageCheck, BarChart3, Smartphone, Shield, Zap } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Link } = ReactRouterDOM as any;

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
    icon: <Store className="w-5 h-5" />,
  },
  {
    id: 2,
    slug: 'inventory-management-secrets',
    titleKey: 'blog.post2.title',
    excerptKey: 'blog.post2.excerpt',
    dateKey: 'blog.post2.date',
    readTimeKey: 'blog.post2.readTime',
    categoryKey: 'businessManagement',
    icon: <PackageCheck className="w-5 h-5" />,
  },
  {
    id: 3,
    slug: 'why-you-need-all-in-one-platform',
    titleKey: 'blog.post3.title',
    excerptKey: 'blog.post3.excerpt',
    dateKey: 'blog.post3.date',
    readTimeKey: 'blog.post3.readTime',
    categoryKey: 'mnmknk',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 4,
    slug: 'digital-marketing-for-merchants',
    titleKey: 'blog.post4.title',
    excerptKey: 'blog.post4.excerpt',
    dateKey: 'blog.post4.date',
    readTimeKey: 'blog.post4.readTime',
    categoryKey: 'digitalMarketing',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: 5,
    slug: 'mobile-first-store-design',
    titleKey: 'blog.post5.title',
    excerptKey: 'blog.post5.excerpt',
    dateKey: 'blog.post5.date',
    readTimeKey: 'blog.post5.readTime',
    categoryKey: 'tech',
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    id: 6,
    slug: 'secure-your-store-data',
    titleKey: 'blog.post6.title',
    excerptKey: 'blog.post6.excerpt',
    dateKey: 'blog.post6.date',
    readTimeKey: 'blog.post6.readTime',
    categoryKey: 'merchantTips',
    icon: <Shield className="w-5 h-5" />,
  },
];

const BlogPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = [...new Set(blogPosts.map((p) => p.categoryKey))];
  const filtered = selectedCategory ? blogPosts.filter((p) => p.categoryKey === selectedCategory) : blogPosts;

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-right" dir="rtl">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-16 md:py-24">
        <div className="flex items-center gap-4 mb-10 md:mb-14">
          <div className="w-12 h-12 bg-[#00E5FF]/10 text-[#0097A7] rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900">{t('blog.pageTitle')}</h1>
            <p className="text-slate-400 text-sm md:text-base font-medium mt-1">{t('blog.pageSubtitle')}</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${!selectedCategory ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
          >
            {t('blog.allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
            >
              {t('blog.categories.' + cat)}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl p-6 md:p-8 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all block"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColorClasses[post.categoryKey] || 'bg-slate-100 text-slate-600'}`}>
                  {t('blog.categories.' + post.categoryKey)}
                </span>
                <span className="text-slate-300 text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t(post.readTimeKey)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:text-[#0097A7] group-hover:bg-[#00E5FF]/10 flex items-center justify-center mb-4 transition-colors">
                {post.icon}
              </div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-[#0097A7] transition-colors">{t(post.titleKey)}</h2>
              <p className="text-slate-400 text-sm leading-relaxed font-medium mb-4">{t(post.excerptKey)}</p>
              <span className="text-slate-400 text-xs font-medium">{t(post.dateKey)}</span>
            </Link>
          ))}
        </div>

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

export default BlogPage;
