'use client';

import React, { useEffect, useRef, useState } from 'react';

const VIDEOS = [
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_030107_874273ea-684a-4e90-bb96-8fdfde48d53d.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_032424_3c9c2a9d-807b-4482-80e6-dd6d9dfd4545.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260627_094019_4214ea73-b963-46a4-8327-61489192de99.mp4',
];

interface Props {
  videoIndex?: number;
  overlayClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function FooterVideoBackground({
  videoIndex = 0,
  overlayClassName = 'bg-black/60',
  className = '',
  children,
}: Props) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        {VIDEOS.map((src, idx) => (
          <video
            key={idx}
            ref={(el) => { videoRefs.current[idx] = el; }}
            src={mounted ? src : undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              idx === videoIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className={`absolute inset-0 ${overlayClassName}`} />
      </div>
      {children && <div className="relative z-10 w-full">{children}</div>}
    </div>
  );
}
