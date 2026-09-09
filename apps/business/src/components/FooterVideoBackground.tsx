'use client';

import React from 'react';

/**
 * سابقًا كان يعرض فيديوهات خلفية.
 * الآن — خلفية سوداء ثابتة (سواداء) تمامًا كما طلبت.
 */
interface Props {
  overlayClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function FooterVideoBackground({
  overlayClassName,
  className = '',
  children,
}: Props) {
  return (
    <div className={`relative w-full overflow-hidden bg-black text-white ${className}`}>
      {overlayClassName && <div className={`absolute inset-0 ${overlayClassName}`} />}
      {children && <div className={`relative ${overlayClassName ? 'z-10' : 'z-0'} w-full`}>{children}</div>}
    </div>
  );
}

