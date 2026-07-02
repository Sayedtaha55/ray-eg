import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartSound } from '@/hooks/useCartSound';
import { Search, MapPin, ChevronDown, Smartphone, Monitor, Tablet, Check, X, ArrowLeft, Sparkles, Star, Calendar, MessageCircle, Zap, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HomeFeed: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { playSound } = useCartSound();

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section with Video Background + Search */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
                {/* Video Background */}
                <div className="absolute inset-0 z-0">
                    <video
                        className="w-full h-full object-cover opacity-40"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster="/images/home/hero-poster.jpg"
                    >
                        <source src="/videos/home-hero.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 py-20 text-center">
                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-tight">
                        كل الأماكن اللي بتدور عليها
                        <br />
                        <span className="text-[#00E5FF]">في مكان واحد</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto font-medium">
                        ابحث عن المطاعم، الكافيهات، الملاعب، العيادات، والمحلات في تجربة بسيطة وسريعة
                    </p>

                    {/* Search Box */}
                    <div className="bg-white rounded-3xl p-3 max-w-4xl mx-auto shadow-2xl">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="ماذا تبحث؟"
                                    className="w-full bg-transparent outline-none text-slate-900 font-medium placeholder:text-slate-400"
                                />
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl">
                                <MapPin className="w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="أين؟"
                                    className="w-full bg-transparent outline-none text-slate-900 font-medium placeholder:text-slate-400"
                                />
                            </div>
                            <button className="px-8 py-3 bg-[#00E5FF] text-slate-900 rounded-2xl font-black hover:bg-[#00D4EE] transition-colors">
                                ابحث الآن
                            </button>
                        </div>
                    </div>

                    {/* Quick Chips */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                        {['🍔 مطاعم', '☕ كافيهات', '🏋 جيم', '⚽ ملاعب', '🩺 عيادات', '🏨 فنادق'].map((chip, idx) => (
                            <button
                                key={idx}
                                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/20 transition-colors"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <ChevronDown className="w-8 h-8 text-white/60" />
                </div>
            </section>

            {/* What is MNMKNK - Features */}
            <section className="py-20 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-5 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4">
                            لماذا <span className="text-[#00E5FF]">MNMKNK</span>؟
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            منصة واحدة تجمع كل ما تحتاجه في مكان واحد
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Sparkles, title: 'مكان واحد لكل الأنشطة', desc: 'لا حاجة للتنقل بين عشرات التطبيقات والمواقع' },
                            { icon: Search, title: 'بحث سريع', desc: 'اعثر على ما تريد في ثوانٍ معدودة' },
                            { icon: Star, title: 'تقييمات حقيقية', desc: 'آراء مستخدمين حقيقيين لمساعدتك في اتخاذ القرار' },
                            { icon: Calendar, title: 'حجز بسهولة', desc: 'احجز موعدك أو طلبك في دقائق' },
                            { icon: MessageCircle, title: 'تواصل مباشر', desc: 'تحدث مباشرة مع الأماكن عبر المحادثة الفورية' },
                            { icon: Zap, title: 'تجربة سريعة', desc: 'تصميم سريع وسهل الاستخدام على جميع الأجهزة' },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="group p-6 md:p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-[#00E5FF]/30 hover:shadow-xl transition-all"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[#00E5FF]/10 text-[#0097A7] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Video Demo Section */}
            <section className="py-20 md:py-32 bg-slate-900">
                <div className="max-w-7xl mx-auto px-5 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                            شوف كيف <span className="text-[#00E5FF]">بسيطة</span>
                        </h2>
                        <p className="text-xl text-white/60">
                            من البحث إلى الحجز في ثواني
                        </p>
                    </div>

                    <div className="relative aspect-video bg-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                        <video
                            className="w-full h-full object-cover"
                            controls
                            poster="/images/home/video-poster.jpg"
                        >
                            <source src="/videos/demo.mp4" type="video/mp4" />
                        </video>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <button className="w-20 h-20 bg-[#00E5FF] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
                                <Play className="w-8 h-8 text-slate-900 mr-1" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform Preview - Screenshots */}
            <section className="py-20 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-5 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4">
                            المنصة على <span className="text-[#00E5FF]">جميع الأجهزة</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Desktop */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-br from-[#00E5FF]/10 via-transparent to-[#BD00FF]/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-slate-900 rounded-2xl p-2 shadow-2xl">
                                <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden">
                                    <img src="/images/home/desktop-preview.jpg" alt="Desktop" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex items-center justify-center gap-2 py-3">
                                    <Monitor className="w-5 h-5 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-400">Desktop</span>
                                </div>
                            </div>
                        </div>

                        {/* Tablet */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-br from-[#00E5FF]/10 via-transparent to-[#BD00FF]/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-slate-900 rounded-2xl p-2 shadow-2xl">
                                <div className="aspect-[4/3] bg-slate-800 rounded-xl overflow-hidden">
                                    <img src="/images/home/tablet-preview.jpg" alt="Tablet" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex items-center justify-center gap-2 py-3">
                                    <Tablet className="w-5 h-5 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-400">Tablet</span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-br from-[#00E5FF]/10 via-transparent to-[#BD00FF]/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-slate-900 rounded-2xl p-2 shadow-2xl">
                                <div className="aspect-[9/16] bg-slate-800 rounded-xl overflow-hidden">
                                    <img src="/images/home/mobile-preview.jpg" alt="Mobile" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex items-center justify-center gap-2 py-3">
                                    <Smartphone className="w-5 h-5 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-400">Mobile</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - 3 Steps */}
            <section className="py-20 md:py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-5 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4">
                            كيف تعمل؟
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center mx-auto mb-6 text-3xl font-black">
                                1
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">ابحث</h3>
                            <p className="text-slate-600 leading-relaxed">
                                اكتب ما تبحث عنه واختر المدينة
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center mx-auto mb-6 text-3xl font-black">
                                2
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">اختر</h3>
                            <p className="text-slate-600 leading-relaxed">
                                تصفح الخيارات واختر الأنسب لك
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center mx-auto mb-6 text-3xl font-black">
                                3
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">استمتع</h3>
                            <p className="text-slate-600 leading-relaxed">
                                احجز أو تواصل مباشرة واستمتع بالخدمة
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Explore Categories - Interface Only */}
            <section className="py-20 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-5 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4">
                            اكتشف <span className="text-[#00E5FF]">بسهولة</span>
                        </h2>
                        <p className="text-xl text-slate-600">
                            تصفح الفئات واعثر على ما تريد
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { icon: '🍔', name: 'مطاعم', color: 'from-orange-500 to-red-600' },
                            { icon: '☕', name: 'كافيهات', color: 'from-amber-500 to-orange-600' },
                            { icon: '🏋', name: 'جيم', color: 'from-blue-500 to-cyan-600' },
                            { icon: '⚽', name: 'ملاعب', color: 'from-green-500 to-emerald-600' },
                            { icon: '🩺', name: 'عيادات', color: 'from-red-500 to-pink-600' },
                            { icon: '🏨', name: 'فنادق', color: 'from-purple-500 to-indigo-600' },
                            { icon: '💇', name: 'صالونات', color: 'from-pink-500 to-rose-600' },
                            { icon: '🎮', name: 'ترفيه', color: 'from-cyan-500 to-blue-600' },
                        ].map((category, idx) => (
                            <div
                                key={idx}
                                className={`relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br ${category.color} p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group`}
                            >
                                <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">
                                    {category.icon}
                                </span>
                                <span className="text-lg md:text-xl font-black text-white">{category.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us - Comparison */}
            <section className="py-20 md:py-32 bg-slate-50">
                <div className="max-w-5xl mx-auto px-5 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4">
                            لماذا <span className="text-[#00E5FF]">نختلف</span>؟
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { traditional: 'زيارة عشرات المواقع والتطبيقات', us: 'كل الأماكن في مكان واحد' },
                            { traditional: 'بحث منفصل في كل منصة', us: 'ابحث مرة واحدة' },
                            { traditional: 'الاتصال بكل مكان على حدة', us: 'احجز أو تواصل مباشرة' },
                            { traditional: 'مقارنة الأسعار يدوياً', us: 'مقارنة تلقائية وشفافة' },
                        ].map((item, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-2xl">
                                    <X className="w-5 h-5 text-red-500 shrink-0" />
                                    <span className="text-slate-600 font-medium">{item.traditional}</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-[#00E5FF]/10 rounded-2xl border border-[#00E5FF]/20">
                                    <Check className="w-5 h-5 text-[#00E5FF] shrink-0" />
                                    <span className="text-slate-900 font-bold">{item.us}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 bg-slate-900">
                <div className="max-w-5xl mx-auto px-5 sm:px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
                        ابدأ رحلتك الآن
                    </h2>
                    <p className="text-xl text-white/60 mb-10">
                        سجل حسابك免费 واكتشف عالماً من الاحتمالات
                    </p>
                    <button className="px-12 py-5 bg-[#00E5FF] text-slate-900 rounded-2xl font-black text-lg hover:bg-[#00D4EE] transition-colors shadow-2xl">
                        إنشاء حساب مجاني
                    </button>
                </div>
            </section>

            {/* For Businesses CTA */}
            <section className="py-12 bg-slate-800 border-t border-slate-700">
                <div className="max-w-5xl mx-auto px-5 sm:px-6 text-center">
                    <p className="text-white/80 mb-4">هل لديك نشاط تجاري؟</p>
                    <a href="/business" className="text-[#00E5FF] font-black text-lg hover:underline">
                        ابدأ نشاطك مع MNMKNK ←
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 border-t border-slate-800 py-12">
                <div className="max-w-7xl mx-auto px-5 sm:px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#00E5FF] rounded-lg flex items-center justify-center">
                                <span className="text-slate-900 font-black text-sm">M</span>
                            </div>
                            <span className="text-lg font-black text-white tracking-tight">MNMKNK</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                            <a href="/about" className="hover:text-white transition-colors">من نحن</a>
                            <a href="/support" className="hover:text-white transition-colors">الدعم</a>
                            <a href="/terms" className="hover:text-white transition-colors">الشروط</a>
                            <a href="/privacy" className="hover:text-white transition-colors">الخصوصية</a>
                            <a href="/contact" className="hover:text-white transition-colors">تواصل معنا</a>
                        </div>

                        <p className="text-slate-500 text-sm">
                            © {new Date().getFullYear()} MNMKNK. جميع الحقوق محفوظة
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomeFeed;