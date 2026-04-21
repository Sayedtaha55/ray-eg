import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { ApiService } from '@/services/api';

/* ── Types ── */
type Mode = 'edit' | 'preview';
type SectionId =
  | 'colors'
  | 'background'
  | 'banner'
  | 'header'
  | 'headerFooter'
  | 'layout'
  | 'products'
  | 'productCard'
  | 'productPage'
  | 'categories'
  | 'typography'
  | 'buttons'
  | 'visibility'
  | 'customCss';

interface ShopDesign {
  primaryColor: string;
  secondaryColor: string;
  layout: string;
  bannerUrl: string;
  bannerPosX: number;
  bannerPosY: number;
  headerType: string;
  headerBackgroundColor: string;
  headerBackgroundImageUrl: string;
  headerTextColor: string;
  headerTransparent: boolean;
  headerOverlayBanner: boolean;
  headerOpacity: number;
  pageBackgroundColor: string;
  backgroundColor: string;
  backgroundImageUrl: string;
  productDisplay: string;
  productsLayout: string;
  imageAspectRatio: string;
  footerBackgroundColor: string;
  footerTextColor: string;
  footerTransparent: boolean;
  footerOpacity: number;
  headingSize: string;
  textSize: string;
  fontWeight: string;
  buttonShape: string;
  buttonPadding: string;
  buttonPreset: string;
  buttonHover: string;
  productCardOverlayBgColor: string;
  productCardOverlayOpacity: number;
  productCardTitleColor: string;
  productCardPriceColor: string;
  productPageBackgroundColor: string;
  productPageTextColor: string;
  productPagePriceColor: string;
  productPageButtonColor: string;
  categoryIconShape: string;
  categoryIconSize: string;
  showProductsInCategories: boolean;
  categoryIconImage: string;
  pagePadding: string;
  itemGap: string;
  customCss: string;
  elementsVisibility: Record<string, boolean>;
  productEditorVisibility: Record<string, boolean>;
  imageMapVisibility: Record<string, boolean>;
}

/* ── Defaults (mirrors web DEFAULT_PAGE_DESIGN exactly) ── */
const DEFAULTS: ShopDesign = {
  primaryColor: '#00E5FF',
  secondaryColor: '#BD00FF',
  layout: 'modern',
  bannerUrl: '',
  bannerPosX: 50,
  bannerPosY: 50,
  headerType: 'centered',
  headerBackgroundColor: '#FFFFFF',
  headerBackgroundImageUrl: '',
  headerTextColor: '#0F172A',
  headerTransparent: true,
  headerOverlayBanner: false,
  headerOpacity: 60,
  pageBackgroundColor: '#FFFFFF',
  backgroundColor: '#FFFFFF',
  backgroundImageUrl: '',
  productDisplay: 'cards',
  productsLayout: 'vertical',
  imageAspectRatio: 'square',
  footerBackgroundColor: '#FFFFFF',
  footerTextColor: '#0F172A',
  footerTransparent: false,
  footerOpacity: 90,
  headingSize: 'text-4xl',
  textSize: 'text-sm',
  fontWeight: 'font-black',
  buttonShape: 'rounded-2xl',
  buttonPadding: 'px-6 py-3',
  buttonPreset: 'primary',
  buttonHover: 'bg-slate-900',
  productCardOverlayBgColor: '#0F172A',
  productCardOverlayOpacity: 70,
  productCardTitleColor: '#FFFFFF',
  productCardPriceColor: '#FFFFFF',
  productPageBackgroundColor: '#FFFFFF',
  productPageTextColor: '#0F172A',
  productPagePriceColor: '#0F172A',
  productPageButtonColor: '#0F172A',
  categoryIconShape: 'circular',
  categoryIconSize: 'medium',
  showProductsInCategories: false,
  categoryIconImage: '',
  pagePadding: 'p-6 md:p-12',
  itemGap: 'gap-4 md:gap-6',
  customCss: '',
  elementsVisibility: {},
  productEditorVisibility: {},
  imageMapVisibility: {},
};

const coerceNum = (v: any, fb: number) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fb;
};
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const str = (v: any, fb = '') => (typeof v === 'string' ? v : String(v ?? fb));
const bool = (v: any, fb = false) => (typeof v === 'boolean' ? v : fb);

const normalizeDesign = (raw: any): ShopDesign => {
  const b = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const m: any = { ...DEFAULTS, ...b };
  m.primaryColor = str(m.primaryColor, DEFAULTS.primaryColor);
  m.secondaryColor = str(m.secondaryColor, DEFAULTS.secondaryColor);
  m.layout = str(m.layout, DEFAULTS.layout);
  m.bannerUrl = str(m.bannerUrl, '');
  m.bannerPosX = clamp(coerceNum(m.bannerPosX, 50), 0, 100);
  m.bannerPosY = clamp(coerceNum(m.bannerPosY, 50), 0, 100);
  m.headerType = str(m.headerType, DEFAULTS.headerType);
  m.headerBackgroundColor = str(m.headerBackgroundColor, DEFAULTS.headerBackgroundColor);
  m.headerBackgroundImageUrl = str(m.headerBackgroundImageUrl, '');
  m.headerTextColor = str(m.headerTextColor, DEFAULTS.headerTextColor);
  m.headerTransparent = bool(m.headerTransparent, DEFAULTS.headerTransparent);
  m.headerOverlayBanner = bool(m.headerOverlayBanner, DEFAULTS.headerOverlayBanner);
  m.headerOpacity = clamp(coerceNum(m.headerOpacity, DEFAULTS.headerOpacity), 0, 100);
  m.pageBackgroundColor = str(m.pageBackgroundColor, DEFAULTS.pageBackgroundColor);
  m.backgroundColor = str(m.backgroundColor, DEFAULTS.backgroundColor);
  m.backgroundImageUrl = str(m.backgroundImageUrl, '');
  m.productDisplay = str(m.productDisplay, DEFAULTS.productDisplay);
  m.productsLayout = str(m.productsLayout, DEFAULTS.productsLayout);
  m.imageAspectRatio = str(m.imageAspectRatio, DEFAULTS.imageAspectRatio);
  m.footerBackgroundColor = str(m.footerBackgroundColor, DEFAULTS.footerBackgroundColor);
  m.footerTextColor = str(m.footerTextColor, DEFAULTS.footerTextColor);
  m.footerTransparent = bool(m.footerTransparent, DEFAULTS.footerTransparent);
  m.footerOpacity = clamp(coerceNum(m.footerOpacity, DEFAULTS.footerOpacity), 0, 100);
  m.headingSize = str(m.headingSize, DEFAULTS.headingSize);
  m.textSize = str(m.textSize, DEFAULTS.textSize);
  m.fontWeight = str(m.fontWeight, DEFAULTS.fontWeight);
  m.buttonShape = str(m.buttonShape, DEFAULTS.buttonShape);
  m.buttonPadding = str(m.buttonPadding, DEFAULTS.buttonPadding);
  m.buttonPreset = str(m.buttonPreset, DEFAULTS.buttonPreset);
  m.buttonHover = str(m.buttonHover, DEFAULTS.buttonHover);
  m.productCardOverlayBgColor = str(m.productCardOverlayBgColor, DEFAULTS.productCardOverlayBgColor);
  m.productCardOverlayOpacity = clamp(coerceNum(m.productCardOverlayOpacity, DEFAULTS.productCardOverlayOpacity), 0, 100);
  m.productCardTitleColor = str(m.productCardTitleColor, DEFAULTS.productCardTitleColor);
  m.productCardPriceColor = str(m.productCardPriceColor, DEFAULTS.productCardPriceColor);
  m.productPageBackgroundColor = str(m.productPageBackgroundColor, DEFAULTS.productPageBackgroundColor);
  m.productPageTextColor = str(m.productPageTextColor, DEFAULTS.productPageTextColor);
  m.productPagePriceColor = str(m.productPagePriceColor, DEFAULTS.productPagePriceColor);
  m.productPageButtonColor = str(m.productPageButtonColor, DEFAULTS.productPageButtonColor);
  m.categoryIconShape = str(m.categoryIconShape, DEFAULTS.categoryIconShape);
  m.categoryIconSize = str(m.categoryIconSize, DEFAULTS.categoryIconSize);
  m.showProductsInCategories = bool(m.showProductsInCategories, DEFAULTS.showProductsInCategories);
  m.categoryIconImage = str(m.categoryIconImage, '');
  m.pagePadding = str(m.pagePadding, DEFAULTS.pagePadding);
  m.itemGap = str(m.itemGap, DEFAULTS.itemGap);
  m.customCss = typeof m.customCss === 'string' ? m.customCss : '';
  m.elementsVisibility = m.elementsVisibility && typeof m.elementsVisibility === 'object' ? m.elementsVisibility : {};
  m.productEditorVisibility = m.productEditorVisibility && typeof m.productEditorVisibility === 'object' ? m.productEditorVisibility : {};
  m.imageMapVisibility = m.imageMapVisibility && typeof m.imageMapVisibility === 'object' ? m.imageMapVisibility : {};
  return m as ShopDesign;
};

/* ── Reusable field components ── */
const Fld = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <View style={s.field}>
    <Text style={s.fieldLabel}>{label}</Text>
    <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#94A3B8" style={s.input} autoCapitalize="none" autoCorrect={false} />
  </View>
);

const Toggle = ({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (v: boolean) => void }) => (
  <View style={s.switchRow}>
    <Text style={s.switchLabel}>{label}</Text>
    <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#CBD5E1', true: '#00E5FF' }} thumbColor="#FFFFFF" />
  </View>
);

const ChipSelect = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
  <View style={s.field}>
    <Text style={s.fieldLabel}>{label}</Text>
    <View style={s.chips}>
      {options.map((o) => (
        <TouchableOpacity key={o} style={[s.chip, value === o && s.chipActive]} onPress={() => onChange(o)}>
          <Text style={[s.chipText, value === o && s.chipTextActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const VisToggle = ({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) => (
  <View style={s.switchRow}>
    <Text style={s.switchLabel}>{label}</Text>
    <TouchableOpacity onPress={onToggle} style={[s.visDot, value && s.visDotOn]} />
  </View>
);

/* ── Section definitions (matching web BUILDER_SECTIONS) ── */
const SECTION_META: { id: SectionId; titleKey: string; icon: string }[] = [
  { id: 'colors', titleKey: 'builder.colors', icon: 'color-palette-outline' },
  { id: 'background', titleKey: 'builder.background', icon: 'image-outline' },
  { id: 'banner', titleKey: 'builder.banner', icon: 'layers-outline' },
  { id: 'header', titleKey: 'builder.header', icon: 'restaurant-outline' },
  { id: 'headerFooter', titleKey: 'builder.headerFooter', icon: 'remove-outline' },
  { id: 'layout', titleKey: 'builder.layout', icon: 'grid-outline' },
  { id: 'products', titleKey: 'builder.products', icon: 'cube-outline' },
  { id: 'productCard', titleKey: 'builder.productCard', icon: 'card-outline' },
  { id: 'productPage', titleKey: 'builder.productPage', icon: 'document-text-outline' },
  { id: 'categories', titleKey: 'builder.categories', icon: 'pricetag-outline' },
  { id: 'typography', titleKey: 'builder.typography', icon: 'text-outline' },
  { id: 'buttons', titleKey: 'builder.buttons', icon: 'radio-button-on-outline' },
  { id: 'visibility', titleKey: 'builder.visibility', icon: 'eye-outline' },
  { id: 'customCss', titleKey: 'builder.customCss', icon: 'code-slash-outline' },
];

/* ── Main component ── */
export default function BuilderScreen() {
  const { shop, refreshShop } = useAuth();
  const { t } = useAppPreferences();
  const [mode, setMode] = useState<Mode>('edit');
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [design, setDesign] = useState<ShopDesign>({ ...DEFAULTS });
  const [openSection, setOpenSection] = useState<SectionId>('colors');

  useEffect(() => {
    if (!shop?.id) return;
    const d = normalizeDesign((shop as any)?.pageDesign);
    setDesign(d);
    setReady(true);
  }, [shop?.id]);

  const set = useCallback(<K extends keyof ShopDesign>(k: K, v: ShopDesign[K]) => {
    setDesign((prev) => ({ ...prev, [k]: v }));
  }, []);

  const toggleVis = useCallback((key: string) => {
    setDesign((prev) => ({
      ...prev,
      elementsVisibility: { ...prev.elementsVisibility, [key]: !prev.elementsVisibility[key] },
    }));
  }, []);

  /* ── Save ── */
  const save = useCallback(async () => {
    const shopId = String(shop?.id || '').trim();
    if (!shopId) return;
    setSaving(true);
    try {
      const normalized = normalizeDesign(design);
      await ApiService.updateShopDesign(shopId, normalized);
      await refreshShop();
      setDesign(normalized);
      Alert.alert(t('common.success'), t('settings.saved'));
    } catch {
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [design, refreshShop, shop?.id]);

  /* ── Preview computed values ── */
  const headerBg = useMemo(() => {
    if (design.headerTransparent) return `rgba(255,255,255,${Number(design.headerOpacity) / 100})`;
    return design.headerBackgroundColor;
  }, [design.headerTransparent, design.headerOpacity, design.headerBackgroundColor]);

  const footerBg = useMemo(() => {
    if (design.footerTransparent) return `rgba(255,255,255,${Number(design.footerOpacity) / 100})`;
    return design.footerBackgroundColor;
  }, [design.footerTransparent, design.footerOpacity, design.footerBackgroundColor]);

  const previewProducts = useMemo(
    () => [
      { id: 'p1', title: 'Product 1', price: 129 },
      { id: 'p2', title: 'Product 2', price: 199 },
      { id: 'p3', title: 'Product 3', price: 89 },
      { id: 'p4', title: 'Product 4', price: 319 },
    ],
    [],
  );

  const overlayHex = useMemo(() => {
    const alpha = Math.round((Number(design.productCardOverlayOpacity) / 100) * 255)
      .toString(16)
      .padStart(2, '0');
    return design.productCardOverlayBgColor + alpha;
  }, [design.productCardOverlayBgColor, design.productCardOverlayOpacity]);

  /* ── Section renderers ── */
  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'colors':
        return (
          <>
            <Fld label={t('builder.primaryColor')} value={design.primaryColor} onChange={(v) => set('primaryColor', v)} placeholder="#00E5FF" />
            <Fld label={t('builder.secondaryColor')} value={design.secondaryColor} onChange={(v) => set('secondaryColor', v)} placeholder="#BD00FF" />
            <Fld label={t('builder.pageBackgroundColor')} value={design.pageBackgroundColor} onChange={(v) => set('pageBackgroundColor', v)} placeholder="#FFFFFF" />
          </>
        );
      case 'background':
        return (
          <>
            <Fld label={t('builder.backgroundImageUrl')} value={design.backgroundImageUrl} onChange={(v) => set('backgroundImageUrl', v)} placeholder="https://..." />
            <Fld label={t('builder.backgroundColor')} value={design.backgroundColor} onChange={(v) => set('backgroundColor', v)} placeholder="#FFFFFF" />
          </>
        );
      case 'banner':
        return (
          <>
            <Fld label={t('builder.bannerUrl')} value={design.bannerUrl} onChange={(v) => set('bannerUrl', v)} placeholder="https://..." />
            <Fld label={t('builder.bannerPosX')} value={String(design.bannerPosX)} onChange={(v) => set('bannerPosX', coerceNum(v, 50))} placeholder="50" />
            <Fld label={t('builder.bannerPosY')} value={String(design.bannerPosY)} onChange={(v) => set('bannerPosY', coerceNum(v, 50))} placeholder="50" />
          </>
        );
      case 'header':
        return (
          <>
            <ChipSelect label={t('builder.headerType')} value={design.headerType} options={['centered', 'side']} onChange={(v) => set('headerType', v)} />
            <Fld label={t('builder.headerBackgroundColor')} value={design.headerBackgroundColor} onChange={(v) => set('headerBackgroundColor', v)} placeholder="#FFFFFF" />
            <Fld label={t('builder.headerBackgroundImageUrl')} value={design.headerBackgroundImageUrl} onChange={(v) => set('headerBackgroundImageUrl', v)} placeholder="https://..." />
            <Fld label={t('builder.headerTextColor')} value={design.headerTextColor} onChange={(v) => set('headerTextColor', v)} placeholder="#0F172A" />
            <Toggle label={t('builder.headerTransparent')} value={design.headerTransparent} onValueChange={(v) => set('headerTransparent', v)} />
            <Toggle label={t('builder.headerOverlayBanner')} value={design.headerOverlayBanner} onValueChange={(v) => set('headerOverlayBanner', v)} />
            <Fld label={t('builder.headerOpacity')} value={String(design.headerOpacity)} onChange={(v) => set('headerOpacity', coerceNum(v, 60))} placeholder="60" />
          </>
        );
      case 'headerFooter':
        return (
          <>
            <Fld label={t('builder.footerBackgroundColor')} value={design.footerBackgroundColor} onChange={(v) => set('footerBackgroundColor', v)} placeholder="#FFFFFF" />
            <Fld label={t('builder.footerTextColor')} value={design.footerTextColor} onChange={(v) => set('footerTextColor', v)} placeholder="#0F172A" />
            <Toggle label={t('builder.footerTransparent')} value={design.footerTransparent} onValueChange={(v) => set('footerTransparent', v)} />
            <Fld label={t('builder.footerOpacity')} value={String(design.footerOpacity)} onChange={(v) => set('footerOpacity', coerceNum(v, 90))} placeholder="90" />
          </>
        );
      case 'layout':
        return (
          <>
            <ChipSelect label={t('builder.layoutStyle')} value={design.layout} options={['minimal', 'modern', 'bold']} onChange={(v) => set('layout', v)} />
          </>
        );
      case 'products':
        return (
          <>
            <ChipSelect label={t('builder.productDisplay')} value={design.productDisplay} options={['cards', 'list', 'minimal']} onChange={(v) => set('productDisplay', v)} />
            <ChipSelect label={t('builder.productsLayout')} value={design.productsLayout} options={['vertical', 'horizontal']} onChange={(v) => set('productsLayout', v)} />
            <ChipSelect label={t('builder.imageAspectRatio')} value={design.imageAspectRatio} options={['square', 'portrait', 'landscape']} onChange={(v) => set('imageAspectRatio', v)} />
          </>
        );
      case 'productCard':
        return (
          <>
            <Fld label={t('builder.productCardOverlayBgColor')} value={design.productCardOverlayBgColor} onChange={(v) => set('productCardOverlayBgColor', v)} placeholder="#0F172A" />
            <Fld label={t('builder.productCardOverlayOpacity')} value={String(design.productCardOverlayOpacity)} onChange={(v) => set('productCardOverlayOpacity', coerceNum(v, 70))} placeholder="70" />
            <Fld label={t('builder.productCardTitleColor')} value={design.productCardTitleColor} onChange={(v) => set('productCardTitleColor', v)} placeholder="#FFFFFF" />
            <Fld label={t('builder.productCardPriceColor')} value={design.productCardPriceColor} onChange={(v) => set('productCardPriceColor', v)} placeholder="#FFFFFF" />
          </>
        );
      case 'productPage':
        return (
          <>
            <Fld label={t('builder.productPageBackgroundColor')} value={design.productPageBackgroundColor} onChange={(v) => set('productPageBackgroundColor', v)} placeholder="#FFFFFF" />
            <Fld label={t('builder.productPageTextColor')} value={design.productPageTextColor} onChange={(v) => set('productPageTextColor', v)} placeholder="#0F172A" />
            <Fld label={t('builder.productPagePriceColor')} value={design.productPagePriceColor} onChange={(v) => set('productPagePriceColor', v)} placeholder="#0F172A" />
            <Fld label={t('builder.productPageButtonColor')} value={design.productPageButtonColor} onChange={(v) => set('productPageButtonColor', v)} placeholder="#0F172A" />
          </>
        );
      case 'categories':
        return (
          <>
            <ChipSelect label={t('builder.categoryIconShape')} value={design.categoryIconShape} options={['circular', 'square', 'large']} onChange={(v) => set('categoryIconShape', v)} />
            <ChipSelect label={t('builder.categoryIconSize')} value={design.categoryIconSize} options={['small', 'medium', 'large']} onChange={(v) => set('categoryIconSize', v)} />
            <Toggle label={t('builder.showProductsInCategories')} value={design.showProductsInCategories} onValueChange={(v) => set('showProductsInCategories', v)} />
          </>
        );
      case 'typography':
        return (
          <>
            <Fld label={t('builder.headingSize')} value={design.headingSize} onChange={(v) => set('headingSize', v)} placeholder="text-4xl" />
            <Fld label={t('builder.textSize')} value={design.textSize} onChange={(v) => set('textSize', v)} placeholder="text-sm" />
            <Fld label={t('builder.fontWeight')} value={design.fontWeight} onChange={(v) => set('fontWeight', v)} placeholder="font-black" />
          </>
        );
      case 'buttons':
        return (
          <>
            <Fld label={t('builder.buttonShape')} value={design.buttonShape} onChange={(v) => set('buttonShape', v)} placeholder="rounded-2xl" />
            <Fld label={t('builder.buttonPadding')} value={design.buttonPadding} onChange={(v) => set('buttonPadding', v)} placeholder="px-6 py-3" />
            <ChipSelect label={t('builder.buttonPreset')} value={design.buttonPreset} options={['primary', 'ghost', 'premium', 'urgent']} onChange={(v) => set('buttonPreset', v)} />
          </>
        );
      case 'visibility': {
        const visKeys = [
          'headerNavGallery',
          'headerNavInfo',
          'headerFollowButton',
          'headerShareButton',
          'productCardPrice',
          'productCardStock',
          'productCardAddToCart',
          'productCardReserve',
          'mobileBottomNavCart',
          'footerSocialLinks',
          'footerContactInfo',
        ];
        return (
          <>
            {visKeys.map((k) => (
              <VisToggle key={k} label={k} value={Boolean(design.elementsVisibility[k] ?? true)} onToggle={() => toggleVis(k)} />
            ))}
          </>
        );
      }
      case 'customCss':
        return (
          <>
            <Fld label={t('builder.customCss')} value={design.customCss} onChange={(v) => set('customCss', v)} placeholder="" />
          </>
        );
      default:
        return null;
    }
  };

  if (!ready) {
    return (
      <View style={s.center}>
        <Stack.Screen options={{ title: t('more.pageBuilder') }} />
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: t('more.pageBuilder') }} />

      {/* Top bar: Edit/Preview toggle + Save */}
      <View style={s.topBar}>
        <View style={s.tabs}>
          <TouchableOpacity style={[s.tabBtn, mode === 'edit' && s.tabBtnActive]} onPress={() => setMode('edit')}>
            <Text style={[s.tabText, mode === 'edit' && s.tabTextActive]}>{t('builder.edit') || 'Edit'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tabBtn, mode === 'preview' && s.tabBtnActive]} onPress={() => setMode('preview')}>
            <Text style={[s.tabText, mode === 'preview' && s.tabTextActive]}>{t('builder.preview') || 'Preview'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[s.saveBtn, saving && s.saveBtnDisabled]} disabled={saving} onPress={save}>
          <Text style={s.saveBtnText}>{saving ? t('common.loading') : t('common.save')}</Text>
        </TouchableOpacity>
      </View>

      {mode === 'edit' ? (
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          {SECTION_META.map((sec) => (
            <View key={sec.id} style={s.sectionCard}>
              <TouchableOpacity style={s.sectionHeader} onPress={() => setOpenSection(openSection === sec.id ? ('' as SectionId) : sec.id)}>
                <View style={s.sectionHeaderLeft}>
                  <Ionicons name={sec.icon as any} size={18} color="#00E5FF" />
                  <Text style={s.sectionHeaderTitle}>{t(sec.titleKey) || sec.id}</Text>
                </View>
                <Ionicons name={openSection === sec.id ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
              </TouchableOpacity>
              {openSection === sec.id && <View style={s.sectionBody}>{renderSection(sec.id)}</View>}
            </View>
          ))}
        </ScrollView>
      ) : (
        /* ── Native Preview ── */
        <ScrollView style={s.scroll} contentContainerStyle={s.previewWrap}>
          <View style={[s.previewShell, { backgroundColor: design.pageBackgroundColor, borderColor: design.primaryColor + '44' }]}>
            {/* Header */}
            <View style={[s.pvHeader, { backgroundColor: headerBg }]}>
              <View style={s.pvHeaderLeft}>
                <View style={[s.pvLogo, { borderColor: design.primaryColor }]}>
                  <Ionicons name="storefront" size={20} color={design.primaryColor} />
                </View>
                <View>
                  <Text style={[s.pvShopName, { color: design.headerTextColor }]}>{shop?.name || 'My Shop'}</Text>
                  <Text style={[s.pvShopCat, { color: design.headerTextColor + '99' }]}>{shop?.category || 'RETAIL'}</Text>
                </View>
              </View>
              <View style={[s.pvFollowBtn, { borderColor: design.primaryColor }]}>
                <Text style={[s.pvFollowText, { color: design.primaryColor }]}>{t('builder.follow') || 'Follow'}</Text>
              </View>
            </View>

            {/* Tabs */}
            <View style={s.pvTabsRow}>
              {['Products', 'Gallery', 'Info'].map((x, i) => (
                <View
                  key={x}
                  style={[
                    s.pvTab,
                    i === 0 && { backgroundColor: design.primaryColor + '18', borderColor: design.primaryColor },
                  ]}
                >
                  <Text style={[s.pvTabText, i === 0 && { color: design.primaryColor }]}>{x}</Text>
                </View>
              ))}
            </View>

            {/* Product grid */}
            <View style={s.pvGrid}>
              {previewProducts.map((p) => (
                <View key={p.id} style={s.pvCard}>
                  <View style={s.pvImg}>
                    <Ionicons name="image-outline" size={24} color="#CBD5E1" />
                  </View>
                  <View style={[s.pvOverlay, { backgroundColor: overlayHex }]}>
                    <Text style={[s.pvCardTitle, { color: design.productCardTitleColor }]} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text style={[s.pvCardPrice, { color: design.productCardPriceColor }]}>
                      E£{Number(p.price).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Footer */}
            <View style={[s.pvFooter, { backgroundColor: footerBg }]}>
              <Text style={[s.pvFooterText, { color: design.footerTextColor }]}>Powered by Ray</Text>
              <View style={s.pvFooterSocials}>
                <Ionicons name="logo-whatsapp" size={16} color={design.footerTextColor + '88'} />
                <Ionicons name="logo-instagram" size={16} color={design.footerTextColor + '88'} />
                <Ionicons name="logo-facebook" size={16} color={design.footerTextColor + '88'} />
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

/* ── Styles ── */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  tabBtnActive: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1' },
  tabText: { fontSize: 13, fontWeight: '800', color: '#64748B' },
  tabTextActive: { color: '#0F172A' },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#0F172A',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },

  /* Scroll */
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 10 },

  /* Section accordion */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionHeaderTitle: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },

  /* Fields */
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '800', color: '#475569' },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  switchLabel: { fontSize: 13, fontWeight: '800', color: '#0F172A' },

  /* Chips */
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  chipText: { fontSize: 12, fontWeight: '800', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },

  /* Visibility dot */
  visDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' },
  visDotOn: { backgroundColor: '#00E5FF', borderColor: '#00E5FF' },

  /* ── Preview ── */
  previewWrap: { padding: 16, paddingBottom: 40 },
  previewShell: {
    borderWidth: 2,
    borderRadius: 28,
    overflow: 'hidden',
    minHeight: 700,
  },

  /* Preview header */
  pvHeader: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pvHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pvLogo: { width: 40, height: 40, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  pvShopName: { fontSize: 16, fontWeight: '900' },
  pvShopCat: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  pvFollowBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, backgroundColor: '#FFFFFF' },
  pvFollowText: { fontSize: 12, fontWeight: '900' },

  /* Preview tabs */
  pvTabsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  pvTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  pvTabText: { fontSize: 12, fontWeight: '900', color: '#64748B' },

  /* Preview product grid */
  pvGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  pvCard: { width: '47.5%', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  pvImg: { height: 110, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  pvOverlay: { padding: 12, gap: 4 },
  pvCardTitle: { fontSize: 13, fontWeight: '900' },
  pvCardPrice: { fontSize: 12, fontWeight: '900' },

  /* Preview footer */
  pvFooter: { paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  pvFooterText: { fontSize: 12, fontWeight: '800' },
  pvFooterSocials: { flexDirection: 'row', gap: 10 },
});
