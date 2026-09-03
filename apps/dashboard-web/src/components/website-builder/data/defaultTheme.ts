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
};

/**
 * Returns fully resolved, non-partial DesignTokens for any preset key with guaranteed fallbacks
 */
export const getMergedThemeTokens = (presetKey?: string): DesignTokens => {
  const preset = presetKey && themePresets[presetKey] ? themePresets[presetKey].tokens : {};
  return {
    ...defaultDesignTokens,
    ...preset,
    colors: {
      ...defaultDesignTokens.colors,
      ...(preset.colors || {}),
    },
    typography: {
      ...defaultDesignTokens.typography,
      ...(preset.typography || {}),
    },
    radius: {
      ...defaultDesignTokens.radius,
      ...(preset.radius || {}),
    },
    shadows: {
      ...defaultDesignTokens.shadows,
      ...(preset.shadows || {}),
    },
    spacingUnit: preset.spacingUnit || defaultDesignTokens.spacingUnit,
  };
};

