import React, { useState } from 'react';
import {
  LayoutGrid,
  FileText,
  Palette,
  Sparkles,
  Play,
  Save,
  Loader2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';

export const MobileBuilderTabBar: React.FC = () => {
  const {
    activeSidebarTab,
    setActiveSidebarTab,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isMobileInspectorOpen,
    setIsMobileInspectorOpen,
    selectedNode,
    setIsLivePreviewOpen,
    saveDraft,
    autosaveStatus,
    isFocusMode,
  } = useBuilder();

  const [isSaving, setIsSaving] = useState(false);

  if (isFocusMode) return null;

  const handleOpenPanel = (tab: typeof activeSidebarTab) => {
    setActiveSidebarTab(tab);
    setIsMobileSidebarOpen(true);
    // Close inspector if opening sidebar
    setIsMobileInspectorOpen(false);
  };

  const handleToggleInspector = () => {
    setIsMobileInspectorOpen(!isMobileInspectorOpen);
    // Close sidebar if opening inspector
    setIsMobileSidebarOpen(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDraft(true);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  return (
    <nav
      id="mobile_builder_tab_bar"
      aria-label="شريط أدوات مُنشئ المواقع للجوال"
      className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 flex items-center justify-around px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none safe-area-pb"
    >
      {/* 1. Add Sections / Library */}
      <button
        type="button"
        onClick={() => handleOpenPanel('sections')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
          isMobileSidebarOpen && activeSidebarTab === 'sections'
            ? 'text-blue-600 font-bold bg-blue-50'
            : 'text-slate-600 hover:text-slate-900 active:scale-95'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="text-[10px] font-bold">الأقسام</span>
      </button>

      {/* 2. Pages */}
      <button
        type="button"
        onClick={() => handleOpenPanel('pages')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
          isMobileSidebarOpen && activeSidebarTab === 'pages'
            ? 'text-blue-600 font-bold bg-blue-50'
            : 'text-slate-600 hover:text-slate-900 active:scale-95'
        }`}
      >
        <FileText className="w-4 h-4" />
        <span className="text-[10px] font-bold">الصفحات</span>
      </button>

      {/* 3. Theme / Design System */}
      <button
        type="button"
        onClick={() => handleOpenPanel('design')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
          isMobileSidebarOpen && activeSidebarTab === 'design'
            ? 'text-blue-600 font-bold bg-blue-50'
            : 'text-slate-600 hover:text-slate-900 active:scale-95'
        }`}
      >
        <Palette className="w-4 h-4" />
        <span className="text-[10px] font-bold">السمة</span>
      </button>

      {/* 4. Edit Selected Component (Inspector) */}
      <button
        type="button"
        onClick={handleToggleInspector}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all relative cursor-pointer ${
          isMobileInspectorOpen
            ? 'text-blue-600 font-bold bg-blue-50'
            : selectedNode
            ? 'text-indigo-600 font-bold'
            : 'text-slate-600 hover:text-slate-900 active:scale-95'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-[10px] font-bold">
          {selectedNode ? 'تعديل العنصر' : 'الخصائص'}
        </span>
        {selectedNode && !isMobileInspectorOpen && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        )}
      </button>

      {/* 5. Live Preview */}
      <button
        type="button"
        onClick={() => setIsLivePreviewOpen(true)}
        className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
      >
        <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
        <span className="text-[10px] font-bold">معاينة</span>
      </button>

      {/* 6. Quick Save */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
        ) : autosaveStatus === 'saved' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <Save className="w-4 h-4 text-blue-600" />
        )}
        <span className="text-[10px] font-bold">
          {isSaving ? 'يحفظ...' : 'حفظ'}
        </span>
      </button>
    </nav>
  );
};
