import type { DesignTokens } from '@/types/pageSchema';
import type { AiVisualChange } from './types';

// ─── Theme Token System ───────────────────────────────────────
// Central token store — no direct CSS manipulation.
// All visual changes go through tokens → CSS variables.

export interface ThemeTokenSnapshot {
  tokens: DesignTokens;
  componentOverrides: Map<string, Partial<AiVisualChange['changes']>>;
}

const TOKEN_TO_CSS_VAR: Record<string, string> = {
  'colors.primary': '--brand-primary',
  'colors.secondary': '--brand-secondary',
  'colors.accent': '--brand-accent',
  'colors.background': '--brand-bg',
  'colors.surface': '--brand-surface',
  'colors.text': '--brand-text',
  'colors.textMuted': '--brand-text-muted',
  'colors.headerBg': '--brand-header-bg',
  'colors.headerText': '--brand-header-text',
  'colors.footerBg': '--brand-footer-bg',
  'colors.footerText': '--brand-footer-text',
  'typography.fontFamily': '--brand-font-family',
  'typography.headingFamily': '--brand-heading-family',
  'typography.headingSize': '--brand-heading-size',
  'typography.textSize': '--brand-text-size',
  'typography.fontWeight': '--brand-font-weight',
  'spacing.sectionGap': '--brand-section-gap',
  'spacing.itemGap': '--brand-item-gap',
  'spacing.pagePadding': '--brand-page-padding',
  'radius.card': '--brand-radius-card',
  'radius.button': '--brand-radius-button',
  'radius.input': '--brand-radius-input',
  'shadow.card': '--brand-shadow-card',
  'shadow.button': '--brand-shadow-button',
  'animation.entrance': '--brand-animation',
  'animation.duration': '--brand-animation-duration',
  'buttonStyle.shape': '--brand-button-shape',
  'buttonStyle.size': '--brand-button-size',
  'buttonStyle.fullWidth': '--brand-button-full-width',
  'cardStyle.layout': '--brand-card-layout',
  'cardStyle.imageAspect': '--brand-card-aspect',
  'cardStyle.showShadow': '--brand-card-shadow',
  'cardStyle.showBorder': '--brand-card-border',
};

const RADIUS_MAP: Record<string, string> = {
  none: '0px', sm: '4px', md: '8px', lg: '12px',
  xl: '16px', '2xl': '24px', full: '9999px',
};

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
};

const SPACING_MAP: Record<string, string> = {
  compact: '1.5rem', normal: '3rem', loose: '5rem',
  tight: '0.5rem', wide: '2rem', none: '0px',
  sm: '0.75rem', md: '1.5rem', lg: '3rem',
};

const ANIMATION_MAP: Record<string, string> = {
  none: 'none', fade: 'fadeIn 0.4s ease-out',
  'slide-up': 'slideUp 0.5s ease-out',
  'slide-right': 'slideRight 0.5s ease-out',
  scale: 'scaleIn 0.4s ease-out',
};

const DURATION_MAP: Record<string, string> = {
  fast: '0.2s', normal: '0.4s', slow: '0.6s',
};

const HEADING_SIZE_MAP: Record<string, string> = {
  sm: '1.5rem', base: '1.875rem', lg: '2.25rem', xl: '3rem',
};

const TEXT_SIZE_MAP: Record<string, string> = {
  xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
};

const FONT_WEIGHT_MAP: Record<string, string> = {
  normal: '400', medium: '500', bold: '700', black: '900',
};

// ─── Get value from nested path ───────────────────────────────

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

// ─── Resolve token value to CSS string ────────────────────────

function resolveTokenValue(path: string, value: any): string {
  switch (path) {
    case 'radius.card':
    case 'radius.button':
    case 'radius.input':
      return RADIUS_MAP[value] || '8px';
    case 'shadow.card':
    case 'shadow.button':
      return SHADOW_MAP[value] || SHADOW_MAP.md;
    case 'spacing.sectionGap':
    case 'spacing.itemGap':
    case 'spacing.pagePadding':
      return SPACING_MAP[value] || '3rem';
    case 'animation.entrance':
      return ANIMATION_MAP[value] || ANIMATION_MAP.fade;
    case 'animation.duration':
      return DURATION_MAP[value] || '0.4s';
    case 'typography.headingSize':
      return HEADING_SIZE_MAP[value] || '3rem';
    case 'typography.textSize':
      return TEXT_SIZE_MAP[value] || '0.875rem';
    case 'typography.fontWeight':
      return FONT_WEIGHT_MAP[value] || '700';
    case 'buttonStyle.fullWidth':
      return value ? '100%' : 'auto';
    case 'cardStyle.showShadow':
      return value ? 'var(--brand-shadow-card)' : 'none';
    case 'cardStyle.showBorder':
      return value ? '1px solid rgba(0,0,0,0.08)' : 'none';
    default:
      return String(value);
  }
}

// ─── Convert AiVisualChange.changes → token overrides ─────────

export function changesToTokenOverrides(
  changes: AiVisualChange['changes'],
): Partial<DesignTokens> {
  const overrides: any = {};

  if (changes.primaryColor) {
    overrides.colors = { ...(overrides.colors || {}), primary: changes.primaryColor };
  }
  if (changes.secondaryColor) {
    overrides.colors = { ...(overrides.colors || {}), secondary: changes.secondaryColor };
  }
  if (changes.backgroundColor) {
    overrides.colors = { ...(overrides.colors || {}), background: changes.backgroundColor };
  }
  if (changes.textColor) {
    overrides.colors = { ...(overrides.colors || {}), text: changes.textColor };
  }
  if (changes.fontFamily) {
    overrides.typography = { ...(overrides.typography || {}), fontFamily: changes.fontFamily };
  }
  if (changes.fontSize) {
    overrides.typography = { ...(overrides.typography || {}), textSize: changes.fontSize };
  }
  if (changes.fontWeight) {
    overrides.typography = { ...(overrides.typography || {}), fontWeight: changes.fontWeight };
  }
  if (changes.borderRadius) {
    overrides.radius = { ...(overrides.radius || {}), card: changes.borderRadius, button: changes.borderRadius };
  }
  if (changes.spacing) {
    overrides.spacing = { ...(overrides.spacing || {}), sectionGap: changes.spacing, itemGap: changes.spacing };
  }
  if (changes.shadow) {
    overrides.shadow = { ...(overrides.shadow || {}), card: changes.shadow, button: changes.shadow };
  }
  if (changes.animation) {
    overrides.animation = { ...(overrides.animation || {}), entrance: changes.animation };
  }
  if (changes.buttonStyle) {
    overrides.buttonStyle = { ...(overrides.buttonStyle || {}), shape: changes.buttonStyle };
  }
  if (changes.imageAspect) {
    overrides.cardStyle = { ...(overrides.cardStyle || {}), imageAspect: changes.imageAspect };
  }
  if (changes.showShadow !== undefined) {
    overrides.cardStyle = { ...(overrides.cardStyle || {}), showShadow: changes.showShadow };
  }
  if (changes.showBorder !== undefined) {
    overrides.cardStyle = { ...(overrides.cardStyle || {}), showBorder: changes.showBorder };
  }

  return overrides as Partial<DesignTokens>;
}

// ─── Apply tokens to DOM element as CSS variables ─────────────

export function applyTokensToElement(
  element: HTMLElement,
  tokens: DesignTokens,
  overrides?: Partial<DesignTokens>,
): void {
  const merged = deepMergeTokens(tokens, overrides);

  for (const [tokenPath, cssVar] of Object.entries(TOKEN_TO_CSS_VAR)) {
    const value = getNestedValue(merged, tokenPath);
    if (value !== undefined) {
      const cssValue = resolveTokenValue(tokenPath, value);
      element.style.setProperty(cssVar, cssValue);
    }
  }
}

// ─── Apply component-specific overrides to an element ─────────

export function applyComponentOverrides(
  element: HTMLElement,
  changes: AiVisualChange['changes'],
): void {
  if (changes.primaryColor) element.style.setProperty('--brand-primary', changes.primaryColor);
  if (changes.secondaryColor) element.style.setProperty('--brand-secondary', changes.secondaryColor);
  if (changes.backgroundColor) element.style.setProperty('--brand-bg', changes.backgroundColor);
  if (changes.textColor) element.style.setProperty('--brand-text', changes.textColor);
  if (changes.fontFamily) element.style.setProperty('--brand-font-family', changes.fontFamily);
  if (changes.fontSize) element.style.setProperty('--brand-text-size', TEXT_SIZE_MAP[changes.fontSize] || '1rem');
  if (changes.fontWeight) element.style.setProperty('--brand-font-weight', FONT_WEIGHT_MAP[changes.fontWeight] || '700');
  if (changes.borderRadius) {
    const r = RADIUS_MAP[changes.borderRadius] || '8px';
    element.style.setProperty('--brand-radius-card', r);
    element.style.setProperty('--brand-radius-button', r);
  }
  if (changes.spacing) {
    const s = SPACING_MAP[changes.spacing] || '3rem';
    element.style.setProperty('--brand-section-gap', s);
    element.style.setProperty('--brand-item-gap', s);
  }
  if (changes.shadow) {
    const sh = SHADOW_MAP[changes.shadow] || SHADOW_MAP.md;
    element.style.setProperty('--brand-shadow-card', sh);
    element.style.setProperty('--brand-shadow-button', sh);
  }
  if (changes.animation) {
    element.style.setProperty('--brand-animation', ANIMATION_MAP[changes.animation] || ANIMATION_MAP.fade);
  }
  if (changes.buttonStyle) {
    element.style.setProperty('--brand-button-shape', changes.buttonStyle);
  }
  if (changes.gradient) {
    element.style.setProperty('--brand-gradient', changes.gradient);
  }
  if (changes.borderColor) {
    element.style.setProperty('--brand-border-color', changes.borderColor);
  }
}

// ─── Deep merge tokens ────────────────────────────────────────

export function deepMergeTokens(
  base: DesignTokens,
  overrides?: Partial<DesignTokens>,
): DesignTokens {
  if (!overrides) return base;
  return {
    colors: { ...base.colors, ...(overrides.colors || {}) },
    typography: { ...base.typography, ...(overrides.typography || {}) },
    spacing: { ...base.spacing, ...(overrides.spacing || {}) },
    radius: { ...base.radius, ...(overrides.radius || {}) },
    shadow: { ...base.shadow, ...(overrides.shadow || {}) },
    animation: { ...base.animation, ...(overrides.animation || {}) },
    buttonStyle: { ...base.buttonStyle, ...(overrides.buttonStyle || {}) },
    cardStyle: { ...base.cardStyle, ...(overrides.cardStyle || {}) },
  };
}

// ─── Snapshot tokens from a DOM element ───────────────────────

export function snapshotTokensFromElement(element: HTMLElement): Partial<DesignTokens> {
  const style = getComputedStyle(element);
  return {
    colors: {
      primary: style.getPropertyValue('--brand-primary').trim() || '',
      secondary: style.getPropertyValue('--brand-secondary').trim() || '',
      background: style.getPropertyValue('--brand-bg').trim() || '',
      surface: style.getPropertyValue('--brand-surface').trim() || '',
      text: style.getPropertyValue('--brand-text').trim() || '',
    },
    typography: {
      fontFamily: style.getPropertyValue('--brand-font-family').trim() || '',
      headingFamily: style.getPropertyValue('--brand-heading-family').trim() || '',
    },
    radius: {
      card: style.getPropertyValue('--brand-radius-card').trim() as any || '',
      button: style.getPropertyValue('--brand-radius-button').trim() as any || '',
    },
  } as Partial<DesignTokens>;
}
