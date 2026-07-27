import { DesignTokens, DEFAULT_DESIGN_TOKENS } from '@/types/pageSchema';

// ─── Maps token values → CSS variable values ──────────────────

const RADIUS_MAP: Record<string, string> = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
};

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
};

const SPACING_MAP: Record<string, string> = {
  compact: '1.5rem',
  normal: '3rem',
  loose: '5rem',
  tight: '0.5rem',
  wide: '2rem',
  none: '0px',
  sm: '0.75rem',
  md: '1.5rem',
  lg: '3rem',
};

const ANIMATION_MAP: Record<string, string> = {
  none: 'none',
  fade: 'fadeIn 0.4s ease-out',
  'slide-up': 'slideUp 0.5s ease-out',
  'slide-right': 'slideRight 0.5s ease-out',
  scale: 'scaleIn 0.4s ease-out',
};

const DURATION_MAP: Record<string, string> = {
  fast: '0.2s',
  normal: '0.4s',
  slow: '0.6s',
};

const HEADING_SIZE_MAP: Record<string, string> = {
  sm: '1.5rem',
  base: '1.875rem',
  lg: '2.25rem',
  xl: '3rem',
};

const TEXT_SIZE_MAP: Record<string, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
};

const FONT_WEIGHT_MAP: Record<string, string> = {
  normal: '400',
  medium: '500',
  bold: '700',
  black: '900',
};

// ─── Convert DesignTokens → CSS variable object ───────────────

export function designTokensToCssVars(tokens: DesignTokens): Record<string, string> {
  const t = { ...DEFAULT_DESIGN_TOKENS, ...tokens };
  const vars: Record<string, string> = {};

  // Colors
  vars['--brand-primary'] = t.colors.primary;
  vars['--brand-secondary'] = t.colors.secondary;
  vars['--brand-accent'] = t.colors.accent;
  vars['--brand-bg'] = t.colors.background;
  vars['--brand-surface'] = t.colors.surface;
  vars['--brand-text'] = t.colors.text;
  vars['--brand-text-muted'] = t.colors.textMuted;
  vars['--brand-header-bg'] = t.colors.headerBg;
  vars['--brand-header-text'] = t.colors.headerText;
  vars['--brand-footer-bg'] = t.colors.footerBg;
  vars['--brand-footer-text'] = t.colors.footerText;

  // Typography
  vars['--brand-font-family'] = t.typography.fontFamily;
  vars['--brand-heading-family'] = t.typography.headingFamily;
  vars['--brand-heading-size'] = HEADING_SIZE_MAP[t.typography.headingSize] || '3rem';
  vars['--brand-text-size'] = TEXT_SIZE_MAP[t.typography.textSize] || '0.875rem';
  vars['--brand-font-weight'] = FONT_WEIGHT_MAP[t.typography.fontWeight] || '700';

  // Spacing
  vars['--brand-section-gap'] = SPACING_MAP[t.spacing.sectionGap] || '3rem';
  vars['--brand-item-gap'] = SPACING_MAP[t.spacing.itemGap] || '1rem';
  vars['--brand-page-padding'] = SPACING_MAP[t.spacing.pagePadding] || '1.5rem';

  // Radius
  vars['--brand-radius-card'] = RADIUS_MAP[t.radius.card] || '24px';
  vars['--brand-radius-button'] = RADIUS_MAP[t.radius.button] || '24px';
  vars['--brand-radius-input'] = RADIUS_MAP[t.radius.input] || '16px';

  // Shadow
  vars['--brand-shadow-card'] = SHADOW_MAP[t.shadow.card] || SHADOW_MAP.md;
  vars['--brand-shadow-button'] = SHADOW_MAP[t.shadow.button] || SHADOW_MAP.sm;

  // Animation
  vars['--brand-animation'] = ANIMATION_MAP[t.animation.entrance] || ANIMATION_MAP.fade;
  vars['--brand-animation-duration'] = DURATION_MAP[t.animation.duration] || '0.4s';

  // Button style
  vars['--brand-button-shape'] = t.buttonStyle.shape;
  vars['--brand-button-size'] = t.buttonStyle.size;
  vars['--brand-button-full-width'] = t.buttonStyle.fullWidth ? '100%' : 'auto';

  // Card style
  vars['--brand-card-layout'] = t.cardStyle.layout;
  vars['--brand-card-aspect'] = t.cardStyle.imageAspect;
  vars['--brand-card-shadow'] = t.cardStyle.showShadow ? 'var(--brand-shadow-card)' : 'none';
  vars['--brand-card-border'] = t.cardStyle.showBorder ? '1px solid rgba(0,0,0,0.08)' : 'none';

  return vars;
}

// ─── Apply CSS vars to a DOM element ──────────────────────────

export function applyDesignTokensToElement(
  element: HTMLElement,
  tokens: DesignTokens,
) {
  const vars = designTokensToCssVars(tokens);
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}

// ─── Apply DesignTokens to the document root ──────────────────

export function applyDesignTokensToRoot(tokens: DesignTokens) {
  const root = document.documentElement;
  applyDesignTokensToElement(root, tokens);
}

// ─── Generate a <style> tag with keyframe animations ──────────

export function getAnimationKeyframes(): string {
  return `
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `.trim();
}

// ─── React hook helper: apply tokens and cleanup ──────────────

import { useEffect } from 'react';

export function useDesignTokens(tokens: DesignTokens | null | undefined) {
  useEffect(() => {
    if (!tokens) return;
    applyDesignTokensToRoot(tokens);

    // Inject keyframes once
    const existing = document.getElementById('brand-animation-keyframes');
    if (!existing) {
      const style = document.createElement('style');
      style.id = 'brand-animation-keyframes';
      style.textContent = getAnimationKeyframes();
      document.head.appendChild(style);
    }
  }, [tokens]);
}

// ─── Merge partial tokens with defaults ───────────────────────

export function mergeDesignTokens(
  base: DesignTokens,
  partial?: Partial<DesignTokens>,
): DesignTokens {
  if (!partial) return base;
  return {
    colors: { ...base.colors, ...(partial.colors || {}) },
    typography: { ...base.typography, ...(partial.typography || {}) },
    spacing: { ...base.spacing, ...(partial.spacing || {}) },
    radius: { ...base.radius, ...(partial.radius || {}) },
    shadow: { ...base.shadow, ...(partial.shadow || {}) },
    animation: { ...base.animation, ...(partial.animation || {}) },
    buttonStyle: { ...base.buttonStyle, ...(partial.buttonStyle || {}) },
    cardStyle: { ...base.cardStyle, ...(partial.cardStyle || {}) },
  };
}
