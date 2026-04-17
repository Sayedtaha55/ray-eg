import React from 'react';
import { ArrowLeft, Clock, ChevronLeft } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link, useParams } = ReactRouterDOM as any;

const categoryColors: Record<string, string> = {
  'تجارة إلكترونية': 'bg-[#00E5FF]/10 text-[#0097A7]',
  'إدارة الأعمال': 'bg-[#BD00FF]/10 text-[#9C27B0]',
  'من مكانك': 'bg-slate-100 text-slate-600',
  'تسويق رقمي': 'bg-amber-50 text-amber-700',
  'تقنية': 'bg-emerald-50 text-emerald-700',
  'نصائح تجار': 'bg-rose-50 text-rose-700',
};

const blogPosts = [
  {
    id: 1,
    slug: 'start-your-online-store',
    title: 'كيف تبدأ متجرك الإلكتروني في 5 خطوات',
    excerpt: 'دليل عملي لإنشاء متجر رقمي ناجح من الصفر — من اختيار النشاط إلى أول بيع.',
    date: '١٥ أبريل ٢٠٢٦',
    readTime: '٨ دقائق',
    category: 'تجارة إلكترونية',
    content: [
      'إنشاء متجر إلكتروني لم يعد بحاجة لخبير برمجة أو ميزانية ضخمة. في هذا الدليل نأخذك خطوة بخطوة من الفكرة إلى أول بيع حقيقي.',
      'الخطوة الأولى: حدد نوع نشاطك — هل تبيع ملابس؟ منتجات غذائية؟ خدمات حجز؟ تحديد النشاط يساعدك تختار الأدوات المناسبة.',
      'الخطوة الثانية: سجّل في منصة متكاملة مثل "من مكانك" — في أقل من دقيقة يكون عندك حساب تاجر جاهز.',
      'الخطوة الثالثة: صمم واجهة متجرك — استخدم مصمم الصفحات لاختيار الألوان والصور والتصنيفات اللي تعكس هويتك.',
      'الخطوة الرابعة: أضف منتجاتك — ارفع الصور، حدد الأسعار، ورتب المنتجات في تصنيفات واضحة.',
      'الخطوة الخامسة: ابدأ البيع — فعّل طرق الدفع، شارك رابط متجرك، واستقبل طلباتك الأولى!',
    ],
  },
  {
    id: 2,
    slug: 'inventory-management-secrets',
    title: 'أسرار إدارة المخزون بفعالية',
    excerpt: 'تعلم أفضل ممارسات إدارة المخزون لتقليل الهالك وزيادة الأرباح.',
    date: '١٠ أبريل ٢٠٢٦',
    readTime: '٦ دقائق',
    category: 'إدارة الأعمال',
    content: [
      'إدارة المخزون من أكبر التحديات اللي بيواجهها أي تاجر — سواء كان عنده سوبرماركت أو محل ملابس أو صيدلية.',
      'المشكلة الأولى: المنتجات اللي تنتهي صلاحيتها. الحل؟ نظام تنبيهات تلقائية ينبّهك قبل ما المنتج يخلص أو ينتهي.',
      'المشكلة الثانية: كثرة الأصناف وصعوبة التتبع. الحل؟ لوحة تحكم واضحة توريك كل منتج ومخزونه وحالته في نظرة واحدة.',
      'المشكلة الثالثة: الطلب الزائد أو الناقص. الحل؟ تقارير المبيعات تساعدك تتوقع الطلب وتطلب الكمية المناسبة.',
      'في "من مكانك"، كل أدوات إدارة المخزون متوفرة في مكان واحد — بدون الحاجة لبرامج منفصلة أو جداول إكسل معقدة.',
    ],
  },
  {
    id: 3,
    slug: 'why-you-need-all-in-one-platform',
    title: 'لماذا تحتاج منصة متكاملة لمتجرك؟',
    excerpt: 'كيف توفر لك المنصة الواحدة وقت وجهد إدارة عدة أدوات منفصلة.',
    date: '٥ أبريل ٢٠٢٦',
    readTime: '٥ دقائق',
    category: 'من مكانك',
    content: [
      'كتير من التجار بيستخدموا أدوات منفصلة — برنامج للمخزون، تطبيق للطلبات، موقع للإحصائيات. النتيجة؟ فوضى وضياع وقت.',
      'المنصة المتكاملة يعني كل حاجة في مكان واحد: المتجر، الطلبات، المخزون، التحليلات، والتنبيهات.',
      'توفير الوقت: بدل ما تفتح ٥ برامج، تفتح مكان واحد وتلاقي كل شيء جاهز.',
      'توفير الفلوس: اشتراك واحد بدل ما تدفع لكل برنامج على حدة.',
      'دقة أكبر: البيانات متزامنة تلقائياً — مفيش أخطاء بسبب نقل يدوي بين الأنظمة.',
      '"من مكانك" صُممت عشان تكون المنصة الوحيدة اللي تحتاجها لإدارة متجرك من الألف للياء.',
    ],
  },
  {
    id: 4,
    slug: 'digital-marketing-for-merchants',
    title: 'دليل التسويق الرقمي للمبتدئين',
    excerpt: 'أهم استراتيجيات التسويق الرقمي اللي لازم كل تاجر يعرفها لزيادة مبيعاته.',
    date: '١ أبريل ٢٠٢٦',
    readTime: '٧ دقائق',
    category: 'تسويق رقمي',
    content: [
      'التسويق الرقمي مش اختياري بعد كده — ده أساس أي مشروع ناجح. لكن منين تبدأ؟',
      'أولاً: اعرف جمهورك — مين عملاءك؟ إيه اللي بيدوروا عليه؟ فين بيقضوا وقتهم على الإنترنت؟',
      'ثانياً: اشتغل على محتوى حقيقي — صور منتجات احترافية، وصفات واضحة، وعروض مميزة.',
      'ثالثاً: استخدم وسائل التواصل — شارك منتجاتك على إنستغرام وفيسبوك وتيك توك.',
      'رابعاً: قيّم النتائج — تابع منين بيدخل متجرك، إيه اللي بيشتريه، وإيه اللي بيتجاهله.',
      'خامساً: حسّن باستمرار — غيّر الصور، جرّب عروض جديدة، وركز على اللي بيشتغل.',
    ],
  },
  {
    id: 5,
    slug: 'mobile-first-store-design',
    title: 'تصميم متجر يشتغل على الموبايل أولاً',
    excerpt: '٨٠٪ من العملاء بيتصفحوا من الموبايل — اعرف إزاي تعمل متجر يخطف أنظارهم.',
    date: '٢٨ مارس ٢٠٢٦',
    readTime: '٥ دقائق',
    category: 'تقنية',
    content: [
      'لو متجرك مش شغال كويس على الموبايل، فإنت بتخسر ٨٠٪ من عملاءك المحتملين.',
      'القاعدة الأولى: السرعة — الصفحة لازم تفتح في أقل من ٣ ثواني. الصور الكبيرة البطيئة بتخلي العميل يقفل.',
      'القاعدة الثانية: البساطة — كل ما الواجهة أبسط، كل ما أسهل في الاستخدام. مفيش داعي لتصميم معقد.',
      'القاعدة الثالثة: زر الشراء واضح — العميل لازم يلاقي زر "اشتري الآن" من غير ما يدور عليه.',
      'القاعدة الرابعة: صور واضحة — صور المنتجات لازم تكون واضحة حتى على شاشة صغيرة.',
      'في "من مكانك"، كل المتاجر بتشتغل تلقائياً على الموبايل بدون أي إعدادات إضافية.',
    ],
  },
  {
    id: 6,
    slug: 'secure-your-store-data',
    title: 'حماية بيانات متجرك وعملائك',
    excerpt: 'إزاي تتأكد إن بياناتك وبيانات عملائك في أمان — بدون ما تكون خبير تقني.',
    date: '٢٠ مارس ٢٠٢٦',
    readTime: '٤ دقائق',
    category: 'نصائح تجار',
    content: [
      'أمان البيانات مش رفاهية — ده مسؤولية تجاه عملائك وسمعة متجرك.',
      'التشفير: تأكد إن بيانات الدفع والمعلومات الشخصية مشفرة. في "من مكانك" كل البيانات مشفرة بتقنيات عالمية.',
      'كلمات المرور: استخدم كلمة مرور قوية وغيّرها دورياً. مفيش عذر لكلمة مرور زي "123456".',
      'النسخ الاحتياطي: بياناتك لازم تكون محفوظة في أكثر من مكان. المنصة بتعمل نسخ احتياطي تلقائي.',
      'صلاحيات الوصول: لو عندك موظفين، أعطي كل واحد الصلاحيات اللي يحتاجها بس — بدون زيادة.',
      'التحديثات: تأكد إن المنصة بتتحدث تلقائياً عشان تقفل أي ثغرات أمنية جديدة.',
    ],
  },
];

const BlogPostPage: React.FC = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center text-right" dir="rtl">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-4">المقال غير موجود</h1>
          <Link to="/blog" className="text-[#0097A7] font-bold">العودة للمدونة</Link>
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
          العودة للمدونة
        </Link>

        <article>
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[post.category] || 'bg-slate-100 text-slate-600'}`}>
                {post.category}
              </span>
              <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4">{post.title}</h1>
            <p className="text-slate-400 text-sm font-medium">{post.date}</p>
          </header>

          <div className="prose prose-slate max-w-none">
            {post.content.map((paragraph, idx) => (
              <p key={idx} className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200">
            <h2 className="text-xl font-black text-slate-900 mb-6">مقالات ذات صلة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/blog/${rp.slug}`}
                  className="bg-white rounded-xl p-4 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all"
                >
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${categoryColors[rp.category] || 'bg-slate-100 text-slate-600'}`}>
                    {rp.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">{rp.title}</h3>
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
            العودة لصفحة الأعمال
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
