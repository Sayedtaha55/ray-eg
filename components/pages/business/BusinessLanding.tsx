
import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Store, ArrowLeft, TrendingUp, PackageCheck, BellRing } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import type { ShopGallery } from '@/types';

const { Link } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const BusinessLanding: React.FC = () => {
  const featuredShopId = String(import.meta.env.VITE_FEATURED_SHOP_ID || '').trim();
  const [heroVideo, setHeroVideo] = useState<ShopGallery | null>(null);
  const reduceMotion = useReducedMotion();

  const fallbackHero = useMemo(
    () => ({
      webm: '/videos/business-hero.webm',
      mp4: '/videos/business-hero.mp4',
      poster: '/videos/business-hero-poster.webp',
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    if (!featuredShopId) {
      setHeroVideo(null);
      return () => {
        cancelled = true;
      };
    }

    ApiService.getShopGallery(featuredShopId)
      .then((items: any) => {
        if (cancelled) return;
        const list = Array.isArray(items) ? (items as ShopGallery[]) : [];
        const firstVideo = list.find((x) => String((x as any)?.mediaType || '').toUpperCase() === 'VIDEO') || null;
        setHeroVideo(firstVideo);
      })
      .catch(() => {
        if (cancelled) return;
        setHeroVideo(null);
      });

    return () => {
      cancelled = true;
    };
  }, [featuredShopId]);

  const heroMp4 = heroVideo?.imageUrl ? String(heroVideo.imageUrl) : fallbackHero.mp4;
  const heroPoster = heroVideo?.thumbUrl ? String(heroVideo.thumbUrl) : fallbackHero.poster;
  const hasDynamicHero = Boolean(heroVideo?.imageUrl);

  const heroContainer: Variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { duration: 0.01 },
        },
      }
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.12,
            delayChildren: 0.05,
          },
        },
      };

  const heroItem: Variants = reduceMotion
    ? {
        hidden: { opacity: 1, y: 0 },
        show: { opacity: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { type: 'spring', stiffness: 120, damping: 18 } as const,
        },
      };

  return (
    <>
      {/* CSS for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      
    <div className="text-right" dir="rtl">
      {/* Hero Section */}
      <div className="relative min-h-[92vh] bg-slate-950 overflow-hidden flex items-center">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={heroPoster}
        >
          {!hasDynamicHero && <source src={fallbackHero.webm} type="video/webm" />}
          <source src={heroMp4} type="video/mp4" />
          {!hasDynamicHero && <source src={fallbackHero.mp4} type="video/mp4" />}
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />

        <MotionDiv
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          initial={false}
        >
          <MotionDiv
            className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-[#00E5FF]/18 blur-[90px]"
            animate={
              reduceMotion
                ? { opacity: 0.9 }
                : {
                    x: [0, 36, -12, 0],
                    y: [0, 18, 44, 0],
                    opacity: [0.55, 0.8, 0.6, 0.55],
                    scale: [1, 1.05, 0.98, 1],
                  }
            }
            transition={reduceMotion ? { duration: 0.01 } : { duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <MotionDiv
            className="absolute -bottom-32 -right-24 w-[620px] h-[620px] rounded-full bg-[#BD00FF]/18 blur-[100px]"
            animate={
              reduceMotion
                ? { opacity: 0.9 }
                : {
                    x: [0, -22, 14, 0],
                    y: [0, -28, -8, 0],
                    opacity: [0.45, 0.78, 0.55, 0.45],
                    scale: [1, 1.04, 0.99, 1],
                  }
            }
            transition={reduceMotion ? { duration: 0.01 } : { duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <MotionDiv
            className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full bg-white/6 blur-[120px]"
            animate={reduceMotion ? { opacity: 0.6 } : { opacity: [0.22, 0.42, 0.22] }}
            transition={reduceMotion ? { duration: 0.01 } : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </MotionDiv>

        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 pt-36 pb-20 md:pt-44 md:pb-28">
            <div className="text-center max-w-4xl mx-auto">
              <MotionDiv variants={heroContainer} initial="hidden" animate="show">
                <MotionDiv
                  variants={heroItem}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 rounded-full text-[#00E5FF] font-black text-xs uppercase tracking-widest mb-10 border border-white/10"
                >
                  <TrendingUp className="w-4 h-4" />
                  انضم لنكون من الأوائل — التسجيل مجاني
                </MotionDiv>

                <motion.h1
                  variants={heroItem}
                  className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.9] text-white"
                >
                  قم ببناء <br /> <span className="text-[#00E5FF]">علامتك التجارية.</span>
                </motion.h1>

                <motion.p
                  variants={heroItem}
                  className="text-xl md:text-2xl text-slate-200/80 mb-12 leading-relaxed font-medium max-w-3xl mx-auto"
                >
                  منصة التجارة الشاملة لتجار العصر الجديد. صمم متجرك، أدر مخزونك، وقم ببيع منتجاتك من أي مكان باستخدام أقوى الأدوات التقنية.
                </motion.p>

                <MotionDiv variants={heroItem} className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <motion.div
                    whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className="w-full md:w-auto"
                  >
                    <Link
                      to="/business/dashboard"
                      className="block w-full md:w-auto bg-[#00E5FF] text-slate-900 px-14 py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/30"
                    >
                      ابدأ تجربتك المجانية
                    </Link>
                  </motion.div>
                  <motion.button
                    type="button"
                    whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className="w-full md:w-auto border border-slate-200/30 text-white px-14 py-6 rounded-[2rem] font-black text-xl hover:bg-white hover:text-slate-900 transition-all backdrop-blur"
                  >
                    شاهد العرض التوضيحي
                  </motion.button>
                </MotionDiv>

                <MotionDiv
                  variants={heroItem}
                  className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-200/80"
                >
                  <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <Store className="w-5 h-5 text-[#00E5FF]" />
                    <span className="font-black text-sm">متجر جاهز في دقائق</span>
                  </div>
                  <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <PackageCheck className="w-5 h-5 text-[#BD00FF]" />
                    <span className="font-black text-sm">إدارة منتجات سهلة</span>
                  </div>
                  <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <BellRing className="w-5 h-5 text-white" />
                    <span className="font-black text-sm">تنبيه فوري للطلبات</span>
                  </div>
                </MotionDiv>
              </MotionDiv>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* Enhanced floating decorative elements with parallax */}
        <div className="relative h-40">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: "easeOut" }}
            animate={{ 
              y: [0, -30, 0], 
              rotate: [0, 10, 0],
              scale: [1, 1.1, 1]
            }}
            style={{ willChange: "transform" }}
            className="absolute left-[5%] top-10 w-20 h-20 bg-gradient-to-br from-[#00E5FF]/30 to-[#00E5FF]/10 rounded-3xl blur-2xl shadow-2xl shadow-[#00E5FF]/20"
          />
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            animate={{ 
              y: [0, 40, 0], 
              rotate: [0, -15, 0],
              scale: [1, 0.9, 1]
            }}
            style={{ willChange: "transform" }}
            className="absolute right-[10%] -top-10 w-32 h-32 bg-gradient-to-br from-[#BD00FF]/30 to-[#BD00FF]/10 rounded-full blur-3xl shadow-2xl shadow-[#BD00FF]/20"
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            animate={{ 
              x: [0, 20, 0], 
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            className="absolute left-[40%] top-20 w-16 h-16 bg-gradient-to-br from-[#00FF77]/20 to-transparent rounded-2xl blur-xl"
          />
        </div>

        {/* Enhanced Features Grid with sophisticated animations */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-150px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1, 
              transition: { staggerChildren: 0.2, delayChildren: 0.2 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-40 relative"
        >
          {/* Background gradient that appears on scroll */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 via-transparent to-[#BD00FF]/5 rounded-[4rem] blur-3xl -z-10"
          />
          <motion.div 
            variants={{ 
              hidden: { opacity: 0, y: 60, scale: 0.9, rotateX: 15 }, 
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotateX: 0,
                transition: { 
                  type: 'spring', 
                  stiffness: 80, 
                  damping: 20,
                  duration: 0.8
                } as const 
              } 
            }}
            whileHover={{ 
              y: -15, 
              scale: 1.02,
              transition: { type: 'spring', stiffness: 400, damping: 25 } 
            }}
          >
            <FeatureCard 
              icon={<Store className="w-10 h-10 text-[#00E5FF]" />}
              title="مصمم الصفحات الذكي"
              description="اسحب وأفلت لتبني واجهة متجر تعكس هوية علامتك التجارية بلمسات احترافية دون الحاجة لمبرمج."
            />
          </motion.div>
          <motion.div 
            variants={{ 
              hidden: { opacity: 0, y: 60, scale: 0.9, rotateX: 15 }, 
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotateX: 0,
                transition: { 
                  type: 'spring', 
                  stiffness: 80, 
                  damping: 20,
                  duration: 0.8,
                  delay: 0.1
                } as const 
              } 
            }}
            whileHover={{ 
              y: -15, 
              scale: 1.02,
              transition: { type: 'spring', stiffness: 400, damping: 25 } 
            }}
          >
            <FeatureCard 
              icon={<PackageCheck className="w-10 h-10 text-[#BD00FF]" />}
              title="إدارة المنتجات والطلبات"
              description="أضف منتجاتك، حدّث المخزون، وتابع الطلبات من لوحة تحكم واحدة بشكل واضح وسريع."
            />
          </motion.div>
          <motion.div 
            variants={{ 
              hidden: { opacity: 0, y: 60, scale: 0.9, rotateX: 15 }, 
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotateX: 0,
                transition: { 
                  type: 'spring', 
                  stiffness: 80, 
                  damping: 20,
                  duration: 0.8,
                  delay: 0.2
                } as const 
              } 
            }}
            whileHover={{ 
              y: -15, 
              scale: 1.02,
              transition: { type: 'spring', stiffness: 400, damping: 25 } 
            }}
          >
            <FeatureCard 
              icon={<BellRing className="w-10 h-10 text-white" />}
              title="تنبيه فوري للتاجر"
              description="رنّة إشعار تلقائية عند وصول طلب أو حجز جديد حتى لا يفوتك أي عميل."
            />
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Section with parallax and sophisticated animations */}
        <motion.section 
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white rounded-[4rem] p-12 md:p-24 text-slate-900 relative overflow-hidden"
        >
          {/* Animated background gradient */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#BD00FF]/10 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00E5FF]/10 to-transparent rounded-full blur-3xl"
          />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
                }}
              >
                <motion.h2 
                  variants={{ 
                    hidden: { opacity: 0, x: -40, rotateY: -15 }, 
                    visible: { 
                      opacity: 1, 
                      x: 0, 
                      rotateY: 0,
                      transition: { 
                        type: 'spring', 
                        stiffness: 120, 
                        damping: 25,
                        duration: 1
                      } as const 
                    } 
                  }}
                  className="text-5xl md:text-7xl font-black tracking-tighter mb-8"
                >
                  كل اللي تحتاجه لإدارة <span className="text-[#BD00FF]">متجرك.</span>
                </motion.h2>
                <div className="space-y-10">
                   <motion.div 
                     variants={{ 
                       hidden: { opacity: 0, x: -40, scale: 0.9 }, 
                       visible: { 
                         opacity: 1, 
                         x: 0, 
                         scale: 1,
                         transition: { 
                           type: 'spring', 
                           stiffness: 100, 
                           damping: 22,
                           duration: 0.9
                         } as const 
                       } 
                     }}
                     whileHover={{ x: -10, transition: { duration: 0.3 } }}
                   > 
                     <BenefitItem 
                      icon={<Store className="w-6 h-6" />}
                      title="لوحة تحكم واضحة للتاجر"
                      description="تابع متجرك من مكان واحد: المنتجات، الطلبات، والحجوزات — بدون تعقيد."
                     />
                   </motion.div>
                   <motion.div 
                     variants={{ 
                       hidden: { opacity: 0, x: -40, scale: 0.9 }, 
                       visible: { 
                         opacity: 1, 
                         x: 0, 
                         scale: 1,
                         transition: { 
                           type: 'spring', 
                           stiffness: 100, 
                           damping: 22,
                           duration: 0.9
                         } as const 
                       } 
                     }}
                     whileHover={{ x: -10, transition: { duration: 0.3 } }}
                   > 
                     <BenefitItem 
                      icon={<PackageCheck className="w-6 h-6" />}
                      title="إدارة الطلبات والحجوزات"
                      description="استقبل الطلبات والحجوزات، وحدّث حالتها بسهولة من داخل لوحة التحكم."
                     />
                   </motion.div>
                   <motion.div 
                     variants={{ 
                       hidden: { opacity: 0, x: -40, scale: 0.9 }, 
                       visible: { 
                         opacity: 1, 
                         x: 0, 
                         scale: 1,
                         transition: { 
                           type: 'spring', 
                           stiffness: 100, 
                           damping: 22,
                           duration: 0.9
                         } as const 
                       } 
                     }}
                     whileHover={{ x: -10, transition: { duration: 0.3 } }}
                   > 
                     <BenefitItem 
                      icon={<BellRing className="w-6 h-6" />}
                      title="تنبيه فوري عند طلب/حجز جديد"
                      description="رنّة إشعار للتاجر عند وصول طلب أو حجز جديد حتى لا يفوتك أي عميل."
                     />
                   </motion.div>
                </div>
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } as const } }}
                  className="mt-16"
                >
                  <Link to="/business/dashboard" className="inline-flex items-center gap-3 font-black text-2xl text-[#BD00FF] hover:gap-6 transition-all group">
                     سجل متجرك الآن <ArrowLeft className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                className="relative"
              >
                {/* Enhanced animated glow background */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.25, 0.15],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-12 bg-gradient-to-br from-[#BD00FF]/20 via-[#00E5FF]/10 to-[#BD00FF]/20 blur-[120px] rounded-full" 
                />
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 1, 0]
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <img src="/images/business/dashboard-hero.png" className="relative rounded-[3rem] shadow-2xl border border-slate-100" alt="dashboard" />
                </motion.div>
              </motion.div>
           </div>
        </motion.section>
      </div>

      {/* Enhanced Trusted Partners Marquee with sophisticated animations */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-slate-900 py-16 border-y border-slate-800 overflow-hidden relative"
      >
        {/* Animated background gradient */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          animate={{ 
            x: [-100, 100, -100],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/5 via-transparent to-[#BD00FF]/5"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10"
        >
          <p className="text-center text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">من مكانك للأعمال</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10"
        >
          <div className="flex gap-16 animate-marquee">
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center gap-3 shrink-0"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#BD00FF] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#00E5FF]/25">
                  م
                </div>
                <span className="text-white font-black text-2xl tracking-tight">MNMKNK</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Enhanced Floating Sticky CTA with sophisticated animations */}
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-auto z-50"
      >
        <motion.div 
          animate={{ 
            boxShadow: [
              "0 20px 25px -5px rgba(0, 229, 255, 0.1), 0 10px 10px -5px rgba(0, 229, 255, 0.04)",
              "0 25px 50px -12px rgba(0, 229, 255, 0.25), 0 12px 24px -4px rgba(0, 229, 255, 0.1)",
              "0 20px 25px -5px rgba(0, 229, 255, 0.1), 0 10px 10px -5px rgba(0, 229, 255, 0.04)"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 relative overflow-hidden"
        >
          {/* Animated glow effect */}
          <motion.div
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/10 to-[#BD00FF]/10 rounded-2xl"
          />
          <div className="hidden md:block relative z-10">
            <p className="text-white font-black text-sm">ابدأ الآن مجاناً</p>
            <p className="text-slate-400 text-xs">لا تحتاج بطاقة ائتمان</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10"
          >
            <Link 
              to="/business/dashboard"
              className="bg-[#00E5FF] text-slate-900 px-6 py-3 rounded-xl font-black text-sm hover:bg-[#00d4e8] transition-colors whitespace-nowrap block shadow-lg shadow-[#00E5FF]/25"
            >
              ابدأ تجربتك
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Business Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900 border-t border-slate-800 text-slate-300"
      >
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {/* Brand */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } as const } }}>
              <h3 className="text-2xl font-black text-white mb-4">MNMKNK</h3>
              <p className="text-slate-400 leading-relaxed">
                منصة متكاملة لتجار العصر الجديد. صمم متجرك، أدر منتجاتك، واربح بسهولة.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } as const } }}>
              <h4 className="text-lg font-black text-white mb-4">روابط سريعة</h4>
              <ul className="space-y-2">
                <li><Link to="/shops" className="hover:text-[#00E5FF] transition-colors">المحلات</Link></li>
                <li><Link to="/restaurants" className="hover:text-[#00E5FF] transition-colors">المطاعم</Link></li>
                <li><Link to="/" className="hover:text-[#00E5FF] transition-colors">الرئيسية</Link></li>
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } as const } }}>
              <h4 className="text-lg font-black text-white mb-4">الدعم والشروط</h4>
              <ul className="space-y-2">
                <li><Link to="/business/courier-signup" className="hover:text-[#00E5FF] transition-colors">تسجيل مندوب توصيل</Link></li>
                <li><a href="#" className="hover:text-[#00E5FF] transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-[#00E5FF] transition-colors">شروط الخدمة</a></li>
                <li><a href="#" className="hover:text-[#00E5FF] transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-[#00E5FF] transition-colors">تواصل معنا</a></li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm"
          >
            <p> {new Date().getFullYear()} MNMKNK. جميع الحقوق محفوظة.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
    </>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string, index?: number }> = ({ icon, title, description, index = 0 }) => (
  <motion.div
    whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    className="relative group"
  >
    {/* Animated gradient border */}
    <div className="absolute -inset-[1px] rounded-[3rem] bg-gradient-to-r from-[#00E5FF] via-[#BD00FF] to-[#00E5FF] opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
    <div className="absolute -inset-[1px] rounded-[3rem] bg-gradient-to-r from-[#00E5FF] via-[#BD00FF] to-[#00E5FF] opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
    
    <div className="relative p-12 rounded-[3rem] bg-slate-800/40 border border-slate-700 group-hover:border-transparent transition-all">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <motion.div 
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 p-5 bg-slate-900 rounded-2xl inline-block shadow-xl shadow-black/20 relative"
      >
        {icon}
      </motion.div>
      
      <h3 className="text-3xl font-black mb-6 uppercase tracking-tight group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-slate-400 text-lg leading-relaxed font-medium group-hover:text-slate-300 transition-colors">
        {description}
      </p>
    </div>
  </motion.div>
);

const BenefitItem: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ x: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    className="flex gap-6 flex-row-reverse group cursor-pointer"
  >
     <motion.div 
       whileHover={{ scale: 1.1, rotate: 5 }}
       className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-900 group-hover:bg-[#00E5FF] group-hover:text-slate-900 transition-colors duration-300 shadow-lg shadow-slate-200/50"
     >
       {icon}
     </motion.div>
     <div className="text-right">
        <h4 className="text-2xl font-black mb-2 group-hover:text-[#BD00FF] transition-colors duration-300">{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed group-hover:text-slate-700 transition-colors duration-300">{description}</p>
     </div>
  </motion.div>
);

export default BusinessLanding;
