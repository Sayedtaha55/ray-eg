'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, BookOpen, ChevronRight } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';

const BLOG_POSTS: Record<string, {
  title: string;
  date: string;
  category: string;
  readTime: string;
  content: string[];
}> = {
  'welcome-to-ray': {
    title: 'Welcome to Ray — Your Local Business Guide',
    date: '2025-01-15',
    category: 'Announcements',
    readTime: '3 min',
    content: [
      'Ray is your go-to platform for discovering the best local businesses, offers, and services in your area. Whether you\'re looking for a nearby restaurant, a pharmacy, or the latest fashion deals, Ray has you covered.',
      'Our mission is simple: connect people with the businesses around them. We believe that local businesses are the backbone of every community, and we want to make it easier than ever to find and support them.',
      'With Ray, you can browse shops by category, explore interactive maps, discover exclusive offers, and order products for delivery — all from one app.',
      'We\'re just getting started, and we\'re excited to have you along for the ride. Stay tuned for more features and improvements!',
    ],
  },
  'how-to-get-best-deals': {
    title: 'How to Get the Best Deals on Ray',
    date: '2025-01-20',
    category: 'Tips',
    readTime: '4 min',
    content: [
      'Everyone loves a good deal, and Ray makes it easy to find them. Here are some tips to help you save money while shopping locally:',
      '1. Check the Offers section regularly — new deals are added daily from shops in your area.',
      '2. Use the category filters to quickly find deals on the products you care about most.',
      '3. Follow your favorite shops to get notified when they post new offers.',
      '4. Take advantage of cash on delivery (COD) — no need to pay online, just pay when your order arrives.',
      '5. Compare prices across different shops before placing your order to make sure you\'re getting the best price.',
      'Happy shopping!',
    ],
  },
  'merchant-guide': {
    title: 'Merchant Guide: Setting Up Your Online Store',
    date: '2025-02-01',
    category: 'Guides',
    readTime: '6 min',
    content: [
      'Setting up your online store on Ray is quick and easy. Here\'s a step-by-step guide to get you started:',
      'Step 1: Sign up as a merchant. Visit the signup page and select the "Business" tab. Fill in your shop details including name, category, and location.',
      'Step 2: Complete the onboarding wizard. Choose your business activity type and select the modules you want to enable (e.g., products, offers, bookings).',
      'Step 3: Customize your storefront. Upload your logo and banner, set your shop colors, and configure your layout using the PageBuilder.',
      'Step 4: Add your products. Use the product manager to add items with images, prices, and descriptions.',
      'Step 5: Set delivery fees. Configure delivery fees based on your location and preferences.',
      'Step 6: Go live! Once your shop is set up, it will appear on the map and in search results.',
    ],
  },
  'delivery-explained': {
    title: 'How Delivery Works on Ray',
    date: '2025-02-10',
    category: 'Guides',
    readTime: '5 min',
    content: [
      'Ordering from Ray is simple and convenient. Here\'s how the delivery process works:',
      '1. Browse and add items to your cart from any shop on the platform.',
      '2. When you\'re ready, click "Next" to proceed to checkout.',
      '3. Provide your delivery location — you can use the map to pin your exact location or type your address manually.',
      '4. Enter your phone number and any delivery notes (e.g., floor number, apartment).',
      '5. Choose Cash on Delivery (COD) as your payment method.',
      '6. Confirm your order. You\'ll receive a notification when the shop accepts it.',
      '7. A courier will pick up your order and deliver it to your location. You pay when you receive it!',
      'Currently, we support cash on delivery. Online payment options are coming soon.',
    ],
  },
  'map-listings': {
    title: 'Add Your Business to the Ray Map',
    date: '2025-02-20',
    category: 'Tips',
    readTime: '3 min',
    content: [
      'Want more customers to find your business? Add it to the Ray map for free!',
      'Simply go to the "Add Your Business" page, fill in your business name, category, and contact info, then pin your location on the map. Your listing will be reviewed by our team and appear on the map within 1-2 business days.',
      'Being on the map means customers in your area can discover you when they search or browse the map. It\'s the easiest way to increase your visibility without spending a penny.',
      'If you want even more features — like adding products, offers, and a full storefront — consider signing up as a merchant for a complete online store.',
    ],
  },
  'courier-program': {
    title: 'Join Our Courier Program',
    date: '2025-03-01',
    category: 'Announcements',
    readTime: '4 min',
    content: [
      'We\'re excited to announce the Ray Courier Program! If you\'re looking for a flexible way to earn money, this is for you.',
      'As a Ray courier, you\'ll deliver orders from local shops to customers in your area. You choose when you want to work — full-time, part-time, or just on weekends.',
      'Here\'s how it works: When a customer places an order from a nearby shop, you\'ll receive a delivery offer in the app. You can accept or decline it. Once accepted, you pick up the order from the shop and deliver it to the customer.',
      'You\'ll earn money for every successful delivery, plus bonuses during peak hours. All deliveries are tracked in-app for your safety and peace of mind.',
      'Ready to get started? Visit the courier page to apply. Approval usually takes 1-2 business days.',
    ],
  },
};

export default function BlogPostPage() {
  const t = useT();
  const { locale, dir } = useLocale();
  const isRtl = dir === 'rtl';
  const params = useParams();
  const slug = String(params?.slug || '');

  const post = BLOG_POSTS[slug];

  if (!post) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-20 text-center" dir={dir}>
        <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
        <h1 className="text-2xl font-black mb-2">{t('blog.notFound', 'Post Not Found')}</h1>
        <p className="text-slate-400 font-bold text-sm mb-6">{t('blog.notFoundDesc', 'This blog post doesn\'t exist.')}</p>
        <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-2xl">
          <ArrowLeft size={16} /> {t('blog.backToBlog', 'Back to Blog')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8" dir={dir}>
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link href={`/${locale}/blog`} className={`inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <ArrowLeft size={14} className={isRtl ? 'rotate-180' : ''} />
          {t('blog.backToBlog', 'Back to Blog')}
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className={`flex items-center gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] font-black bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-0.5 rounded-full">{post.category}</span>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Calendar size={10} /> {post.date}
            </span>
            <span className="text-[10px] font-bold text-slate-300">{post.readTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">{post.title}</h1>
        </div>

        {/* Content */}
        <article className="prose prose-slate max-w-none">
          {post.content.map((paragraph, idx) => (
            <p key={idx} className="text-slate-600 font-bold text-base leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-2xl">
            <ArrowLeft size={16} className={isRtl ? 'rotate-180' : ''} />
            {t('blog.backToBlog', 'Back to Blog')}
          </Link>
        </div>
      </div>
    </div>
  );
}
