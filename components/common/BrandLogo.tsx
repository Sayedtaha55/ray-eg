import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type BrandVariant = 'public' | 'business' | 'admin';

type Props = {
  variant?: BrandVariant;
  name?: string;
  suffix?: string;
  showName?: boolean;
  logoSrc?: string;
  iconOnly?: boolean;
};

const BrandLogo: React.FC<Props> = ({
  variant = 'public',
  name = 'MNMKNK',
  suffix,
  showName = true,
  logoSrc = '/brand/logo.png',
  iconOnly = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const styles = useMemo(() => {
    if (variant === 'admin') {
      return {
        container: 'flex items-center gap-3',
        iconWrap:
          'w-10 h-10 bg-[#BD00FF] flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(189,0,255,0.4)] overflow-hidden',
        text: 'text-2xl font-black tracking-tighter uppercase',
        letter: 'text-white font-black text-xl',
        image: 'w-full h-full object-contain',
      };
    }

    if (variant === 'business') {
      return {
        container: 'flex items-center gap-2 md:gap-3',
        iconWrap:
          'w-8 h-8 md:w-10 md:h-10 bg-[#00E5FF] flex items-center justify-center rounded-xl shadow-lg shadow-cyan-500/20 overflow-hidden',
        text: 'text-xl md:text-2xl font-black tracking-tighter uppercase',
        letter: 'text-slate-900 font-black text-xl md:text-2xl leading-none',
        image: 'w-full h-full object-contain',
      };
    }

    return {
      container: 'flex items-center gap-2 md:gap-4',
      iconWrap:
        'w-10 h-10 md:w-16 md:h-16 bg-[#00E5FF] flex items-center justify-center rounded-xl md:rounded-[1.5rem] shadow-[0_15px_35px_rgba(0,229,255,0.3)] transition-all duration-500 overflow-hidden',
      text: 'text-xl md:text-3xl font-black tracking-tighter uppercase hidden sm:block',
      letter: 'text-[#1A1A1A] font-black text-xl md:text-4xl tracking-tighter',
      image: 'w-full h-full object-contain',
    };
  }, [variant]);

  const nameNode = showName ? (
    <span className={styles.text}>
      {name}
      {suffix ? <span className="text-[#BD00FF]"> {suffix}</span> : null}
    </span>
  ) : null;

  const icon = !imgError ? (
    <img src={logoSrc} className={styles.image} onError={() => setImgError(true)} alt={name} />
  ) : (
    <span className={styles.letter}>M</span>
  );

  if (variant === 'public') {
    if (iconOnly) {
      return (
        <motion.div whileHover={{ scale: 1.1, rotate: -2 }} className={styles.iconWrap}>
          {icon}
        </motion.div>
      );
    }
    return (
      <div className={styles.container}>
        <motion.div whileHover={{ scale: 1.1, rotate: -2 }} className={styles.iconWrap}>
          {icon}
        </motion.div>
        {nameNode}
      </div>
    );
  }

  if (iconOnly) {
    return <div className={styles.iconWrap}>{icon}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.iconWrap}>{icon}</div>
      {nameNode}
    </div>
  );
};

export default BrandLogo;
