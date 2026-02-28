import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type RouteSeo = {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
  includeFaqSchema?: boolean;
};

const SITE_URL = 'https://mnmknk.com';
const SITE_NAME = 'من مكانك';
const DEFAULT_IMAGE = `${SITE_URL}/brand/logo.png`;

const routeSeoMap: Record<string, RouteSeo> = {
  '/': {
    title: 'من مكانك | دليل المحلات والمطاعم والأنشطة في مصر',
    description:
      'من مكانك هو دليل المحلات ودليل المطاعم ودليل الأنشطة في مصر لاكتشاف الأماكن القريبة منك مع العروض والتقييمات.',
    keywords:
      'من مكانك, منمكانك, مكانك, دليل المحلات, دليل المطاعم, دليل الأنشطة, محلات قريبة, مطاعم قريبة, أنشطة قريبة',
    canonicalPath: '/',
  },
  '/dalil': {
    title: 'من مكانك | دليل المحلات ودليل المطاعم ودليل الأنشطة في مصر',
    description:
      'اكتشف أفضل المحلات والمطاعم والأنشطة القريبة منك على من مكانك مع عروض وتقييمات ومعلومات تساعدك تختار بسرعة.',
    keywords:
      'من مكانك, منمكانك, دليل المحلات, دليل المطاعم, دليل الأنشطة, دليل الاماكن, أماكن قريبة, محلات قريبة, مطاعم قريبة',
    canonicalPath: '/dalil',
    includeFaqSchema: true,
  },
  '/map': {
    title: 'خريطة من مكانك | اكتشف المحلات والمطاعم القريبة',
    description: 'خريطة تفاعلية لاكتشاف المحلات والمطاعم والأنشطة القريبة منك في مصر على منصة من مكانك.',
    keywords: 'خريطة المحلات, خريطة المطاعم, محلات قريبة مني, مطاعم قريبة مني, من مكانك',
    canonicalPath: '/map',
  },
  '/offers': {
    title: 'عروض من مكانك | أحدث عروض المحلات والمطاعم',
    description: 'تابع أحدث عروض وتخفيضات المحلات والمطاعم القريبة منك على منصة من مكانك.',
    keywords: 'عروض المحلات, عروض المطاعم, خصومات قريبة, من مكانك عروض',
    canonicalPath: '/offers',
  },
  '/about': {
    title: 'عن من مكانك | دليل المحلات والمطاعم في مصر',
    description: 'تعرف على منصة من مكانك ورسالتها في تسهيل اكتشاف المحلات والمطاعم والأنشطة القريبة في مصر.',
    keywords: 'عن من مكانك, منصة من مكانك, دليل المحلات في مصر',
    canonicalPath: '/about',
  },
};

const upsertMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertPropertyMeta = (property: string, content: string) => {
  let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertCanonical = (href: string) => {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', href);
};

const upsertJsonLd = (id: string, json: unknown) => {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(json);
};

const removeJsonLd = (id: string) => {
  const script = document.getElementById(id);
  if (script) script.remove();
};

const RouteSeoManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const path = String(location?.pathname || '/');
    const seo = routeSeoMap[path] || routeSeoMap['/'];
    const canonicalUrl = `${SITE_URL}${seo.canonicalPath}`;

    document.title = seo.title;
    upsertMeta('description', seo.description);
    upsertMeta('keywords', seo.keywords);
    upsertMeta('robots', 'index, follow, max-image-preview:large');

    upsertPropertyMeta('og:type', 'website');
    upsertPropertyMeta('og:site_name', SITE_NAME);
    upsertPropertyMeta('og:title', seo.title);
    upsertPropertyMeta('og:description', seo.description);
    upsertPropertyMeta('og:url', canonicalUrl);
    upsertPropertyMeta('og:image', DEFAULT_IMAGE);

    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', seo.title);
    upsertMeta('twitter:description', seo.description);
    upsertMeta('twitter:image', DEFAULT_IMAGE);

    upsertCanonical(canonicalUrl);

    upsertJsonLd('website-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      alternateName: ['منمكانك', 'مكانك', 'دليل المحلات', 'دليل المطاعم', 'دليل الأنشطة'],
      url: SITE_URL,
      inLanguage: 'ar',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/map?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });

    upsertJsonLd('organization-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: DEFAULT_IMAGE,
    });

    if (seo.includeFaqSchema) {
      upsertJsonLd('faq-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'يعني ايه من مكانك؟',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'من مكانك منصة دليل تساعدك تكتشف المحلات والمطاعم والأنشطة القريبة منك بسهولة.',
            },
          },
          {
            '@type': 'Question',
            name: 'هل من مكانك هو دليل المحلات والمطاعم؟',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'نعم، من مكانك يوفر دليل المحلات ودليل المطاعم ودليل الأنشطة في مكان واحد.',
            },
          },
        ],
      });
    } else {
      removeJsonLd('faq-jsonld');
    }
  }, [location.pathname]);

  return null;
};

export default RouteSeoManager;
