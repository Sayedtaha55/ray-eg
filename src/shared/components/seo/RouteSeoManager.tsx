import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import i18n from '../../i18n';

type RouteSeo = {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
  includeFaqSchema?: boolean;
};

const SITE_URL = 'https://mnmknk.com';
const SITE_NAME = i18n.t('brand.name');
const DEFAULT_IMAGE = `${SITE_URL}/brand/logo.png`;

const getRouteSeoMap = (): Record<string, RouteSeo> => ({
  '/': {
    title: i18n.t('seo.routes.home.title'),
    description: i18n.t('seo.routes.home.description'),
    keywords: i18n.t('seo.routes.home.keywords'),
    canonicalPath: '/',
  },
  '/dalil': {
    title: i18n.t('seo.routes.dalil.title'),
    description: i18n.t('seo.routes.dalil.description'),
    keywords: i18n.t('seo.routes.dalil.keywords'),
    canonicalPath: '/dalil',
    includeFaqSchema: true,
  },
  '/map': {
    title: i18n.t('seo.routes.map.title'),
    description: i18n.t('seo.routes.map.description'),
    keywords: i18n.t('seo.routes.map.keywords'),
    canonicalPath: '/map',
  },
  '/offers': {
    title: i18n.t('seo.routes.offers.title'),
    description: i18n.t('seo.routes.offers.description'),
    keywords: i18n.t('seo.routes.offers.keywords'),
    canonicalPath: '/offers',
  },
  '/about': {
    title: i18n.t('seo.routes.about.title'),
    description: i18n.t('seo.routes.about.description'),
    keywords: i18n.t('seo.routes.about.keywords'),
    canonicalPath: '/about',
  },
});

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
    const routeSeoMap = getRouteSeoMap();
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
      alternateName: i18n.t('seo.alternateNames', { returnObjects: true }) as string[],
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
            name: i18n.t('seo.faq.q1'),
            acceptedAnswer: {
              '@type': 'Answer',
              text: i18n.t('seo.faq.a1'),
            },
          },
          {
            '@type': 'Question',
            name: i18n.t('seo.faq.q2'),
            acceptedAnswer: {
              '@type': 'Answer',
              text: i18n.t('seo.faq.a2'),
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
