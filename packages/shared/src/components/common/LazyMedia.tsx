import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  loadingStrategy?: 'lazy' | 'eager';
  threshold?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E',
  className = '',
  loadingStrategy = 'lazy',
  threshold = 0.1,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(loadingStrategy === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (loadingStrategy === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loadingStrategy, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <img
      ref={imgRef}
      src={isInView ? src : placeholder}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      loading={loadingStrategy}
      onLoad={handleLoad}
      {...props}
    />
  );
};

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  className?: string;
  loadingStrategy?: 'lazy' | 'eager';
  threshold?: number;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export const LazyVideo: React.FC<LazyVideoProps> = ({
  src,
  poster,
  className = '',
  loadingStrategy = 'lazy',
  threshold = 0.1,
  autoPlay = false,
  muted = true,
  loop = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(loadingStrategy === 'eager');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (loadingStrategy === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [loadingStrategy, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <video
      ref={videoRef}
      src={isInView ? src : undefined}
      poster={poster}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      preload={isInView ? 'auto' : 'none'}
      onLoadedData={handleLoad}
      autoPlay={isInView && autoPlay}
      muted={muted}
      loop={loop}
      {...props}
    />
  );
};

interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  breakpoints?: { width: number; url: string }[];
  loadingStrategy?: 'lazy' | 'eager';
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className = '',
  breakpoints = [],
  loadingStrategy = 'lazy',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const srcSet = breakpoints.length > 0
    ? breakpoints.map(bp => `${bp.url} ${bp.width}w`).join(', ')
    : undefined;

  return (
    <img
      ref={imgRef}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      loading={loadingStrategy}
      onLoad={handleLoad}
    />
  );
};
