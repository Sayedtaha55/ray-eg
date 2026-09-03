import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Play,
  Code2,
  Sparkles,
  CloudUpload,
  Globe,
  CheckCircle2,
  Loader2,
  Building2,
  ChevronDown,
  FileText,
  Terminal,
  ZoomIn,
  ZoomOut,
  Languages,
  Menu,
  X,
  Sliders,
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import { ViewportBreakpoint } from '../../types/builder';
import { ActivityTemplateSwitcher } from './ActivityTemplateSwitcher';

export const TopBar: React.FC = () => {
  const {
    currentTenant,
    website,
    activePage,
    switchPage,
    viewport,
    setViewport,
    zoom,
    setZoom,
    canUndo,
    canRedo,
    undo,
    redo,
    autosaveStatus,
    isCodeWorkspaceOpen,
    setIsCodeWorkspaceOpen,
    isLivePreviewOpen,
    setIsLivePreviewOpen,
    isPublishModalOpen,
    setIsPublishModalOpen,
    isAiModalOpen,
    setIsAiModalOpen,
    isDevDrawerOpen,
    setIsDevDrawerOpen,
    isRtl,
    setIsRtl,
  } = useBuilder();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-2 sm:px-4 flex items-center justify-between z-30 select-none shadow-xs">
      {/* LEFT SECTION: Brand & Page Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Brand Icon & Name */}
        <div className="flex items-center gap-2 pr-0.5 sm:pr-1">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs font-bold text-xs sm:text-sm tracking-tight shrink-0">
            VB
          </div>
          <div className="hidden min-[480px]:flex flex-col">
            <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Visual Builder</span>
            <span className="text-[9px] sm:text-[10px] text-blue-600 font-bold tracking-wider">Next.js Studio</span>
          </div>
        </div>

        <div className="hidden min-[640px]:block h-5 w-px bg-slate-200" />

        {/* Full Activity & Ready-made Template Switcher */}
        <ActivityTemplateSwitcher />

        <div className="hidden sm:block h-5 w-px bg-slate-200" />

        {/* Page Switcher */}
        <div className="relative">
          <button
            id="page_switcher_btn"
            onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
            className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="max-w-[80px] sm:max-w-[120px] truncate">{activePage.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {isPageDropdownOpen && (
            <div
              onClick={() => setIsPageDropdownOpen(false)}
              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">صفحات الموقع</div>
              {website.pages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => switchPage(p.id)}
                  className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                    p.id === activePage.id ? 'text-blue-600 font-bold bg-blue-50/70' : 'text-slate-700'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {p.metadata.isHomePage && (
                    <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded shrink-0 mr-1">
                      الرئيسية
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CENTER SECTION: Viewport Breakpoints & Zoom & History Controls */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            id="undo_btn"
            onClick={undo}
            disabled={!canUndo}
            title="تراجع (Ctrl+Z)"
            className="p-1 sm:p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <Undo2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
          <button
            id="redo_btn"
            onClick={redo}
            disabled={!canRedo}
            title="إعادة (Ctrl+Y)"
            className="p-1 sm:p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <Redo2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            id="viewport_desktop_btn"
            onClick={() => setViewport('desktop')}
            title="سطح المكتب (Desktop 1280px)"
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewport === 'desktop'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Desktop</span>
          </button>
          <button
            id="viewport_tablet_btn"
            onClick={() => setViewport('tablet')}
            title="جهاز لوحي (Tablet 768px)"
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewport === 'tablet'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Tablet</span>
          </button>
          <button
            id="viewport_mobile_btn"
            onClick={() => setViewport('mobile')}
            title="هاتف جوال (Mobile 390px)"
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewport === 'mobile'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Mobile</span>
          </button>
        </div>

        {/* Zoom Controls (Hidden on narrow screens) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-xs font-mono text-slate-600">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 15))}
            className="hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            disabled={zoom <= 50}
            title="تصغير"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(150, zoom + 15))}
            className="hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            disabled={zoom >= 150}
            title="تكبير"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* RIGHT SECTION: Actions & Publish & Mobile Menu */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Autosave Status Pill (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-medium text-slate-600">
          {autosaveStatus === 'saved' && (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>محفوظ</span>
            </>
          )}
          {autosaveStatus === 'saving' && (
            <>
              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          )}
          {autosaveStatus === 'unsaved' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>غير محفوظ</span>
            </>
          )}
        </div>

        {/* Scoped Code Workspace Toggle (Desktop/Tablet) */}
        <button
          id="toggle_code_workspace_btn"
          onClick={() => setIsCodeWorkspaceOpen(!isCodeWorkspaceOpen)}
          title="بيئة التطوير البرمجية (Code Workspace)"
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isCodeWorkspaceOpen
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Code IDE</span>
        </button>

        {/* AI Patch Studio */}
        <button
          id="toggle_ai_studio_btn"
          onClick={() => setIsAiModalOpen(true)}
          title="محرك التعديل الذكي المهيكل (AI Patch Engine)"
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden min-[500px]:inline">AI Patch</span>
        </button>

        {/* Developer Mode Drawer (Hidden on very small screens) */}
        <button
          id="toggle_dev_drawer_btn"
          onClick={() => setIsDevDrawerOpen(!isDevDrawerOpen)}
          title="وضع المطورين (Dev Mode AST)"
          className={`hidden sm:flex p-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
            isDevDrawerOpen
              ? 'bg-slate-800 text-cyan-400 border-slate-700'
              : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* RTL / LTR Toggle */}
        <button
          id="toggle_rtl_btn"
          onClick={() => setIsRtl(!isRtl)}
          title="تبديل اتجاه المعاينة (RTL / LTR)"
          className="hidden sm:flex p-1.5 rounded-lg text-xs bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
        >
          <Languages className="w-4 h-4" />
        </button>

        {/* Live Preview Button */}
        <button
          id="open_live_preview_btn"
          onClick={() => setIsLivePreviewOpen(true)}
          title="معاينة حية للموقع"
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          <span className="hidden sm:inline">معاينة حية</span>
        </button>

        {/* Publish Button */}
        <button
          id="open_publish_modal_btn"
          onClick={() => setIsPublishModalOpen(true)}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-sm transition-all cursor-pointer shrink-0"
        >
          <CloudUpload className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden min-[480px]:inline">نشر</span>
        </button>

        {/* Mobile Hamburger Menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
          title="المزيد من الأدوات"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Extra Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="sm:hidden absolute top-14 left-0 right-0 bg-white border-b border-slate-200 p-3 shadow-xl z-50 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-800">الأدوات السريعة</span>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{autosaveStatus === 'saved' ? 'محفوظ تلقائياً' : 'تعديلات معلقة'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setIsCodeWorkspaceOpen(!isCodeWorkspaceOpen);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <Code2 className="w-4 h-4 text-blue-600" />
              <span>محرر الكود</span>
            </button>

            <button
              onClick={() => {
                setIsDevDrawerOpen(!isDevDrawerOpen);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <Terminal className="w-4 h-4 text-cyan-600" />
              <span>وضع المطورين</span>
            </button>

            <button
              onClick={() => {
                setIsRtl(!isRtl);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <Languages className="w-4 h-4 text-purple-600" />
              <span>تبديل الاتجاه (RTL/LTR)</span>
            </button>

            <button
              onClick={() => {
                setZoom(100);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <ZoomIn className="w-4 h-4 text-slate-600" />
              <span>إعادة ضبط الحجم 100%</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

