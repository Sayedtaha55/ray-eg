import React, { useState, useCallback } from 'react';
import {
  buildPictureSources,
  getOptimizedImageUrl,
  DEFAULT_RESPONSIVE_SIZES,
} from '@/lib/image-utils';

export interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  variant?: 'opt' | 'md' | 'thumb';
  usePicture?: boolean;
  sizes?: string;
  placeholder?: string;
  fadeIn?: number;
  lazy?: boolean;
  aspectRatio?: string;
  fallbackSrc?: string;
}
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  variant = 'opt',
  usePicture = true,
  sizes = DEFAULT_RESPONSIVE_SIZES,
  placeholder,
  fadeIn = 300,
  lazy = true,
  aspectRatio,
  fallbackSrc,
  className = '',
  alt = '',
  style,
  loading: loadingProp,
  ...imgProps
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    setError(false);
  }, []);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setError(true);
      if (fallbackSrc) {
        (e.target as HTMLImageElement).src = fallbackSrc;
      }
    },
    [fallbackSrc],
  );

  const resolvedSrc = getOptimizedImageUrl(src, variant);
  const pictureSources = usePicture ? buildPictureSources(src) : [];

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...(aspectRatio ? { aspectRatio } : {}),
    ...style,
  };

  const imgStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: loaded ? 1 : 0,
    transition: `opacity ${fadeIn}ms ease-in-out`,
  };

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'blur(20px)',
    transform: 'scale(1.1)',
    opacity: loaded ? 0 : 1,
    transition: `opacity ${fadeIn}ms ease-in-out`,
  };

  const renderImg = (additionalProps: Partial<React.ImgHTMLAttributes<HTMLImageElement>> = {}) => (
    <img
      src={error && fallbackSrc ? fallbackSrc : resolvedSrc}
      alt={alt}
      loading={lazy ? 'lazy' : (loadingProp as 'lazy' | 'eager' | undefined)}
      onLoad={handleLoad}
      onError={handleError}
      style={imgStyle}
      sizes={sizes}
      {...imgProps}
      {...additionalProps}
    />
  );

  // No picture support needed or usePicture disabled — plain img
  if (!usePicture || pictureSources.length === 0) {
    if (!aspectRatio && !placeholder) {
      return (
        <>
          {placeholder && (
            <img
              src={placeholder}
              alt=""
              aria-hidden="true"
              style={placeholderStyle}
            />
          )}
          {renderImg({ className, style: style || undefined })}
        </>
      );
    }

    return (
      <div className={className} style={containerStyle}>
        {placeholder && (
          <img
            src={placeholder}
            alt=""
            aria-hidden="true"
            style={placeholderStyle}
          />
        )}
        {renderImg()}
      </div>
    );
  }

  // Full <picture> element with multiple sources
  return (
    <div className={className} style={containerStyle}>
      {placeholder && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          style={placeholderStyle}
        />
      )}
      <picture>
        {pictureSources.map((source) => (
          <source key={source.type} type={source.type} srcSet={source.srcset} sizes={sizes} />
        ))}
        {renderImg()}
      </picture>
    </div>
  );
};

export default React.memo(OptimizedImage);