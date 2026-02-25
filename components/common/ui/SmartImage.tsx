import React, { useEffect, useMemo, useState } from 'react';
import Skeleton from './Skeleton';

/**
 * SmartImage Component
 * ⚡ Performance Optimized:
 * - Uses native lazy loading by default
 * - Decodes images asynchronously to prevent main-thread blocking
 * - Displays a Skeleton placeholder until the image is fully loaded
 */
type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
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
  onClick,
  imgProps,
}) => {
  const normalizedSrc = useMemo(() => String(src || '').trim(), [src]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
  }, [normalizedSrc]);

  if (!normalizedSrc) {
    return <div className={`bg-slate-100 ${className}`} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!ready && <Skeleton className="absolute inset-0 rounded-none bg-slate-100" />}
      <img
        src={normalizedSrc}
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
