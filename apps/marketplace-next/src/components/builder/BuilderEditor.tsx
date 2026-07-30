'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout, Palette, Type, Image as ImageIcon, Globe, Save, Eye, Rocket,
  ChevronLeft, ChevronRight, Smartphone, Monitor, Tablet,
  Plus, Trash2, Copy, ArrowUp, ArrowDown, Settings, Sparkles, X,
} from 'lucide-react';
import { DesignTokens, PageSchema, PageSection, DEFAULT_DESIGN_TOKENS } from '@/types/pageSchema';

type BuilderTab = 'sections' | 'design' | 'content' | 'pages' | 'settings';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

interface BuilderEditorProps {
  websiteId: string;
  initialDesignTokens?: DesignTokens;
  initialPageSchema?: PageSchema;
  shopName?: string;
}

const SECTION_TYPES = [
  { type: 'hero', label: 'واجهة', icon: '🖼️' },
  { type: 'features', label: 'مميزات', icon: '⭐' },
  { type: 'products', label: 'منتجات', icon: '🛍️' },
  { type: 'about', label: 'من نحن', icon: '📖' },
  { type: 'gallery', label: 'معرض صور', icon: '📸' },
  { type: 'contact', label: 'تواصل', icon: '📞' },
  { type: 'map', label: 'خريطة', icon: '🗺️' },
  { type: 'reviews', label: 'تقييمات', icon: '⭐' },
  { type: 'hours', label: 'ساعات العمل', icon: '🕐' },
  { type: 'team', label: 'فريق العمل', icon: '👥' },
  { type: 'pricing', label: 'الأسعار', icon: '💰' },
  { type: 'faq', label: 'أسئلة شائعة', icon: '❓' },
  { type: 'cta', label: 'دعوة للتواصل', icon: '📢' },
  { type: 'social', label: 'تواصل اجتماعي', icon: '🔗' },
  { type: 'custom', label: 'مخصص', icon: '✨' },
];

const STYLE_PRESETS = [
  { id: 'modern', label: 'عصري', colors: { primary: '#00E5FF', secondary: '#BD00FF', background: '#FFFFFF' } },
  { id: 'luxury', label: 'فاخر', colors: { primary: '#D4AF37', secondary: '#1A1A1A', background: '#0A0A0A' } },
  { id: 'minimal', label: 'بسيط', colors: { primary: '#000000', secondary: '#64748B', background: '#FFFFFF' } },
  { id: 'dark', label: 'داكن', colors: { primary: '#00E5FF', secondary: '#BD00FF', background: '#0A0A0A' } },
  { id: 'elegant', label: 'أنيق', colors: { primary: '#7C3AED', secondary: '#0F172A', background: '#FAFAFA' } },
  { id: 'corporate', label: 'مؤسسي', colors: { primary: '#2563EB', secondary: '#1E40AF', background: '#FFFFFF' } },
  { id: 'playful', label: 'مرح', colors: { primary: '#F59E0B', secondary: '#EF4444', background: '#FFFBEB' } },
  { id: 'bold', label: 'جريء', colors: { primary: '#DC2626', secondary: '#000000', background: '#FFFFFF' } },
];

export default function BuilderEditor({
  websiteId,
  initialDesignTokens,
  initialPageSchema,
  shopName = 'موقعي',
}: BuilderEditorProps) {
  const [activeTab, setActiveTab] = useState<BuilderTab>('sections');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [designTokens, setDesignTokens] = useState<DesignTokens>(initialDesignTokens || DEFAULT_DESIGN_TOKENS);
  const [pageSchema, setPageSchema] = useState<PageSchema>(initialPageSchema || {
    version: '1.0.0',
    sections: [
      { id: 'hero', type: 'hero', visible: true, title: shopName },
      { id: 'features', type: 'features', visible: true, title: 'مميزاتنا' },
      { id: 'contact', type: 'contact', visible: true, title: 'تواصل معنا' },
    ],
  });
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Apply design tokens as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (designTokens.colors?.primary) root.style.setProperty('--brand-primary', designTokens.colors.primary);
    if (designTokens.colors?.secondary) root.style.setProperty('--brand-secondary', designTokens.colors.secondary);
    if (designTokens.colors?.background) root.style.setProperty('--brand-bg', designTokens.colors.background);
    if (designTokens.colors?.surface) root.style.setProperty('--brand-surface', designTokens.colors.surface);
    if (designTokens.radius?.card) root.style.setProperty('--brand-radius-card', `${designTokens.radius.card}px`);
  }, [designTokens]);

  const handleAddSection = useCallback((type: string) => {
    const newSection: PageSection = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      visible: true,
      title: SECTION_TYPES.find(s => s.type === type)?.label || '',
    };
    setPageSchema(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  }, []);

  const handleDeleteSection = useCallback((id: string) => {
    setPageSchema(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id),
    }));
    if (selectedSectionId === id) setSelectedSectionId(null);
  }, [selectedSectionId]);

  const handleMoveSection = useCallback((id: string, direction: 'up' | 'down') => {
    setPageSchema(prev => {
      const sections = [...prev.sections];
      const index = sections.findIndex(s => s.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= sections.length) return prev;
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
      return { ...prev, sections };
    });
  }, []);

  const handleDuplicateSection = useCallback((id: string) => {
    setPageSchema(prev => {
      const section = prev.sections.find(s => s.id === id);
      if (!section) return prev;
      const newSection = { ...section, id: `${section.type}-${Date.now()}` };
      const index = prev.sections.findIndex(s => s.id === id);
      const sections = [...prev.sections];
      sections.splice(index + 1, 0, newSection);
      return { ...prev, sections };
    });
  }, []);

  const handleToggleSection = useCallback((id: string) => {
    setPageSchema(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s),
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save via API
      await fetch(`/api/v1/websites/${websiteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designTokens, pageSchema }),
      });
    } catch {
      // silent fail in demo
    } finally {
      setIsSaving(false);
    }
  }, [websiteId, designTokens, pageSchema]);

  const handleApplyPreset = useCallback((preset: typeof STYLE_PRESETS[0]) => {
    setDesignTokens(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        primary: preset.colors.primary,
        secondary: preset.colors.secondary,
        background: preset.colors.background,
      },
    }));
  }, []);

  const deviceWidth = deviceMode === 'desktop' ? '100%' : deviceMode === 'tablet' ? '768px' : '375px';

  const tabs: { id: BuilderTab; label: string; icon: any }[] = [
    { id: 'sections', label: 'الأقسام', icon: Layout },
    { id: 'design', label: 'التصميم', icon: Palette },
    { id: 'content', label: 'المحتوى', icon: Type },
    { id: 'pages', label: 'الصفحات', icon: ImageIcon },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-slate-100 dark:bg-brand-black flex flex-col overflow-hidden" style={{ paddingTop: 0 }}>
      {/* Top Bar */}
      <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            {sidebarOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <h1 className="font-black text-sm hidden md:block">{shopName}</h1>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {([
            { mode: 'desktop', icon: Monitor },
            { mode: 'tablet', icon: Tablet },
            { mode: 'mobile', icon: Smartphone },
          ] as const).map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setDeviceMode(mode)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                deviceMode === mode ? 'bg-white dark:bg-slate-700 shadow-sm' : ''
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiPanel(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-gradient text-white text-xs font-black hover:shadow-glow-cyan transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden md:inline">مساعد ذكي</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto flex-shrink-0"
            >
              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-brand-cyan/10 text-brand-cyan'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === 'sections' && (
                  <div>
                    <h3 className="font-black text-sm mb-4">إضافة قسم</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {SECTION_TYPES.map((section) => (
                        <button
                          key={section.type}
                          onClick={() => handleAddSection(section.type)}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-cyan/10 hover:border-brand-cyan/20 border border-transparent transition-all"
                        >
                          <span className="text-2xl">{section.icon}</span>
                          <span className="text-xs font-bold">{section.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Current Sections */}
                    <div className="mt-6">
                      <h3 className="font-black text-sm mb-3">الأقسام الحالية</h3>
                      <div className="space-y-2">
                        {pageSchema.sections.map((section, index) => (
                          <div
                            key={section.id}
                            className={`group p-3 rounded-2xl border transition-all cursor-pointer ${
                              selectedSectionId === section.id
                                ? 'border-brand-cyan bg-brand-cyan/5'
                                : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                            } ${!section.visible ? 'opacity-50' : ''}`}
                            onClick={() => setSelectedSectionId(section.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold">{section.title || section.type}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); handleMoveSection(section.id, 'up'); }} className="w-6 h-6 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center" disabled={index === 0}>
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleMoveSection(section.id, 'down'); }} className="w-6 h-6 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center" disabled={index === pageSchema.sections.length - 1}>
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDuplicateSection(section.id); }} className="w-6 h-6 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center">
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }} className="w-6 h-6 rounded-lg hover:bg-red-500/10 flex items-center justify-center">
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'design' && (
                  <div>
                    <h3 className="font-black text-sm mb-4">أنماط جاهزة</h3>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {STYLE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleApplyPreset(preset)}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:border-brand-cyan/20 border border-transparent transition-all text-right"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: preset.colors.primary }} />
                            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: preset.colors.secondary }} />
                          </div>
                          <span className="text-xs font-bold">{preset.label}</span>
                        </button>
                      ))}
                    </div>

                    <h3 className="font-black text-sm mb-3">الألوان</h3>
                    <div className="space-y-3">
                      <ColorInput
                        label="اللون الأساسي"
                        value={designTokens.colors?.primary || '#00E5FF'}
                        onChange={(v) => setDesignTokens(prev => ({ ...prev, colors: { ...prev.colors, primary: v } }))}
                      />
                      <ColorInput
                        label="اللون الثانوي"
                        value={designTokens.colors?.secondary || '#BD00FF'}
                        onChange={(v) => setDesignTokens(prev => ({ ...prev, colors: { ...prev.colors, secondary: v } }))}
                      />
                      <ColorInput
                        label="لون الخلفية"
                        value={designTokens.colors?.background || '#FFFFFF'}
                        onChange={(v) => setDesignTokens(prev => ({ ...prev, colors: { ...prev.colors, background: v } }))}
                      />
                      <ColorInput
                        label="لون السطح"
                        value={designTokens.colors?.surface || '#F8FAFC'}
                        onChange={(v) => setDesignTokens(prev => ({ ...prev, colors: { ...prev.colors, surface: v } }))}
                      />
                    </div>

                    <h3 className="font-black text-sm mb-3 mt-6">الخطوط</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">عائلة الخط</label>
                        <select
                          className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm font-bold border border-transparent focus:border-brand-cyan/20 outline-none"
                          value={designTokens.typography?.fontFamily || 'Alexandria'}
                          onChange={(e) => setDesignTokens(prev => ({ ...prev, typography: { ...prev.typography, fontFamily: e.target.value } }))}
                        >
                          <option value="Alexandria">Alexandria</option>
                          <option value="Cairo">Cairo</option>
                          <option value="Tajawal">Tajawal</option>
                          <option value="Almarai">Almarai</option>
                          <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
                        </select>
                      </div>
                    </div>

                    <h3 className="font-black text-sm mb-3 mt-6">الحواف</h3>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">نصف قطر البطاقة</label>
                      <select
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm font-bold border border-transparent focus:border-brand-cyan/20 outline-none"
                        value={designTokens.radius?.card || '2xl'}
                        onChange={(e) => setDesignTokens(prev => ({ ...prev, radius: { ...prev.radius, card: e.target.value as any } }))}
                      >
                        <option value="none">بلا</option>
                        <option value="sm">صغير</option>
                        <option value="md">متوسط</option>
                        <option value="lg">كبير</option>
                        <option value="xl">كبير جداً</option>
                        <option value="2xl">ضخم</option>
                        <option value="full">دائري</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'content' && (
                  <div>
                    <h3 className="font-black text-sm mb-4">تحرير المحتوى</h3>
                    {selectedSectionId ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">عنوان القسم</label>
                          <input
                            type="text"
                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm font-bold border border-transparent focus:border-brand-cyan/20 outline-none"
                            value={pageSchema.sections.find(s => s.id === selectedSectionId)?.title || ''}
                            onChange={(e) => {
                              setPageSchema(prev => ({
                                ...prev,
                                sections: prev.sections.map(s => s.id === selectedSectionId ? { ...s, title: e.target.value } : s),
                              }));
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">محتوى القسم</label>
                          <textarea
                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm font-bold border border-transparent focus:border-brand-cyan/20 outline-none min-h-[120px] resize-y"
                            placeholder="اكتب المحتوى هنا..."
                            value={(pageSchema.sections.find(s => s.id === selectedSectionId)?.content as any)?.text || ''}
                            onChange={(e) => {
                              setPageSchema(prev => ({
                                ...prev,
                                sections: prev.sections.map(s => s.id === selectedSectionId ? { ...s, content: { text: e.target.value } } : s),
                              }));
                            }}
                          />
                        </div>
                        <button
                          onClick={() => handleToggleSection(selectedSectionId)}
                          className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                          {pageSchema.sections.find(s => s.id === selectedSectionId)?.visible ? 'إخفاء القسم' : 'إظهار القسم'}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 font-bold text-center py-8">اختر قسماً من القائمة لتحرير محتواه</p>
                    )}
                  </div>
                )}

                {activeTab === 'pages' && (
                  <div>
                    <h3 className="font-black text-sm mb-4">الصفحات</h3>
                    <div className="space-y-2">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                        <span className="text-sm font-bold">الصفحة الرئيسية</span>
                        <span className="text-xs text-brand-cyan font-black">نشطة</span>
                      </div>
                      <button className="w-full p-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-400 hover:border-brand-cyan/30 hover:text-brand-cyan transition-all flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        صفحة جديدة
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h3 className="font-black text-sm mb-4">إعدادات الموقع</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">اسم الموقع</label>
                        <input type="text" defaultValue={shopName} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm font-bold border border-transparent focus:border-brand-cyan/20 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">النطاق</label>
                        <input type="text" placeholder="example.com" dir="ltr" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm font-bold border border-transparent focus:border-brand-cyan/20 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">وصف الموقع (SEO)</label>
                        <textarea placeholder="وصف مختصر لموقعك" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm font-bold border border-transparent focus:border-brand-cyan/20 outline-none min-h-[80px] resize-y" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto bg-slate-200 dark:bg-slate-950 flex justify-center p-4">
          <div
            className="bg-white dark:bg-slate-900 shadow-2xl transition-all duration-300 overflow-y-auto"
            style={{
              width: deviceWidth,
              maxWidth: '100%',
              height: '100%',
              borderRadius: deviceMode !== 'desktop' ? 24 : 0,
              backgroundColor: designTokens.colors?.background || '#FFFFFF',
            }}
          >
            {/* Preview Content */}
            <div className="min-h-full">
              {pageSchema.sections.filter(s => s.visible).map((section, i) => (
                <PreviewSection
                  key={section.id}
                  section={section}
                  designTokens={designTokens}
                  isSelected={selectedSectionId === section.id}
                  onSelect={() => setSelectedSectionId(section.id)}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Panel */}
      <AnimatePresence>
        {showAiPanel && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-14 right-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-cyan" />
                <h3 className="font-black">المساعد الذكي</h3>
              </div>
              <button onClick={() => setShowAiPanel(false)} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/10">
                  <p className="text-sm font-bold mb-3">صف لي نشاطك وسأقوم بإنشاء تصميم مناسب</p>
                  <textarea
                    placeholder="مثال: أمتلك مطعماً للوجبات السريعة في القاهرة وأريد موقعاً عصرياً..."
                    className="w-full bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-sm font-bold border border-transparent focus:border-brand-cyan/20 outline-none min-h-[100px] resize-y"
                  />
                  <button className="w-full mt-3 py-2.5 rounded-xl bg-brand-gradient text-white font-black text-sm hover:shadow-glow-cyan transition-all flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    توليد التصميم
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 font-bold">المساعد الذكي قيد التطوير. سيكون متاحاً قريباً.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Color Input Component ─────────────────────────────────────

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          className="w-24 bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-xs font-bold border border-transparent focus:border-brand-cyan/20 outline-none text-right"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
        />
      </div>
    </div>
  );
}

// ─── Preview Section Component ─────────────────────────────────

function PreviewSection({
  section,
  designTokens,
  isSelected,
  onSelect,
  index,
}: {
  section: PageSection;
  designTokens: DesignTokens;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const primary = designTokens.colors?.primary || '#00E5FF';
  const secondary = designTokens.colors?.secondary || '#BD00FF';
  const background = designTokens.colors?.background || '#FFFFFF';
  const surface = designTokens.colors?.surface || '#F8FAFC';
  const radiusMap: Record<string, number> = { none: 0, sm: 4, md: 8, lg: 16, xl: 24, '2xl': 32, full: 9999 };
  const radius = radiusMap[designTokens.radius?.card || '2xl'] || 32;
  const content = (section.content as any)?.text || '';

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer transition-all ${isSelected ? 'ring-2 ring-brand-cyan' : 'hover:ring-1 hover:ring-slate-300'}`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-lg bg-brand-cyan text-white text-xs font-black">
          {section.title || section.type}
        </div>
      )}
      {renderSectionPreview(section.type, { primary, secondary, background, surface, radius, title: section.title, content, index })}
    </div>
  );
}

function renderSectionPreview(type: string, props: any) {
  const { primary, secondary, background, surface, radius, title, content, index } = props;

  switch (type) {
    case 'hero':
      return (
        <div className="relative min-h-[400px] flex items-center justify-center p-8 text-center" style={{ background: `linear-gradient(135deg, ${primary}22, ${secondary}11)` }}>
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black mb-4" style={{ color: primary }}>{title || 'عنوان رئيسي'}</h1>
            <p className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-6">{content || 'وصف مختصر يجذب الزوار'}</p>
            <div className="flex gap-3 justify-center">
              <button className="px-6 py-3 rounded-2xl font-black text-white" style={{ backgroundColor: primary, borderRadius: radius }}>ابدأ الآن</button>
              <button className="px-6 py-3 rounded-2xl font-black border-2" style={{ borderColor: secondary, borderRadius: radius, color: secondary }}>تواصل معنا</button>
            </div>
          </div>
        </div>
      );
    case 'features':
      return (
        <div className="py-16 px-8" style={{ backgroundColor: background }}>
          <h2 className="text-3xl font-black text-center mb-12">{title || 'مميزاتنا'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 text-center" style={{ backgroundColor: surface, borderRadius: radius }}>
                <div className="w-12 h-12 mx-auto rounded-2xl mb-4" style={{ backgroundColor: primary + '22' }}>
                  <div className="w-full h-full rounded-2xl" style={{ backgroundColor: primary, opacity: 0.3 }} />
                </div>
                <h3 className="font-black mb-2">ميزة {n}</h3>
                <p className="text-sm text-slate-500 font-bold">وصف مختصر للميزة</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 'products':
      return (
        <div className="py-16 px-8" style={{ backgroundColor: surface }}>
          <h2 className="text-3xl font-black text-center mb-12">{title || 'منتجاتنا'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{ backgroundColor: background, borderRadius: radius }} className="overflow-hidden">
                <div className="aspect-square" style={{ background: `linear-gradient(135deg, ${primary}22, ${secondary}11)` }} />
                <div className="p-3">
                  <h3 className="font-black text-sm mb-1">منتج {n}</h3>
                  <p className="text-xs font-bold" style={{ color: primary }}>ج.م 99</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'about':
      return (
        <div className="py-16 px-8 max-w-4xl mx-auto text-center" style={{ backgroundColor: background }}>
          <h2 className="text-3xl font-black mb-6">{title || 'من نحن'}</h2>
          <p className="text-lg font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{content || 'نص تعريفي عن النشاط التجاري وما يقدمه من خدمات ومنتجات للعملاء.'}</p>
        </div>
      );
    case 'gallery':
      return (
        <div className="py-16 px-8" style={{ backgroundColor: surface }}>
          <h2 className="text-3xl font-black text-center mb-12">{title || 'معرض الصور'}</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="aspect-square rounded-2xl" style={{ background: `linear-gradient(135deg, ${primary}${n % 2 ? '22' : '11'}, ${secondary}${n % 2 ? '11' : '22'})`, borderRadius: radius }} />
            ))}
          </div>
        </div>
      );
    case 'contact':
      return (
        <div className="py-16 px-8 max-w-2xl mx-auto" style={{ backgroundColor: background }}>
          <h2 className="text-3xl font-black text-center mb-12">{title || 'تواصل معنا'}</h2>
          <div className="space-y-4">
            <input type="text" placeholder="الاسم" className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold text-sm outline-none" style={{ borderRadius: radius }} />
            <input type="email" placeholder="البريد الإلكتروني" className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold text-sm outline-none" style={{ borderRadius: radius }} />
            <textarea placeholder="رسالتك" className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold text-sm outline-none min-h-[120px] resize-y" style={{ borderRadius: radius }} />
            <button className="w-full py-3 rounded-2xl font-black text-white" style={{ backgroundColor: primary, borderRadius: radius }}>إرسال</button>
          </div>
        </div>
      );
    case 'map':
      return (
        <div className="py-16 px-8" style={{ backgroundColor: surface }}>
          <h2 className="text-3xl font-black text-center mb-12">{title || 'موقعنا'}</h2>
          <div className="max-w-4xl mx-auto aspect-video rounded-3xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}11, ${secondary}11)`, borderRadius: radius }}>
            <span className="text-slate-400 font-bold">خريطة</span>
          </div>
        </div>
      );
    case 'reviews':
      return (
        <div className="py-16 px-8" style={{ backgroundColor: background }}>
          <h2 className="text-3xl font-black text-center mb-12">{title || 'آراء العملاء'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6" style={{ backgroundColor: surface, borderRadius: radius }}>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: '#FBBF24' }}>★</span>)}
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4">"تقييم ممتاز من عميل راضٍ"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: primary + '22' }} />
                  <span className="font-black text-sm">عميل {n}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'hours':
      return (
        <div className="py-16 px-8 max-w-2xl mx-auto" style={{ backgroundColor: surface }}>
          <h2 className="text-3xl font-black text-center mb-12">{title || 'ساعات العمل'}</h2>
          <div className="space-y-2">
            {['السبت - الأربعاء: 9 ص - 11 م', 'الخميس: 9 ص - 2 ص', 'الجمعة: 2 م - 2 ص'].map((h, i) => (
              <div key={i} className="flex items-center justify-between p-4 font-bold text-sm" style={{ backgroundColor: background, borderRadius: radius }}>
                <span>{h}</span>
                <span className="text-green-500 font-black">مفتوح</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'team':
      return (
        <div className="py-16 px-8" style={{ backgroundColor: background }}>
          <h2 className="text-3xl font-black text-center mb-12">{title || 'فريق العمل'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full mb-3" style={{ background: `linear-gradient(135deg, ${primary}33, ${secondary}22)` }} />
                <h3 className="font-black text-sm">عضو {n}</h3>
                <p className="text-xs text-slate-400 font-bold">المنصب</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 'pricing':
      return (
        <div className="py-16 px-8" style={{ backgroundColor: surface }}>
          <h2 className="text-3xl font-black text-center mb-12">{title || 'الأسعار'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 text-center" style={{ backgroundColor: background, borderRadius: radius }}>
                <h3 className="font-black mb-2">باقة {n}</h3>
                <div className="text-3xl font-black mb-4" style={{ color: primary }}>ج.م {n * 99}</div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500">ميزة 1</div>
                  <div className="text-xs font-bold text-slate-500">ميزة 2</div>
                  <div className="text-xs font-bold text-slate-500">ميزة 3</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'faq':
      return (
        <div className="py-16 px-8 max-w-3xl mx-auto" style={{ backgroundColor: background }}>
          <h2 className="text-3xl font-black text-center mb-12">{title || 'الأسئلة الشائعة'}</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-4" style={{ backgroundColor: surface, borderRadius: radius }}>
                <h3 className="font-black text-sm mb-2">سؤال {n}؟</h3>
                <p className="text-sm text-slate-500 font-bold">إجابة مختصرة على السؤال المطروح.</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 'cta':
      return (
        <div className="py-20 px-8 text-center" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{title || 'جاهز تبدأ؟'}</h2>
          <p className="text-lg text-white/80 font-bold mb-6">تواصل معنا اليوم</p>
          <button className="px-8 py-4 rounded-2xl bg-white font-black text-sm" style={{ borderRadius: radius, color: primary }}>تواصل الآن</button>
        </div>
      );
    case 'social':
      return (
        <div className="py-12 px-8 text-center" style={{ backgroundColor: surface }}>
          <h2 className="text-xl font-black mb-6">{title || 'تابعنا'}</h2>
          <div className="flex gap-3 justify-center">
            {['f', 't', 'i', 'in'].map((s, i) => (
              <div key={i} className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white" style={{ backgroundColor: primary, borderRadius: radius }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className="py-16 px-8 text-center" style={{ backgroundColor: surface }}>
          <h2 className="text-2xl font-black mb-4">{title || 'قسم مخصص'}</h2>
          <p className="text-slate-400 font-bold">{content || 'محتوى مخصص'}</p>
        </div>
      );
  }
}
