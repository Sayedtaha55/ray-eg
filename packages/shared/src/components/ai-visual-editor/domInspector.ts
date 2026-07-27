import type { ElementInspectionData } from './types';
import { isComponentAllowed, getComponentFromRegistry } from './ComponentRegistry';

// ─── Build DOM path (CSS selector) ────────────────────────────

export function buildDomPath(element: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
      parts.unshift(selector);
      break;
    }

    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c) => c.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    if (current.className && typeof current.className === 'string') {
      const classes = current.className.split(/\s+/).filter((c) => c && !c.startsWith('lucide'));
      if (classes.length > 0) {
        selector += `.${classes.slice(0, 2).join('.')}`;
      }
    }

    parts.unshift(selector);
    current = current.parentElement;
  }

  return parts.join(' > ');
}

// ─── Extract React component name from element ────────────────

export function getReactComponentName(element: HTMLElement): string | null {
  const reactKeys = Object.keys(element).filter(
    (k) => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
  );

  if (reactKeys.length === 0) return null;

  const fiber = (element as any)[reactKeys[0]];
  let current = fiber;

  // Walk up the fiber tree to find a component with a recognized name
  while (current) {
    const componentName =
      current.type?.displayName ||
      current.type?.name ||
      (typeof current.type === 'string' ? current.type : null);

    if (componentName && isComponentAllowed(componentName)) {
      return componentName;
    }

    // Also check data-component-name attribute
    if (current.stateNode?.getAttribute?.('data-component-name')) {
      const attrName = current.stateNode.getAttribute('data-component-name');
      if (isComponentAllowed(attrName)) return attrName;
    }

    current = current.return;
  }

  // Fallback: check data-component-name on the element itself or ancestors
  let el: HTMLElement | null = element;
  while (el && el !== document.body) {
    const attrName = el.getAttribute('data-component-name');
    if (attrName && isComponentAllowed(attrName)) return attrName;
    el = el.parentElement;
  }

  return null;
}

// ─── Get React props from fiber ───────────────────────────────

export function getReactProps(element: HTMLElement): Record<string, any> {
  const reactKeys = Object.keys(element).filter(
    (k) => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
  );

  if (reactKeys.length === 0) return {};

  const fiber = (element as any)[reactKeys[0]];
  const props: Record<string, any> = {};

  if (fiber?.memoizedProps) {
    const rawProps = fiber.memoizedProps;
    // Extract only serializable props
    for (const [key, value] of Object.entries(rawProps)) {
      if (key === 'children') continue;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        props[key] = value;
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        try {
          props[key] = JSON.parse(JSON.stringify(value));
        } catch {
          props[key] = '[object]';
        }
      }
    }
  }

  return props;
}

// ─── Get parent component name ────────────────────────────────

export function getParentComponentName(element: HTMLElement): string | null {
  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    const name = getReactComponentName(parent);
    if (name) return name;
    const attrName = parent.getAttribute('data-component-name');
    if (attrName) return attrName;
    parent = parent.parentElement;
  }
  return null;
}

// ─── Get child component names ────────────────────────────────

export function getChildComponentNames(element: HTMLElement): string[] {
  const children: string[] = [];
  const allDescendants = element.querySelectorAll('[data-component-name]');
  allDescendants.forEach((child) => {
    const name = child.getAttribute('data-component-name');
    if (name && !children.includes(name)) children.push(name);
  });
  return children;
}

// ─── Extract images from element ──────────────────────────────

export function extractImages(element: HTMLElement): string[] {
  const images: string[] = [];
  const imgElements = element.querySelectorAll('img');
  imgElements.forEach((img) => {
    const src = img.src || img.getAttribute('data-src') || '';
    if (src && !images.includes(src)) images.push(src);
  });
  // Also check background images
  const bgImg = getComputedStyle(element).backgroundImage;
  if (bgImg && bgImg !== 'none') {
    const match = bgImg.match(/url\(["']?([^"')]+)["']?\)/);
    if (match && !images.includes(match[1])) images.push(match[1]);
  }
  return images;
}

// ─── Full element inspection ──────────────────────────────────

export function inspectElement(element: HTMLElement): ElementInspectionData {
  const computed = getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  const componentName = getReactComponentName(element) || 'Custom';
  const parentComponent = getParentComponentName(element);
  const childComponents = getChildComponentNames(element);

  return {
    componentName,
    componentPath: getReactComponentPath(element),
    domPath: buildDomPath(element),
    reactProps: getReactProps(element),
    textContent: element.textContent?.trim().slice(0, 500) || '',
    images: extractImages(element),
    computedStyles: {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      padding: computed.padding,
      margin: computed.margin,
      borderRadius: computed.borderRadius,
      boxShadow: computed.boxShadow,
      border: computed.border,
      display: computed.display,
      flexDirection: computed.flexDirection,
      alignItems: computed.alignItems,
      justifyContent: computed.justifyContent,
      gap: computed.gap,
      width: computed.width,
      height: computed.height,
    },
    parentComponent,
    childComponents,
    boundingRect: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
    },
  };
}

// ─── Get React component file path (best effort) ──────────────

function getReactComponentPath(element: HTMLElement): string {
  const reactKeys = Object.keys(element).filter(
    (k) => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
  );

  if (reactKeys.length === 0) return '';

  const fiber = (element as any)[reactKeys[0]];
  let current = fiber;

  while (current) {
    const name = current.type?.displayName || current.type?.name;
    if (name && isComponentAllowed(name)) {
      // In dev mode, the _source property may contain the file path
      const source = current._source || current.elementType?._source;
      if (source?.fileName) return source.fileName;
      return `src/shared/components/${name}`;
    }
    current = current.return;
  }

  return '';
}

// ─── Screenshot element using canvas ──────────────────────────

export async function screenshotElement(
  element: HTMLElement,
  scale: number = 1,
): Promise<string | null> {
  try {
    const rect = element.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);

    if (width === 0 || height === 0) return null;

    // Use html2canvas-like approach via foreignObject SVG
    // This is a lightweight approach — for production, use html2canvas library
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a simplified representation
    const computed = getComputedStyle(element);
    ctx.fillStyle = computed.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    const text = element.textContent?.trim().slice(0, 100) || '';
    if (text) {
      ctx.fillStyle = computed.color || '#000000';
      ctx.font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
      ctx.textBaseline = 'top';
      ctx.fillText(text, 10 * scale, 10 * scale, canvas.width - 20 * scale);
    }

    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

// ─── Check if element is interactive (should skip) ────────────

export function isInteractiveElement(element: HTMLElement): boolean {
  const tag = element.tagName.toLowerCase();
  return ['input', 'textarea', 'select', 'button'].includes(tag) ||
    element.getAttribute('contenteditable') === 'true';
}
