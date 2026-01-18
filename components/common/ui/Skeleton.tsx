import React from 'react';

type SkeletonProps = {
  className?: string;
};

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />;
};

export default Skeleton;
