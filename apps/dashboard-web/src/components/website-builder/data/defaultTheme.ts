import { DesignTokens } from '../types/builder';

export const defaultDesignTokens: DesignTokens = {
  colors: {
    primary: '#1d4ed8', // Royal Blue
    primaryHover: '#1e40af',
    secondary: '#0f172a', // Deep Slate
    accent: '#06b6d4', // Modern Cyan/Teal
    background: '#ffffff',
    surface: '#f8fafc',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  typography: {
    fontHeading: 'Tajawal, sans-serif',
    fontBody: 'Cairo, sans-serif',
    scaleRatio: 1.25,
    baseFontSize: '16px',
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
    glow: '0 0 20px rgba(29, 78, 216, 0.25)',
  },
  spacingUnit: 4,
};

export const themePresets: Record<string, { name: string; nameAr: string; tokens: Partial<DesignTokens> }> = {
  modernBlue: {
    name: 'Modern Tech Blue',
    nameAr: 'أزرق تقني عصري',
    tokens: defaultDesignTokens,
  },
  luxuryGold: {
    name: 'Luxury Obsidian & Gold',
    nameAr: 'فخامة الأسود والذهبي',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#b45309',
        primaryHover: '#92400e',
        secondary: '#18181b',
        accent: '#d97706',
        surface: '#fafaf9',
        border: '#e7e5e4',
      },
      typography: {
        fontHeading: 'Amiri, serif',
        fontBody: 'Cairo, sans-serif',
        scaleRatio: 1.33,
        baseFontSize: '16px',
      },
    },
  },
  automotiveSpeed: {
    name: 'Automotive Carbon',
    nameAr: 'كربون ورياضي للسيارات',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#dc2626',
        primaryHover: '#b91c1c',
        secondary: '#09090b',
        accent: '#f97316',
        surface: '#f4f4f5',
        border: '#e4e4e7',
      },
      radius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
    },
  },
  realEstateEmerald: {
    name: 'Real Estate Emerald',
    nameAr: 'زمردي راقي للعقارات',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#047857',
        primaryHover: '#065f46',
        secondary: '#064e3b',
        accent: '#10b981',
        surface: '#f0fdf4',
        border: '#d1fae5',
      },
    },
  },
  clinicalClean: {
    name: 'Clinical Teal',
    nameAr: 'سماوي ونقي للمراكز الطبية',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#0891b2',
        primaryHover: '#0e7490',
        secondary: '#164e63',
        accent: '#38bdf8',
        surface: '#f0fdfa',
        border: '#ccfbf1',
      },
    },
  },
  royalPurple: {
    name: 'Royal Purple & Violet',
    nameAr: 'بنفسجي ملكي وإبداعي',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#7c3aed',
        primaryHover: '#6d28d9',
        secondary: '#1e1b4b',
        accent: '#c084fc',
        surface: '#faf5ff',
        border: '#f3e8ff',
      },
    },
  },
  restaurantWarm: {
    name: 'Warm Gourmet Amber',
    nameAr: 'برتقالي ودافئ للمطاعم والكافيهات',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#ea580c', // Orange Red
        primaryHover: '#c2410c',
        secondary: '#1c1917', // Warm Stone Dark
        accent: '#f59e0b', // Amber
        surface: '#fffbeb',
        border: '#fef3c7',
        textPrimary: '#1c1917',
      },
      typography: {
        fontHeading: 'Tajawal, sans-serif',
        fontBody: 'Cairo, sans-serif',
        scaleRatio: 1.25,
        baseFontSize: '16px',
      },
    },
  },
  groceryFresh: {
    name: 'Fresh Market Green',
    nameAr: 'أخضر ليموني منعش للسوبرماركت والتموين',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#16a34a',
        primaryHover: '#15803d',
        secondary: '#14532d',
        accent: '#84cc16',
        surface: '#f0fdf4',
        border: '#dcfce7',
      },
    },
  },
  fashionChic: {
    name: 'Fashion Rose & Noir',
    nameAr: 'وردي عصري وأنيق للأزياء والملابس',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#e11d48',
        primaryHover: '#be123c',
        secondary: '#0f172a',
        accent: '#fb7185',
        surface: '#fff1f2',
        border: '#ffe4e6',
      },
    },
  },
  goldRoyalty: {
    name: 'Gold & Black Royalty',
    nameAr: 'ذهبي وأسود ملكي للذهب والمجوهرات والساعات',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#d97706',
        primaryHover: '#b45309',
        secondary: '#18181b',
        accent: '#f59e0b',
        surface: '#fffdf5',
        border: '#fef3c7',
        textPrimary: '#18181b',
      },
      typography: {
        fontHeading: 'Amiri, serif',
        fontBody: 'Cairo, sans-serif',
        scaleRatio: 1.33,
        baseFontSize: '16px',
      },
    },
  },
  beautyBlush: {
    name: 'Beauty Blush & Lavender',
    nameAr: 'زهري ناعم ولافندر للصالونات ومراكز التجميل',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#db2777',
        primaryHover: '#be185d',
        secondary: '#831843',
        accent: '#f472b6',
        surface: '#fdf2f8',
        border: '#fce7f3',
      },
    },
  },
  gymEnergetic: {
    name: 'High-Octane Gym Yellow & Carbon',
    nameAr: 'أصفر نيون وأسود كربوني للجيم واللياقة',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#eab308',
        primaryHover: '#ca8a04',
        secondary: '#09090b',
        accent: '#facc15',
        surface: '#fafaf9',
        border: '#e7e5e4',
        textPrimary: '#09090b',
      },
      radius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
    },
  },
  nurseryGreen: {
    name: 'Botanical Oasis Green',
    nameAr: 'أخضر نباتي وطبيعي للمشاتل والزراعة',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#059669',
        primaryHover: '#047857',
        secondary: '#064e3b',
        accent: '#34d399',
        surface: '#ecfdf5',
        border: '#d1fae5',
      },
    },
  },
  techCyan: {
    name: 'Cyber Cyan & Electric Blue',
    nameAr: 'أزرق سيان وتقني للإلكترونيات والموبايل',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#0284c7',
        primaryHover: '#0369a1',
        secondary: '#0c4a6e',
        accent: '#38bdf8',
        surface: '#f0f9ff',
        border: '#e0f2fe',
      },
    },
  },
  homeServiceOrange: {
    name: 'Home Service Amber & Steel',
    nameAr: 'برتقالي ورمادي فولاذي للخدمات المنزلية والصيانة',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#f97316',
        primaryHover: '#ea580c',
        secondary: '#1e293b',
        accent: '#fb923c',
        surface: '#fff7ed',
        border: '#ffedd5',
      },
    },
  },
  travelAzure: {
    name: 'Travel Azure Ocean',
    nameAr: 'أزرق سماوي وبحري للسياحة والسفر',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#0284c7',
        primaryHover: '#0369a1',
        secondary: '#082f49',
        accent: '#06b6d4',
        surface: '#f0fdfa',
        border: '#ccfbf1',
      },
    },
  },
  legalNavy: {
    name: 'Prestigious Legal Navy',
    nameAr: 'كحلي وذهبي وقور للمحاماة والاستشارات المهنية',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#1e3a8a',
        primaryHover: '#172554',
        secondary: '#0f172a',
        accent: '#d97706',
        surface: '#f8fafc',
        border: '#e2e8f0',
      },
    },
  },
  factoryIndustrial: {
    name: 'Industrial Charcoal & Amber',
    nameAr: 'رمادي حديدي وبرتقالي صناعي للمصانع والإنتاج',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#475569',
        primaryHover: '#334155',
        secondary: '#0f172a',
        accent: '#f97316',
        surface: '#f8fafc',
        border: '#e2e8f0',
      },
    },
  },
  academyIndigo: {
    name: 'Academic Indigo & Violet',
    nameAr: 'نيلي وأكاديمي متقدم للتعليم والتدريب',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#4f46e5',
        primaryHover: '#4338ca',
        secondary: '#1e1b4b',
        accent: '#06b6d4',
        surface: '#eef2ff',
        border: '#e0e7ff',
      },
      typography: {
        fontHeading: 'Tajawal, sans-serif',
        fontBody: 'Cairo, sans-serif',
        scaleRatio: 1.25,
        baseFontSize: '16px',
      },
    },
  },
  furnitureWarm: {
    name: 'Warm Oak & Luxury Ochre',
    nameAr: 'خشبي وخردلي راقي للمفروشات والديكور',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#b45309',
        primaryHover: '#92400e',
        secondary: '#292524',
        accent: '#d97706',
        surface: '#fffbeb',
        border: '#fef3c7',
      },
    },
  },
  flowerRose: {
    name: 'Rose Romance & Botanical Emerald',
    nameAr: 'وردي رومانسي وزيتي للزهور والهدايا',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#e11d48',
        primaryHover: '#be123c',
        secondary: '#1c1917',
        accent: '#059669',
        surface: '#fff1f2',
        border: '#ffe4e6',
      },
    },
  },
  accountingSlate: {
    name: 'Executive Slate & Financial Blue',
    nameAr: 'كحلي وفيروزي مالي للمحاسبة والضرائب',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#0f766e',
        primaryHover: '#115e59',
        secondary: '#042f2e',
        accent: '#0d9488',
        surface: '#f0fdfa',
        border: '#ccfbf1',
      },
    },
  },
  rentalAmber: {
    name: 'Velocity Amber & Dark Carbon',
    nameAr: 'كهرماني سريع لتأجير السيارات',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#d97706',
        primaryHover: '#b45309',
        secondary: '#18181b',
        accent: '#eab308',
        surface: '#fbfbfb',
        border: '#f4f4f5',
      },
    },
  },

  // ------------------------------------------------------------------
  // Regional presets — Egyptian & Saudi/Gulf character
  // ------------------------------------------------------------------
  egyptianNile: {
    name: 'Egyptian Nile Blue & Pharaonic Gold',
    nameAr: 'أزرق النيل والذهبي الفرعوني',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#0e7490',
        primaryHover: '#155e75',
        secondary: '#083344',
        accent: '#d4a017',
        surface: '#ecfeff',
        border: '#a5f3fc',
      },
      typography: {
        fontHeading: 'Cairo, Tajawal, sans-serif',
        fontBody: 'Cairo, sans-serif',
        scaleRatio: 1.25,
        baseFontSize: '16px',
      },
      radius: { sm: '8px', md: '14px', lg: '20px', xl: '28px', full: '9999px' },
      shadows: {
        sm: '0 1px 2px rgba(8, 51, 68, 0.06)',
        md: '0 4px 10px rgba(8, 51, 68, 0.10), 0 2px 4px rgba(8, 51, 68, 0.05)',
        lg: '0 12px 24px rgba(8, 51, 68, 0.12), 0 4px 8px rgba(8, 51, 68, 0.05)',
        glow: '0 0 24px rgba(212, 160, 23, 0.35)',
      },
    },
  },
  egyptianPapyrus: {
    name: 'Egyptian Papyrus & Terracotta',
    nameAr: 'بردي وطيني مصري دافئ',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#b45309',
        primaryHover: '#92400e',
        secondary: '#292018',
        accent: '#0e7490',
        background: '#fdf8f1',
        surface: '#f7efe3',
        textPrimary: '#292018',
        textSecondary: '#57534e',
        border: '#e7d9c5',
      },
      typography: {
        fontHeading: 'Amiri, Cairo, serif',
        fontBody: 'Cairo, sans-serif',
        scaleRatio: 1.33,
        baseFontSize: '16px',
      },
      radius: { sm: '6px', md: '12px', lg: '18px', xl: '26px', full: '9999px' },
      shadows: {
        sm: '0 1px 2px rgba(41, 32, 24, 0.08)',
        md: '0 4px 10px rgba(41, 32, 24, 0.12), 0 2px 4px rgba(41, 32, 24, 0.06)',
        lg: '0 12px 24px rgba(41, 32, 24, 0.14), 0 4px 8px rgba(41, 32, 24, 0.06)',
        glow: '0 0 22px rgba(180, 83, 9, 0.30)',
      },
    },
  },
  saudiHeritage: {
    name: 'Saudi Heritage Green & Gold',
    nameAr: 'أخضر تراثي سعودي وذهبي',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#065f46',
        primaryHover: '#064e3b',
        secondary: '#022c22',
        accent: '#c9a227',
        surface: '#f0fdf4',
        border: '#bbf7d0',
      },
      typography: {
        fontHeading: 'Amiri, Tajawal, serif',
        fontBody: 'Almarai, Cairo, sans-serif',
        scaleRatio: 1.33,
        baseFontSize: '16px',
      },
      radius: { sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px' },
      shadows: {
        sm: '0 1px 2px rgba(2, 44, 34, 0.08)',
        md: '0 4px 10px rgba(2, 44, 34, 0.12), 0 2px 4px rgba(2, 44, 34, 0.06)',
        lg: '0 12px 24px rgba(2, 44, 34, 0.16), 0 4px 8px rgba(2, 44, 34, 0.06)',
        glow: '0 0 24px rgba(201, 162, 39, 0.35)',
      },
    },
  },
  saudiModern: {
    name: 'Saudi Modern Sand & Emerald',
    nameAr: 'رملي عصري خليجي وزمردي',
    tokens: {
      colors: {
        ...defaultDesignTokens.colors,
        primary: '#047857',
        primaryHover: '#059669',
        secondary: '#1c1917',
        accent: '#d6b68a',
        background: '#fffdf9',
        surface: '#faf6ef',
        textPrimary: '#1c1917',
        border: '#ede4d3',
      },
      typography: {
        fontHeading: 'Tajawal, IBM Plex Sans Arabic, sans-serif',
        fontBody: 'IBM Plex Sans Arabic, Cairo, sans-serif',
        scaleRatio: 1.25,
        baseFontSize: '16px',
      },
      radius: { sm: '10px', md: '16px', lg: '24px', xl: '32px', full: '9999px' },
      shadows: {
        sm: '0 1px 3px rgba(28, 25, 23, 0.07)',
        md: '0 6px 14px rgba(28, 25, 23, 0.10), 0 2px 5px rgba(28, 25, 23, 0.05)',
        lg: '0 16px 30px rgba(28, 25, 23, 0.13), 0 5px 10px rgba(28, 25, 23, 0.05)',
        glow: '0 0 26px rgba(4, 120, 87, 0.30)',
      },
    },
  },
};

// ------------------------------------------------------------------
// Preset polish — guarantees every preset carries a complete, tuned
// typography/radius/shadows set matching its character (previously most
// presets overrode colors only).
// ------------------------------------------------------------------
type PresetPolish = {
  typography?: Partial<DesignTokens['typography']>;
  radius?: DesignTokens['radius'];
  shadows?: DesignTokens['shadows'];
};

const serifHeading = 'Amiri, Cairo, serif';
const sharpRadius: DesignTokens['radius'] = { sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' };
const softRadius: DesignTokens['radius'] = { sm: '10px', md: '16px', lg: '24px', xl: '32px', full: '9999px' };
const boldShadows: DesignTokens['shadows'] = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.10)',
  md: '0 6px 14px rgba(0, 0, 0, 0.16), 0 2px 5px rgba(0, 0, 0, 0.08)',
  lg: '0 16px 34px rgba(0, 0, 0, 0.22), 0 6px 12px rgba(0, 0, 0, 0.08)',
  glow: '0 0 26px rgba(0, 0, 0, 0.35)',
};
const elegantShadows: DesignTokens['shadows'] = {
  sm: '0 1px 2px rgba(24, 24, 27, 0.06)',
  md: '0 6px 16px rgba(24, 24, 27, 0.10), 0 2px 6px rgba(24, 24, 27, 0.05)',
  lg: '0 18px 36px rgba(24, 24, 27, 0.14), 0 6px 12px rgba(24, 24, 27, 0.06)',
  glow: '0 0 28px rgba(217, 119, 6, 0.28)',
};

export const PRESET_POLISH: Record<string, PresetPolish> = {
  modernBlue: {
    shadows: {
      sm: '0 1px 2px rgba(29, 78, 216, 0.06)',
      md: '0 4px 10px rgba(29, 78, 216, 0.10), 0 2px 4px rgba(29, 78, 216, 0.05)',
      lg: '0 14px 28px rgba(29, 78, 216, 0.14), 0 5px 10px rgba(29, 78, 216, 0.06)',
      glow: '0 0 24px rgba(29, 78, 216, 0.30)',
    },
  },
  luxuryGold: { radius: softRadius, shadows: elegantShadows },
  automotiveSpeed: { typography: { fontHeading: 'Tajawal, sans-serif', scaleRatio: 1.2 }, shadows: boldShadows },
  realEstateEmerald: { typography: { fontHeading: 'Tajawal, sans-serif' }, shadows: elegantShadows },
  clinicalClean: { typography: { fontHeading: 'IBM Plex Sans Arabic, sans-serif' }, radius: softRadius },
  royalPurple: { typography: { fontHeading: 'Tajawal, sans-serif', scaleRatio: 1.3 }, radius: softRadius },
  restaurantWarm: { radius: softRadius },
  groceryFresh: { typography: { fontHeading: 'Almarai, sans-serif' }, radius: softRadius },
  fashionChic: { typography: { fontHeading: serifHeading, scaleRatio: 1.33 }, radius: softRadius },
  goldRoyalty: { radius: softRadius, shadows: elegantShadows },
  beautyBlush: { typography: { fontHeading: 'Tajawal, sans-serif' }, radius: softRadius },
  gymEnergetic: { typography: { fontHeading: 'Tajawal, sans-serif', scaleRatio: 1.2 }, shadows: boldShadows },
  nurseryGreen: { typography: { fontHeading: 'Almarai, sans-serif' }, radius: softRadius },
  techCyan: { typography: { fontHeading: 'IBM Plex Sans Arabic, sans-serif', scaleRatio: 1.2 } },
  homeServiceOrange: { typography: { fontHeading: 'Tajawal, sans-serif' } },
  travelAzure: { radius: softRadius },
  legalNavy: { typography: { fontHeading: serifHeading, scaleRatio: 1.2 } },
  factoryIndustrial: { radius: sharpRadius, shadows: boldShadows },
  academyIndigo: { radius: softRadius },
  furnitureWarm: { typography: { fontHeading: serifHeading, scaleRatio: 1.33 }, radius: softRadius, shadows: elegantShadows },
  flowerRose: { typography: { fontHeading: 'Tajawal, sans-serif' }, radius: softRadius },
  accountingSlate: { typography: { fontHeading: 'IBM Plex Sans Arabic, sans-serif' } },
  rentalAmber: { radius: sharpRadius, shadows: boldShadows },
};

/**
 * Returns fully resolved, non-partial DesignTokens for any preset key with
 * guaranteed fallbacks. Layers: defaults → preset tokens → per-preset polish
 * (typography/radius/shadows tuning) so every theme ships complete.
 */
export const getMergedThemeTokens = (presetKey?: string): DesignTokens => {
  const preset = presetKey && themePresets[presetKey] ? themePresets[presetKey].tokens : {};
  const polish = presetKey ? PRESET_POLISH[presetKey] : undefined;
  return {
    ...defaultDesignTokens,
    ...preset,
    colors: {
      ...defaultDesignTokens.colors,
      ...(preset.colors || {}),
    },
    typography: {
      ...defaultDesignTokens.typography,
      ...(polish?.typography || {}),
      ...(preset.typography || {}),
    },
    radius: {
      ...defaultDesignTokens.radius,
      ...(polish?.radius || {}),
      ...(preset.radius || {}),
    },
    shadows: {
      ...defaultDesignTokens.shadows,
      ...(polish?.shadows || {}),
      ...(preset.shadows || {}),
    },
    spacingUnit: preset.spacingUnit || defaultDesignTokens.spacingUnit,
  };
};

