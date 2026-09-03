import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Upload,
  Palette,
  Type,
  Link,
  MessageCircle,
  Phone,
  Sliders,
  CheckCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  ArrowRight,
  Maximize2,
  RefreshCw,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import { ComponentNode, StyleProperties } from '../../types/builder';

// Curated high quality presets for luxury automotive showcase
const AUTOMOTIVE_PRESET_IMAGES = [
  {
    category: 'سيارات فاخرة ورياضية',
    items: [
      {
        name: 'بورش 911 توربو S',
        url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1000&auto=format&fit=crop&q=80',
        thumb: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=200&auto=format&fit=crop&q=80',
      },
      {
        name: 'مرسيدس AMG GT كوبيه',
        url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&auto=format&fit=crop&q=80',
        thumb: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=200&auto=format&fit=crop&q=80',
      },
      {
        name: 'رينج روفر فيلار أوتوبيوغرافي',
        url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&auto=format&fit=crop&q=80',
        thumb: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200&auto=format&fit=crop&q=80',
      },
      {
        name: 'بي إم دبليو M8 غران كوبيه',
        url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&auto=format&fit=crop&q=80',
        thumb: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&auto=format&fit=crop&q=80',
      },
      {
        name: 'أودي RS E-Tron كهربائية',
        url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1000&auto=format&fit=crop&q=80',
        thumb: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=200&auto=format&fit=crop&q=80',
      },
      {
        name: 'مازيراتي ليفانتي تروفيو',
        url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000&auto=format&fit=crop&q=80',
        thumb: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    category: 'خلفيات وصالات العرض',
    items: [
      {
        name: 'صالة عرض فاخرة بإضاءة هادئة',
        url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
        thumb: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=200&auto=format&fit=crop&q=80',
      },
      {
        name: 'أستوديو سيارات سينمائي داكن',
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
        thumb: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&auto=format&fit=crop&q=80',
      },
      {
        name: 'طريق جبلي سريع وقت الغروب',
        url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&auto=format&fit=crop&q=80',
        thumb: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&auto=format&fit=crop&q=80',
      },
    ],
  },
];

const BRAND_PALETTES = [
  { name: 'كحلي ملكي', bg: '#0f172a', text: '#ffffff', accent: '#3b82f6' },
  { name: 'أبيض ثلجي ناصع', bg: '#ffffff', text: '#0f172a', accent: '#1d4ed8' },
  { name: 'رمادي عصري ناعم', bg: '#f8fafc', text: '#1e293b', accent: '#2563eb' },
  { name: 'أسود أوبسيديان فاخر', bg: '#090d16', text: '#f1f5f9', accent: '#38bdf8' },
  { name: 'تدرج كحلي أزرق', bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', text: '#ffffff', accent: '#60a5fa' },
];

export const IntegratedSectionEditor: React.FC = () => {
  const {
    website,
    selectedNodeId,
    selectNode,
    updateNodeProps,
    updateNodeStyle,
    theme,
    viewport,
  } = useBuilder();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    content: true,
    media: true,
    colors: true,
    actions: true,
    subitems: true,
    advanced: false,
  });

  const [showPresetGallery, setShowPresetGallery] = useState<boolean>(false);
  const [activeGalleryTarget, setActiveGalleryTarget] = useState<string>('node'); // 'node' or node id

  if (!selectedNodeId) return null;
  const node = website.components[selectedNodeId];
  if (!node) return null;

  // Determine section ancestor if node is a child inside a section
  const findParentSection = (currNode: ComponentNode): ComponentNode | null => {
    if (['hero', 'header', 'footer', 'bento-grid', 'products', 'testimonials', 'cta', 'features'].includes(currNode.type)) {
      return currNode;
    }
    if (currNode.id.startsWith('comp_') || currNode.id.includes('hero') || currNode.id.includes('header') || currNode.id.includes('footer')) {
      return currNode;
    }
    if (!currNode.parentId) return null;
    const parent = website.components[currNode.parentId];
    if (!parent) return null;
    return findParentSection(parent);
  };

  const parentSection = findParentSection(node) || node;
  const isSectionSelected = parentSection.id === node.id;

  const toggleAccordion = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper to update props for any node
  const handlePropChange = (targetNodeId: string, key: string, value: any) => {
    updateNodeProps(targetNodeId, { [key]: value });
  };

  // Helper to update style for any node
  const handleStyleChange = (targetNodeId: string, key: keyof StyleProperties, value: any) => {
    updateNodeStyle(targetNodeId, { [key]: value }, viewport);
  };

  // Image Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetNodeId: string, isBackground = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (isBackground) {
        handleStyleChange(targetNodeId, 'backgroundImage', `url(${url})`);
        handleStyleChange(targetNodeId, 'backgroundSize', 'cover');
        handleStyleChange(targetNodeId, 'backgroundPosition', 'center');
      } else {
        handlePropChange(targetNodeId, 'src', url);
        handlePropChange(targetNodeId, 'image', url);
      }
    }
  };

  // Find sub-nodes within hero, header, etc.
  const findChildByKeyword = (startNode: ComponentNode, keyword: string): ComponentNode | null => {
    if (startNode.id.includes(keyword) || startNode.name.includes(keyword)) {
      return startNode;
    }
    if (startNode.childrenIds) {
      for (const cId of startNode.childrenIds) {
        const cNode = website.components[cId];
        if (cNode) {
          const found = findChildByKeyword(cNode, keyword);
          if (found) return found;
        }
      }
    }
    return null;
  };

  // Find all cards inside a products / bento section
  const findDescendantsByType = (startNode: ComponentNode, type: string): ComponentNode[] => {
    let results: ComponentNode[] = [];
    if (startNode.type === type || (type === 'card' && startNode.props?.price)) {
      results.push(startNode);
    }
    if (startNode.childrenIds) {
      for (const cId of startNode.childrenIds) {
        const cNode = website.components[cId];
        if (cNode) {
          results = results.concat(findDescendantsByType(cNode, type));
        }
      }
    }
    return results;
  };

  // Section Type Identification
  const sectionType = parentSection.type;
  const isHero = sectionType === 'hero' || parentSection.id === 'comp_hero';
  const isHeader = sectionType === 'header' || parentSection.id === 'comp_header';
  const isVehicles = sectionType === 'products' || parentSection.id === 'comp_products_grid';
  const isBento = sectionType === 'bento-grid' || parentSection.id === 'comp_bento_features';
  const isCta = sectionType === 'cta' || parentSection.id === 'comp_cta_banner';
  const isTestimonials = sectionType === 'testimonials' || parentSection.id === 'comp_testimonials';
  const isFooter = sectionType === 'footer' || parentSection.id === 'comp_footer';

  // Extract Hero Nodes
  const heroBadgeNode = isHero ? findChildByKeyword(parentSection, 'badge') : null;
  const heroTitleNode = isHero ? findChildByKeyword(parentSection, 'title') : null;
  const heroSubtitleNode = isHero ? findChildByKeyword(parentSection, 'subtitle') : null;
  const heroPrimaryBtnNode = isHero ? (website.components['hero_btn_primary'] || findChildByKeyword(parentSection, 'primary') || findChildByKeyword(parentSection, 'btn')) : null;
  const heroSecondaryBtnNode = isHero ? (website.components['hero_btn_secondary'] || findChildByKeyword(parentSection, 'secondary')) : null;
  const heroImageNode = isHero ? (website.components['hero_main_image'] || findChildByKeyword(parentSection, 'image')) : null;
  const heroStatsNode = isHero ? (website.components['hero_stats_row'] || findChildByKeyword(parentSection, 'stats')) : null;

  // Extract Header Nodes
  const headerLogoNode = isHeader ? findChildByKeyword(parentSection, 'logo') : null;
  const headerNavNode = isHeader ? findChildByKeyword(parentSection, 'nav') : null;
  const headerCtaBtn = isHeader ? findChildByKeyword(parentSection, 'cta_btn') : null;

  // Extract Vehicles Cards
  const vehicleCards = isVehicles ? findDescendantsByType(parentSection, 'card') : [];

  // Extract Bento Cards
  const bentoCards = isBento ? findDescendantsByType(parentSection, 'card') : [];

  const currentStyles = (node.styles[viewport] || node.styles.desktop || {}) as StyleProperties;
  const sectionStyles = (parentSection.styles[viewport] || parentSection.styles.desktop || {}) as StyleProperties;

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 select-none">
      {/* SECTION BREADCRUMB & CONTEXT BANNER */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50/60 border-b border-blue-100/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-blue-950">{parentSection.name}</span>
              <span className="text-[9px] bg-blue-200/70 text-blue-900 font-mono px-1.5 py-0.2 rounded font-bold">
                {parentSection.type}
              </span>
            </div>
            <span className="text-[10px] text-blue-600/80 font-medium">لوحة التعديل الشاملة (All-in-One)</span>
          </div>
        </div>

        {!isSectionSelected && (
          <button
            onClick={() => selectNode(parentSection.id)}
            className="px-2 py-1 bg-white hover:bg-blue-100/70 border border-blue-200 text-[10px] font-bold text-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            title="تحديد كامل القسم"
          >
            <span>تحديد القسم بالكامل</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* MODAL / POPOVER FOR CURATED IMAGE PRESETS */}
      {showPresetGallery && (
        <div className="p-3.5 bg-slate-900 text-white border-b border-slate-700 animate-in fade-in duration-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold">معرض الصور الفاخرة المدمج (اختر بنقرة واحدة)</span>
            </div>
            <button
              onClick={() => setShowPresetGallery(false)}
              className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
            >
              إغلاق
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {AUTOMOTIVE_PRESET_IMAGES.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-[10px] font-bold text-blue-400">{cat.category}</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {cat.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={() => {
                        const targetId = activeGalleryTarget === 'node' ? node.id : activeGalleryTarget;
                        if (isHero && heroImageNode) {
                          handlePropChange(heroImageNode.id, 'src', item.url);
                        } else if (node.type === 'image') {
                          handlePropChange(node.id, 'src', item.url);
                        } else if (node.props.image) {
                          handlePropChange(node.id, 'image', item.url);
                        } else {
                          // set as background image
                          handleStyleChange(targetId, 'backgroundImage', `url(${item.url})`);
                          handleStyleChange(targetId, 'backgroundSize', 'cover');
                          handleStyleChange(targetId, 'backgroundPosition', 'center');
                        }
                        setShowPresetGallery(false);
                      }}
                      className="group relative rounded-lg overflow-hidden border border-slate-700 hover:border-blue-400 transition-all text-right cursor-pointer"
                    >
                      <img src={item.thumb} alt={item.name} className="w-full h-14 object-cover group-hover:scale-105 transition-transform" />
                      <div className="p-1 bg-slate-950/90 text-[9px] font-medium text-slate-300 truncate">
                        {item.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACCORDION SECTIONS */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        
        {/* ============================================================ */}
        {/* 1. المحتوى والنصوص (CONTENT & TEXTS) */}
        {/* ============================================================ */}
        <div className="p-3">
          <button
            onClick={() => toggleAccordion('content')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors py-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-600" />
              <span>النصوص والمحتوى (Texts & Headings)</span>
            </div>
            {expandedSections.content ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {expandedSections.content && (
            <div className="space-y-3 pt-2.5">
              {/* HERO SPECIFIC TEXTS */}
              {isHero ? (
                <>
                  {heroBadgeNode && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">الشارة الترويجية (Badge Text)</label>
                      <input
                        type="text"
                        value={heroBadgeNode.props.text || ''}
                        onChange={(e) => handlePropChange(heroBadgeNode.id, 'text', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-hidden focus:border-blue-500 focus:bg-white"
                        placeholder="مثال: أسطول 2025 | الفخامة بلا حدود"
                      />
                    </div>
                  )}

                  {heroTitleNode && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">العنوان الرئيسي للهيرو (Hero Title)</label>
                      <textarea
                        rows={2}
                        value={heroTitleNode.props.text || ''}
                        onChange={(e) => handlePropChange(heroTitleNode.id, 'text', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900 outline-hidden focus:border-blue-500 focus:bg-white leading-relaxed"
                        placeholder="العنوان الرئيسي..."
                      />
                    </div>
                  )}

                  {heroSubtitleNode && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">الوصف والفقرة الفرعية (Hero Subtitle)</label>
                      <textarea
                        rows={3}
                        value={heroSubtitleNode.props.text || ''}
                        onChange={(e) => handlePropChange(heroSubtitleNode.id, 'text', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white leading-relaxed"
                        placeholder="الوصف التوضيحي..."
                      />
                    </div>
                  )}

                  {/* Primary & Secondary CTA Text */}
                  <div className="grid grid-cols-2 gap-2">
                    {heroPrimaryBtnNode && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">نص الزر الأساسي</label>
                        <input
                          type="text"
                          value={heroPrimaryBtnNode.props.text || ''}
                          onChange={(e) => handlePropChange(heroPrimaryBtnNode.id, 'text', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-blue-700 outline-hidden focus:border-blue-500 focus:bg-white"
                          placeholder="تصفح الأسطول"
                        />
                      </div>
                    )}
                    {heroSecondaryBtnNode && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">نص الزر الثانوي</label>
                        <input
                          type="text"
                          value={heroSecondaryBtnNode.props.text || ''}
                          onChange={(e) => handlePropChange(heroSecondaryBtnNode.id, 'text', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white"
                          placeholder="تواصل معنا"
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : isHeader ? (
                <>
                  {headerLogoNode && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">اسم المعرض / الشعار (Logo Brand)</label>
                      <input
                        type="text"
                        value={headerLogoNode.props.text || ''}
                        onChange={(e) => handlePropChange(headerLogoNode.id, 'text', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900 outline-hidden focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  )}
                  {headerCtaBtn && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">نص زر الترويسة (Header CTA)</label>
                      <input
                        type="text"
                        value={headerCtaBtn.props.text || ''}
                        onChange={(e) => handlePropChange(headerCtaBtn.id, 'text', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-blue-700 outline-hidden focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  )}
                </>
              ) : (
                /* GENERIC NODE CONTENT */
                <div className="space-y-2.5">
                  {node.props.text !== undefined && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">النص (Text Content)</label>
                      <textarea
                        rows={3}
                        value={node.props.text}
                        onChange={(e) => handlePropChange(node.id, 'text', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-hidden focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  )}

                  {node.props.title !== undefined && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">العنوان الرئيسي (Title)</label>
                      <input
                        type="text"
                        value={node.props.title}
                        onChange={(e) => handlePropChange(node.id, 'title', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900 outline-hidden focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  )}

                  {node.props.subtitle !== undefined && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">العنوان الفرعي (Subtitle)</label>
                      <textarea
                        rows={2}
                        value={node.props.subtitle}
                        onChange={(e) => handlePropChange(node.id, 'subtitle', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  )}

                  {node.props.badge !== undefined && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">الشارة (Badge)</label>
                      <input
                        type="text"
                        value={node.props.badge}
                        onChange={(e) => handlePropChange(node.id, 'badge', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-blue-700 font-semibold outline-hidden focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  )}

                  {node.props.price !== undefined && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">السعر (Price)</label>
                      <input
                        type="text"
                        value={node.props.price}
                        onChange={(e) => handlePropChange(node.id, 'price', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-blue-700 font-black outline-hidden focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 2. الوسائط والصور المدمجة (INTEGRATED MEDIA & IMAGES) */}
        {/* ============================================================ */}
        <div className="p-3">
          <button
            onClick={() => toggleAccordion('media')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors py-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>الصور والوسائط (Media & Imagery)</span>
            </div>
            {expandedSections.media ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {expandedSections.media && (
            <div className="space-y-3 pt-2.5">
              {/* CURRENT IMAGE PREVIEW & QUICK REPLACE */}
              {((isHero && heroImageNode) || node.type === 'image' || node.props.image || node.props.src || currentStyles.backgroundImage) && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600">الصورة الحالية</span>
                    <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">Live Preview</span>
                  </div>

                  <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                    <img
                      src={
                        (isHero && heroImageNode?.props?.src) ||
                        node.props.src ||
                        node.props.image ||
                        currentStyles.backgroundImage?.replace(/url\(['"]?(.*?)['"]?\)/, '$1') ||
                        'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="معاينة الصورة"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* ACTION BUTTONS: UPLOAD & PRESETS */}
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer shadow-2xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>رفع من الجهاز</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const targetId = isHero && heroImageNode ? heroImageNode.id : node.id;
                          handleFileUpload(e, targetId);
                        }}
                      />
                    </label>

                    <button
                      onClick={() => {
                        setActiveGalleryTarget(isHero && heroImageNode ? heroImageNode.id : node.id);
                        setShowPresetGallery(true);
                      }}
                      className="flex items-center justify-center gap-1.5 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>معرض الصور</span>
                    </button>
                  </div>

                  {/* DIRECT IMAGE URL INPUT */}
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1">رابط مباشر للصورة (Image URL)</label>
                    <input
                      type="text"
                      value={
                        (isHero && heroImageNode?.props?.src) ||
                        node.props.src ||
                        node.props.image ||
                        ''
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isHero && heroImageNode) {
                          handlePropChange(heroImageNode.id, 'src', val);
                        } else if (node.props.image) {
                          handlePropChange(node.id, 'image', val);
                        } else {
                          handlePropChange(node.id, 'src', val);
                        }
                      }}
                      placeholder="https://..."
                      className="w-full bg-white border border-slate-200 rounded p-1.5 font-mono text-[10px] text-slate-600 outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* BACKGROUND IMAGE FOR SECTION CONTAINER */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700">صورة خلفية القسم (Section Background)</span>
                  {sectionStyles.backgroundImage && (
                    <button
                      onClick={() => handleStyleChange(parentSection.id, 'backgroundImage', undefined)}
                      className="text-[9px] text-rose-600 hover:underline cursor-pointer"
                    >
                      إزالة الخلفية
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <label className="flex items-center justify-center gap-1.5 p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer transition-colors">
                    <Upload className="w-3 h-3 text-blue-600" />
                    <span>رفع خلفية</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, parentSection.id, true)}
                    />
                  </label>

                  <button
                    onClick={() => {
                      setActiveGalleryTarget(parentSection.id);
                      setShowPresetGallery(true);
                    }}
                    className="flex items-center justify-center gap-1.5 p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3 h-3 text-blue-600" />
                    <span>خلفيات جاهزة</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 3. الألوان والسمة البصرية (COLORS & VISUAL STYLING) */}
        {/* ============================================================ */}
        <div className="p-3">
          <button
            onClick={() => toggleAccordion('colors')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors py-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span>الألوان والمظهر (Colors & Appearance)</span>
            </div>
            {expandedSections.colors ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {expandedSections.colors && (
            <div className="space-y-3 pt-2.5">
              {/* SECTION PRESET PALETTES */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1.5">أنماط ألوان جاهزة للقسم (One-Click Palettes)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {BRAND_PALETTES.map((pal, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => {
                        handleStyleChange(parentSection.id, 'backgroundColor', pal.bg);
                        handleStyleChange(parentSection.id, 'textColor', pal.text);
                        if (heroTitleNode) handleStyleChange(heroTitleNode.id, 'textColor', pal.text);
                        if (heroSubtitleNode) handleStyleChange(heroSubtitleNode.id, 'textColor', pal.bg.includes('#0') ? '#94a3b8' : '#475569');
                      }}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-2 text-right transition-colors cursor-pointer"
                    >
                      <div className="w-4 h-4 rounded-full border border-black/10 shrink-0" style={{ background: pal.bg }} />
                      <span className="text-[10px] font-bold text-slate-700 truncate">{pal.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* INDIVIDUAL COLOR PICKERS */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">لون خلفية العنصر</label>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                    <input
                      type="color"
                      value={currentStyles.backgroundColor?.startsWith('#') ? currentStyles.backgroundColor : '#ffffff'}
                      onChange={(e) => handleStyleChange(node.id, 'backgroundColor', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-[10px] font-mono text-slate-600 truncate">{currentStyles.backgroundColor || 'Default'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">لون النص (Text Color)</label>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                    <input
                      type="color"
                      value={currentStyles.textColor?.startsWith('#') ? currentStyles.textColor : '#0f172a'}
                      onChange={(e) => handleStyleChange(node.id, 'textColor', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-[10px] font-mono text-slate-600 truncate">{currentStyles.textColor || '#0f172a'}</span>
                  </div>
                </div>
              </div>

              {/* PRIMARY BUTTON STYLING (IF HERO) */}
              {isHero && heroPrimaryBtnNode && (
                <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-blue-900 block">لون وتصميم الزر الأساسي</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 block mb-0.5">لون الزر</label>
                      <input
                        type="color"
                        value={heroPrimaryBtnNode.styles.desktop?.backgroundColor || '#1d4ed8'}
                        onChange={(e) => handleStyleChange(heroPrimaryBtnNode.id, 'backgroundColor', e.target.value)}
                        className="w-full h-7 rounded border border-slate-200 cursor-pointer p-0.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 block mb-0.5">استدارة الحواف</label>
                      <input
                        type="text"
                        value={heroPrimaryBtnNode.styles.desktop?.borderRadius || '8px'}
                        onChange={(e) => handleStyleChange(heroPrimaryBtnNode.id, 'borderRadius', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1 text-center font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 4. الروابط وإجراءات التواصل (ACTIONS & DIRECT LINKS) */}
        {/* ============================================================ */}
        <div className="p-3">
          <button
            onClick={() => toggleAccordion('actions')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors py-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-blue-600" />
              <span>الروابط وأزرار الإجراءات (Actions & Links)</span>
            </div>
            {expandedSections.actions ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {expandedSections.actions && (
            <div className="space-y-3 pt-2.5">
              {/* PRIMARY ACTION / WHATSAPP / CALL */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700">رابط الزر الرئيسي (Primary Link)</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const waUrl = 'https://wa.me/966500000000?text=مرحباً، أود الاستفسار عن أسطول السيارات المتاح';
                        if (isHero && heroPrimaryBtnNode) {
                          handlePropChange(heroPrimaryBtnNode.id, 'url', waUrl);
                          handlePropChange(heroPrimaryBtnNode.id, 'href', waUrl);
                        } else {
                          handlePropChange(node.id, 'url', waUrl);
                          handlePropChange(node.id, 'href', waUrl);
                        }
                      }}
                      className="text-[9px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-2.5 h-2.5" />
                      <span>واتساب</span>
                    </button>
                    <button
                      onClick={() => {
                        const telUrl = 'tel:+966500000000';
                        if (isHero && heroPrimaryBtnNode) {
                          handlePropChange(heroPrimaryBtnNode.id, 'url', telUrl);
                        } else {
                          handlePropChange(node.id, 'url', telUrl);
                        }
                      }}
                      className="text-[9px] bg-blue-100 hover:bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-2.5 h-2.5" />
                      <span>اتصال</span>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={
                    (isHero && heroPrimaryBtnNode?.props?.url) ||
                    node.props.url ||
                    node.props.href ||
                    '#fleet'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isHero && heroPrimaryBtnNode) {
                      handlePropChange(heroPrimaryBtnNode.id, 'url', val);
                      handlePropChange(heroPrimaryBtnNode.id, 'href', val);
                    } else {
                      handlePropChange(node.id, 'url', val);
                      handlePropChange(node.id, 'href', val);
                    }
                  }}
                  placeholder="https://... أو #fleet"
                  className="w-full bg-white border border-slate-200 rounded p-1.5 font-mono text-[11px] text-slate-700 outline-hidden focus:border-blue-500"
                />
              </div>

              {/* SECONDARY ACTION */}
              {isHero && heroSecondaryBtnNode && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-700 block">رابط الزر الثانوي</span>
                  <input
                    type="text"
                    value={heroSecondaryBtnNode.props.url || heroSecondaryBtnNode.props.href || '#contact'}
                    onChange={(e) => {
                      handlePropChange(heroSecondaryBtnNode.id, 'url', e.target.value);
                      handlePropChange(heroSecondaryBtnNode.id, 'href', e.target.value);
                    }}
                    placeholder="#contact"
                    className="w-full bg-white border border-slate-200 rounded p-1.5 font-mono text-[11px] text-slate-700 outline-hidden focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 5. إدارة البطاقات والعناصر الفرعية (SUB-ITEMS & CARDS MANAGER) */}
        {/* ============================================================ */}
        {(isVehicles || isBento || isHero) && (
          <div className="p-3">
            <button
              onClick={() => toggleAccordion('subitems')}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors py-1 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {isVehicles ? 'أسطول المركبات والسيارات' : isHero ? 'أرقام وإحصائيات الهيرو' : 'بطاقات ومزايا القسم'}
                </span>
              </div>
              {expandedSections.subitems ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {expandedSections.subitems && (
              <div className="space-y-3 pt-2.5">
                {/* VEHICLES CARDS LIST */}
                {isVehicles && vehicleCards.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 block">قائمة السيارات المتاحة بالمعرض:</span>
                    {vehicleCards.map((vCard, vIdx) => (
                      <div key={vCard.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={vCard.props.image} alt="" className="w-10 h-7 rounded object-cover border border-slate-200 shrink-0" />
                            <span className="text-xs font-bold text-slate-900">{vCard.props.title || `سيارة #${vIdx + 1}`}</span>
                          </div>
                          <button
                            onClick={() => selectNode(vCard.id)}
                            className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                          >
                            تعديل مباشر
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={vCard.props.title || ''}
                            onChange={(e) => handlePropChange(vCard.id, 'title', e.target.value)}
                            placeholder="اسم السيارة"
                            className="bg-white border border-slate-200 rounded p-1 text-[11px] font-semibold"
                          />
                          <input
                            type="text"
                            value={vCard.props.price || ''}
                            onChange={(e) => handlePropChange(vCard.id, 'price', e.target.value)}
                            placeholder="السعر"
                            className="bg-white border border-slate-200 rounded p-1 text-[11px] font-bold text-blue-700"
                          />
                        </div>

                        {/* Quick photo change for car */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => {
                              setActiveGalleryTarget(vCard.id);
                              setShowPresetGallery(true);
                            }}
                            className="flex-1 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3 text-blue-600" />
                            <span>تغيير صورة السيارة</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* HERO STATS ITEMS */}
                {isHero && heroStatsNode && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 block">إحصائيات الثقة بالهيرو:</span>
                    {heroStatsNode.childrenIds?.map((statId) => {
                      const statNode = website.components[statId];
                      if (!statNode) return null;
                      return (
                        <div key={statId} className="p-2 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-400 block">الرقم / النسبة</label>
                            <input
                              type="text"
                              value={statNode.props.value || '+500'}
                              onChange={(e) => handlePropChange(statNode.id, 'value', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded p-1 text-xs font-black font-mono text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 block">الوصف</label>
                            <input
                              type="text"
                              value={statNode.props.label || 'سيارة فاخرة'}
                              onChange={(e) => handlePropChange(statNode.id, 'label', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded p-1 text-xs font-semibold text-slate-700"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 6. خيارات التخطيط والأبعاد المتقدمة (SPACING & ADVANCED) */}
        {/* ============================================================ */}
        <div className="p-3">
          <button
            onClick={() => toggleAccordion('advanced')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors py-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
              <span>المسافات والبادينج المتقدم (Padding & Spacing)</span>
            </div>
            {expandedSections.advanced ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {expandedSections.advanced && (
            <div className="space-y-3 pt-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">الحشو الداخلي للقسم (Padding Top/Bottom)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5">من الأعلى (Top)</span>
                    <input
                      type="text"
                      value={sectionStyles.paddingTop || '72px'}
                      onChange={(e) => handleStyleChange(parentSection.id, 'paddingTop', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-center font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5">من الأسفل (Bottom)</span>
                    <input
                      type="text"
                      value={sectionStyles.paddingBottom || '80px'}
                      onChange={(e) => handleStyleChange(parentSection.id, 'paddingBottom', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-center font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* BORDER RADIUS & SHADOW */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">استدارة الحواف</label>
                  <input
                    type="text"
                    value={currentStyles.borderRadius || ''}
                    onChange={(e) => handleStyleChange(node.id, 'borderRadius', e.target.value)}
                    placeholder="12px"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">الظل (Shadow)</label>
                  <select
                    value={currentStyles.boxShadow || 'none'}
                    onChange={(e) => handleStyleChange(node.id, 'boxShadow', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-medium"
                  >
                    <option value="none">بدون</option>
                    <option value="0 4px 6px -1px rgb(0 0 0 / 0.1)">ناعم</option>
                    <option value="0 10px 15px -3px rgb(0 0 0 / 0.1)">بارز</option>
                    <option value="0 20px 25px -5px rgb(0 0 0 / 0.1)">عائم</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
