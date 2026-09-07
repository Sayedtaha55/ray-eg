'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import {
  TrustMarquee,
  ThemeShowcase,
  AboutSection,
  FeaturesSection,
  HowItWorks,
  DashboardPreview,
} from '@/components/Sections';
import {
  IndustriesSection,
  GrowthSection,
  TestimonialsSection,
  AboutSection2,
  ProductsSection,
  FaqSection,
  MapSection,
  FinalCta,
  Footer,
} from '@/components/MoreSections';
import { useScrollReveal, useBackToTop } from '@/lib/hooks';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  useScrollReveal();
  const { show, scrollToTop } = useBackToTop();

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <Hero />
      <TrustMarquee />
      <ThemeShowcase />
      <AboutSection />
      <FeaturesSection />
      <HowItWorks />
      <DashboardPreview />
      <IndustriesSection />
      <GrowthSection />
      <TestimonialsSection />
      <AboutSection2 />
      <ProductsSection />
      <FaqSection />
      <MapSection />
      <FinalCta />
      <Footer />

      {show && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 md:bottom-6 left-4 z-50 w-11 h-11 rounded-xl bg-[#00E5FF] text-slate-900 shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer"
          aria-label="Back to top"
        >
          <ChevronDown className="w-5 h-5 rotate-180" />
        </button>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden p-3 bg-slate-950/90 backdrop-blur-lg border-t border-white/10">
        <Link
          href="/signup"
          className="flex items-center justify-center gap-2 w-full bg-[#00E5FF] text-slate-900 py-3.5 rounded-xl font-black text-base shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          ابدأ مجاناً الآن
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
