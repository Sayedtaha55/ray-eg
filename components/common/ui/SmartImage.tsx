import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getOptimizedImageUrl } from '@/lib/image-utils';
import Skeleton from './Skeleton';

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  optimizeVariant?: 'opt' | 'md' | 'thumb';
  fallbackSrc?: string;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
  imgProps?: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading' | 'decoding' | 'fetchPriority' | 'style' | 'onClick' | 'className'>;
};

const SmartImage: React.FC<Props> = ({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  style,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  optimizeVariant = 'opt',
  fallbackSrc,
  onClick,
  imgProps,
}) => {
  const normalizedSrc = useMemo(() => String(src || '').trim(), [src]);
  const normalizedFallbackSrc = useMemo(() => String(fallbackSrc || '').trim(), [fallbackSrc]);
  const optimizedSrc = useMemo(
    () => getOptimizedImageUrl(normalizedSrc, optimizeVariant) || normalizedSrc,
    [normalizedSrc, optimizeVariant],
  );
  const holderRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const [ready, setReady] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(optimizedSrc);

  useEffect(() => {
    setReady(false);
    setCurrentSrc(optimizedSrc);
  }, [optimizedSrc]);

  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const target = holderRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '300px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, normalizedSrc]);

  if (!normalizedSrc) {
    return <div className={`bg-slate-100 ${className}`} />;
  }

  return (
    <div ref={holderRef} className={`relative overflow-hidden ${className}`}>
      {!ready && <Skeleton className="absolute inset-0 rounded-none bg-slate-100" />}
      <img
        src={isInView ? currentSrc : undefined}
        alt={alt}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority as any}
        {...(imgProps as any)}
        className={`w-full h-full ${imgClassName} ${ready ? 'opacity-100' : 'opacity-0'}`}
        style={{ ...style, transitionProperty: 'opacity', transitionDuration: '350ms' }}
        onLoad={(e) => {
          (imgProps as any)?.onLoad?.(e);
          setReady(true);
        }}
        onError={(e) => {
          (imgProps as any)?.onError?.(e);
          if (currentSrc !== normalizedSrc && normalizedSrc) {
            setCurrentSrc(normalizedSrc);
            return;
          }
          if (normalizedFallbackSrc && currentSrc !== normalizedFallbackSrc) {
            setCurrentSrc(normalizedFallbackSrc);
            return;
          }
          setReady(true);
        }}
        onClick={(e) => {
          (imgProps as any)?.onClick?.(e);
          onClick?.(e);
        }}
      />
    </div>
  );
};

export default SmartImage;
