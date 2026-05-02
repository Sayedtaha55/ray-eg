import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Zap, Smartphone, Globe, ArrowLeft, TrendingUp, Users, ShieldCheck, UtensilsCrossed, QrCode } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import type { ShopGallery } from '@/types';

const { Link } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const BusinessHero: React.FC = () => {
  const { shopId } = ReactRouterDOM.useParams() as { shopId?: string };
  const [heroVideo, setHeroVideo] = useState<ShopGallery | null>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!shopId) {
      setError('Shop ID is required');
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const loadShopAndGallery = async () => {
      try {
        // Load shop info
        const shopData = await fetch(`/api/v1/shops/${encodeURIComponent(shopId)}`).then((r) => {
          if (!r.ok) throw new Error('Shop not found');
          return r.json();
        });
        if (cancelled) return;
        setShop(shopData);

        // Load gallery
        const galleryItems = await fetch(`/api/v1/gallery/${encodeURIComponent(shopId)}`).then((r) => {
          if (!r.ok) throw new Error('Gallery not found');
          return r.json();
        });
        if (cancelled) return;
        const list = Array.isArray(galleryItems) ? (galleryItems as ShopGallery[]) : [];
        const firstVideo = list.find((x) => String((x as any)?.mediaType || '').toUpperCase() === 'VIDEO') || null;
        setHeroVideo(firstVideo);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load shop/gallery:', err);
        setError('Failed to load shop data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadShopAndGallery();

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  const heroMp4 = heroVideo?.imageUrl ? String(heroVideo.imageUrl) : fallbackHero.mp4;
  const heroPoster = heroVideo?.thumbUrl ? String(heroVideo.thumbUrl) : fallbackHero.poster;
  const hasDynamicHero = Boolean(heroVideo?.imageUrl);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-center">{error}</p>
        <Link to="/" className="mt-6 text-cyan-400 hover:text-cyan-300 underline">
          Go Home
        </Link>
      </div>
    );
  }

  return (
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black-80" />
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 pt-36 pb-20 md:pt-44 md:pb-28">
            <div className="text-center max-w-4xl mx-auto">
              <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 rounded-full text-[#00E5FF] font-black text-xs uppercase tracking-widest mb-10 border border-white/10"
              >
                <TrendingUp className="w-4 h-4" />
                {shop?.name || 'Shop'}
              </MotionDiv>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.9] text-white"
              >
                {shop?.name || 'Shop'}
              </motion.h1>
              <p className="text-xl md:text-2xl text-slate-200/80 mb-12 leading-relaxed font-medium max-w-3xl mx-auto">
                {shop?.description || 'Welcome to our shop'}
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link to={`/business/${shopId}/dashboard`} className="w-full md:w-auto bg-[#00E5FF] text-slate-900 px-14 py-6 rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-cyan-500/20">
                  Enter Shop
                </Link>
                <Link to="/" className="w-full md:w-auto border border-slate-200/30 text-white px-14 py-6 rounded-[2rem] font-black text-xl hover:bg-white hover:text-slate-900 transition-all">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Info Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">About {shop?.name || 'Shop'}</h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            {shop?.description || 'No description available.'}
          </p>
          {shop?.phone && (
            <p className="mt-4 text-slate-400">
              Contact: {shop.phone}
            </p>
          )}
          {shop?.email && (
            <p className="mt-2 text-slate-400">
              Email: {shop.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessHero;
