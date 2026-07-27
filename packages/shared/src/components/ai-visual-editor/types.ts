import type { DesignTokens } from '@/types/pageSchema';

// ─── Component Registry Types ─────────────────────────────────

export type AllowedComponent =
  | 'Hero' | 'ProductsGrid' | 'Testimonials' | 'Cards'
  | 'Navbar' | 'Footer' | 'Gallery' | 'FAQ' | 'Pricing'
  | 'Contact' | 'Booking' | 'Banner' | 'Features'
  | 'Stats' | 'Team' | 'Services' | 'Projects'
  | 'Newsletter' | 'Social' | 'CTA' | 'About'
  | 'Menu' | 'Map' | 'Custom';

export interface ComponentRegistryEntry {
  name: AllowedComponent;
  label: string;
  labelAr: string;
  category: 'layout' | 'content' | 'commerce' | 'booking' | 'utility';
  icon: string;
  allowedTokens: (keyof DesignTokens)[];
  allowedChanges: string[];
}

// ─── Element Inspection Data ──────────────────────────────────

export interface ElementInspectionData {
  componentName: string;
  componentPath: string;
  domPath: string;
  reactProps: Record<string, any>;
  textContent: string;
  images: string[];
  computedStyles: {
    color: string;
    backgroundColor: string;
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    padding: string;
    margin: string;
    borderRadius: string;
    boxShadow: string;
    border: string;
    display: string;
    flexDirection: string;
    alignItems: string;
    justifyContent: string;
    gap: string;
    width: string;
    height: string;
  };
  parentComponent: string | null;
  childComponents: string[];
  boundingRect: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// ─── AI Response (JSON only — never code) ─────────────────────

export interface AiVisualChange {
  component: AllowedComponent;
  changes: {
    variant?: string;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontSize?: 'sm' | 'base' | 'lg' | 'xl';
    fontWeight?: 'normal' | 'medium' | 'bold' | 'black';
    buttonStyle?: 'solid' | 'outline' | 'ghost' | 'gradient';
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    spacing?: 'compact' | 'normal' | 'loose';
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    animation?: 'none' | 'fade' | 'slide-up' | 'slide-right' | 'scale';
    layout?: 'grid' | 'list' | 'carousel' | 'masonry' | 'full-width' | 'split';
    columns?: number;
    imageAspect?: 'square' | 'portrait' | 'landscape';
    showBorder?: boolean;
    showShadow?: boolean;
    gradient?: string;
    borderColor?: string;
  };
  tokens?: Partial<DesignTokens>;
  contentChanges?: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    description?: string;
  };
}

export interface AiVisualEditorResponse {
  reply: string;
  change: AiVisualChange;
  applied: boolean;
}

// ─── AI Suggestions ───────────────────────────────────────────

export interface AiSuggestion {
  id: string;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  preview: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    borderRadius: string;
    shadow: string;
    animation: string;
  };
}

// ─── History System ───────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  timestamp: number;
  componentName: string;
  description: string;
  beforeTokens: Partial<DesignTokens>;
  afterTokens: Partial<DesignTokens>;
  beforeChange: AiVisualChange | null;
  afterChange: AiVisualChange;
}

// ─── Edit Mode State ──────────────────────────────────────────

export type EditModeState = 'idle' | 'inspecting' | 'selected' | 'ai-processing' | 'previewing';

export interface VisualEditorState {
  editMode: boolean;
  mode: EditModeState;
  hoveredElement: ElementInspectionData | null;
  selectedElement: ElementInspectionData | null;
  history: HistoryEntry[];
  historyIndex: number;
  pendingChange: AiVisualChange | null;
  screenshotDataUrl: string | null;
}
