import React, { useState, memo } from 'react';
import {
  Info,
  Search,
  Plus,
  Upload,
  BookOpen,
  Download,
  Printer,
  X,
  ChevronDown,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  FileText,
  ChevronRight,
  ChevronLeft,
  Target,
  Clock,
  Package,
  CheckCircle2,
  Zap,
  Link2,
  type LucideIcon,
} from 'lucide-react';

/* ============================================================
 * Sales Design System — Unified components for all sales pages
 * Both Orders and Quotes use these exact same components.
 * ============================================================ */

/* ---------- Page Shell ---------- */
export const SalesPageShell: React.FC<{
  children: React.ReactNode;
}> = memo(({ children }) => (
  <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm animate-[fadeIn_0.3s_ease-out]">
    {children}
  </div>
));

/* ---------- Page Header ---------- */
export const SalesPageHeader: React.FC<{
  icon: LucideIcon;
  title: string;
  subtitle: string;
  infoContent?: React.ReactNode;
  guide?: SalesGuideData;
  primaryAction?: { label: string; icon?: LucideIcon; onClick: () => void };
  secondaryActions?: { label: string; icon?: LucideIcon; onClick: () => void }[];
}> = memo(({ icon: Icon, title, subtitle, infoContent, guide, primaryAction, secondaryActions = [] }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const hasInfo = infoContent || guide;

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors shrink-0 order-2 sm:order-1"
            >
              {primaryAction.icon && <primaryAction.icon size={18} />}
              {primaryAction.label}
            </button>
          )}
          <div className="flex items-center gap-3 order-1 sm:order-2">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-900 text-white shrink-0">
              <Icon size={22} />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">{title}</h2>
              {hasInfo && (
                <button
                  onClick={() => setInfoOpen(true)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                  title="معلومات / Info"
                >
                  <Info size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-2 pr-1">{subtitle}</p>
        {secondaryActions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-3">
            {secondaryActions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                {a.icon && <a.icon size={14} />}
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {infoOpen && hasInfo && (
        <SalesInfoDrawer title={title} onClose={() => setInfoOpen(false)}>
          {guide ? <SalesGuideContent guide={guide} /> : infoContent}
        </SalesInfoDrawer>
      )}
    </>
  );
});

/* ---------- Info Drawer (slide-in panel) ---------- */
export const SalesInfoDrawer: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = memo(({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex" onClick={onClose}>
    <div className="absolute inset-0 bg-black/40 animate-[fadeIn_0.15s_ease-out]" />
    <div
      className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Info size={20} className="text-slate-400" />
          {title}
        </h3>
        <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
          <X size={20} />
        </button>
      </div>
      <div className="px-6 py-5 space-y-5 text-sm text-slate-600 leading-relaxed">{children}</div>
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-3">
        <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors">
          حسناً
        </button>
      </div>
    </div>
  </div>
));

/* ---------- Info Dialog (legacy compat — delegates to Drawer) ---------- */
export const SalesInfoDialog: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = memo(({ title, onClose, children }) => (
  <SalesInfoDrawer title={title} onClose={onClose}>
    {children}
  </SalesInfoDrawer>
));

export const InfoSection: React.FC<{ heading: string; children: React.ReactNode }> = memo(({ heading, children }) => (
  <div>
    <h4 className="font-bold text-slate-900 text-sm mb-1.5">{heading}</h4>
    <p className="text-slate-600 text-sm leading-relaxed">{children}</p>
  </div>
));

/* ============================================================
 * Unified Sales Guide System
 * Structured guide data rendered consistently across all pages
 * ============================================================ */

export type GuideStep = {
  title: string;
  description: string;
};

export type GuideLink = {
  label: string;
  onClick?: () => void;
};

export type SalesGuideData = {
  purpose: string;
  whenToUse: string;
  whatsInside: string[];
  steps: GuideStep[];
  bestPractices: string[];
  tips: string[];
  shortcuts: string[];
  relatedLinks?: GuideLink[];
  headingPurpose?: string;
  headingWhenToUse?: string;
  headingInside?: string;
  headingSteps?: string;
  headingBestPractices?: string;
  headingTips?: string;
  headingShortcuts?: string;
  headingLinks?: string;
};

const GuideSectionBlock: React.FC<{
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  heading: string;
  children: React.ReactNode;
}> = memo(({ icon: Icon, iconColor, iconBg, heading, children }) => (
  <div className="rounded-xl border border-slate-100 p-4 bg-white">
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${iconBg} ${iconColor} shrink-0`}>
        <Icon size={16} />
      </div>
      <h4 className="font-bold text-slate-900 text-sm">{heading}</h4>
    </div>
    {children}
  </div>
));

export const SalesGuideContent: React.FC<{ guide: SalesGuideData }> = memo(({ guide }) => (
  <div className="space-y-4">
    <GuideSectionBlock icon={Target} iconColor="text-blue-600" iconBg="bg-blue-50" heading={guide.headingPurpose || 'وظيفة الصفحة / Page Purpose'}>
      <p className="text-slate-600 text-sm leading-relaxed">{guide.purpose}</p>
    </GuideSectionBlock>

    <GuideSectionBlock icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" heading={guide.headingWhenToUse || 'متى تستخدمها / When to Use'}>
      <p className="text-slate-600 text-sm leading-relaxed">{guide.whenToUse}</p>
    </GuideSectionBlock>

    <GuideSectionBlock icon={Package} iconColor="text-purple-600" iconBg="bg-purple-50" heading={guide.headingInside || 'ماذا ستجد داخلها / What\'s Inside'}>
      <ul className="space-y-1.5">
        {guide.whatsInside.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
            <ChevronRight size={14} className="text-slate-300 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </GuideSectionBlock>

    <GuideSectionBlock icon={CheckCircle2} iconColor="text-green-600" iconBg="bg-green-50" heading={guide.headingSteps || 'كيفية العمل / Step by Step'}>
      <ol className="space-y-3">
        {guide.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 text-sm">{step.title}</div>
              <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">{step.description}</div>
            </div>
          </li>
        ))}
      </ol>
    </GuideSectionBlock>

    <GuideSectionBlock icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50" heading={guide.headingBestPractices || 'أفضل الممارسات / Best Practices'}>
      <ul className="space-y-1.5">
        {guide.bestPractices.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
            <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </GuideSectionBlock>

    <GuideSectionBlock icon={Lightbulb} iconColor="text-yellow-600" iconBg="bg-yellow-50" heading={guide.headingTips || 'نصائح / Tips'}>
      <ul className="space-y-1.5">
        {guide.tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
            <Lightbulb size={14} className="text-yellow-500 mt-0.5 shrink-0" />
            {tip}
          </li>
        ))}
      </ul>
    </GuideSectionBlock>

    <GuideSectionBlock icon={Zap} iconColor="text-orange-600" iconBg="bg-orange-50" heading={guide.headingShortcuts || 'اختصارات / Shortcuts'}>
      <ul className="space-y-1.5">
        {guide.shortcuts.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
            <Zap size={14} className="text-orange-500 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </GuideSectionBlock>

    {guide.relatedLinks && guide.relatedLinks.length > 0 && (
      <GuideSectionBlock icon={Link2} iconColor="text-sky-600" iconBg="bg-sky-50" heading={guide.headingLinks || 'روابط مرتبطة / Related Pages'}>
        <div className="flex flex-wrap gap-2">
          {guide.relatedLinks.map((link, i) => (
            <button
              key={i}
              onClick={link.onClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-sky-600 hover:bg-sky-50 transition-all"
            >
              <Link2 size={12} />
              {link.label}
            </button>
          ))}
        </div>
      </GuideSectionBlock>
    )}
  </div>
));

/* ---------- Stats Grid ---------- */
export type StatCard = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral'; label?: string };
};

export const SalesStatsGrid: React.FC<{ stats: StatCard[] }> = memo(({ stats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
    {stats.map((s, i) => (
      <div
        key={i}
        className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm h-24 hover:shadow-md transition-shadow animate-[fadeIn_0.3s_ease-out]"
        style={{ animationDelay: `${i * 30}ms` }}
      >
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${s.bgColor} ${s.color} shrink-0`}>
          <s.icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-400 truncate">{s.label}</p>
          <p className="text-base font-bold text-slate-900 truncate">{s.value}</p>
          {s.trend && (
            <div className="flex items-center gap-1 mt-0.5">
              {s.trend.direction === 'up' && <ArrowUpRight size={12} className="text-green-500 shrink-0" />}
              {s.trend.direction === 'down' && <ArrowDownRight size={12} className="text-red-500 shrink-0" />}
              {s.trend.direction === 'neutral' && <TrendingUp size={12} className="text-slate-400 shrink-0" />}
              <span className={`text-[10px] font-semibold ${s.trend.direction === 'up' ? 'text-green-500' : s.trend.direction === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                {s.trend.value}
              </span>
              {s.trend.label && (
                <span className="text-[9px] text-slate-400 font-medium truncate">{s.trend.label}</span>
              )}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
));

/* ---------- Status Filters ---------- */
export type StatusFilter = {
  key: string;
  label: string;
  count?: number;
  color: string;
  activeColor: string;
};

export const SalesStatusFilters: React.FC<{
  filters: StatusFilter[];
  active: string;
  onChange: (key: string) => void;
}> = memo(({ filters, active, onChange }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible no-scrollbar snap-x snap-mandatory mb-4">
    {filters.map((f) => {
      const isActive = active === f.key;
      return (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`snap-start flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full font-semibold text-xs whitespace-nowrap transition-all ${
            isActive ? f.activeColor : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {f.label}
          {f.count !== undefined && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20' : 'bg-slate-200/60'}`}>
              {f.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
));

/* ---------- Toolbar (Search + Actions) ---------- */
export type ToolbarAction = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

export const SalesToolbar: React.FC<{
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder: string;
  actions?: ToolbarAction[];
  advancedFilters?: React.ReactNode;
}> = memo(({ search, onSearchChange, searchPlaceholder, actions = [], advancedFilters }) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="mb-4 space-y-3">
      {/* Search — always full width on top */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
        />
      </div>
      {/* Actions row — always below search, consistent order */}
      <div className="flex items-center gap-2 flex-wrap">
        {advancedFilters && (
          <button
            onClick={() => setFiltersOpen((p) => !p)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <ChevronDown size={16} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        )}
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <a.icon size={16} />
            <span className="hidden sm:inline">{a.label}</span>
          </button>
        ))}
      </div>
      {advancedFilters && filtersOpen && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 animate-[fadeIn_0.2s_ease-out]">
          {advancedFilters}
        </div>
      )}
    </div>
  );
});

/* ---------- Table ---------- */
export type TableColumn = {
  key: string;
  label: string;
  className?: string;
  align?: 'right' | 'left' | 'center';
};

export const SalesTable: React.FC<{
  columns: TableColumn[];
  children: React.ReactNode;
}> = memo(({ columns, children }) => (
  <div className="hidden md:block overflow-x-auto touch-auto no-scrollbar">
    <table className="w-full text-right border-collapse min-w-[900px]">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
          {columns.map((col) => (
            <th
              key={col.key}
              className={`p-4 text-xs font-semibold text-slate-500 ${col.align === 'left' ? 'text-left' : col.align === 'center' ? 'text-center' : 'text-right'} ${col.className || ''}`}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
));

export const SalesMobileCards: React.FC<{ children: React.ReactNode }> = memo(({ children }) => (
  <div className="md:hidden space-y-3">{children}</div>
));

/* ---------- Status Badge ---------- */
export const SalesStatusBadge: React.FC<{
  label: string;
  color: string;
  bg: string;
}> = memo(({ label, color, bg }) => (
  <span className={`px-3 py-1.5 rounded-full text-[10px] font-semibold ${bg} ${color} whitespace-nowrap`}>
    {label}
  </span>
));

/* ---------- Empty State ---------- */
export const SalesEmptyState: React.FC<{
  icon: LucideIcon;
  emoji?: string;
  title: string;
  description: string;
  primaryAction?: { label: string; icon?: LucideIcon; onClick: () => void };
  secondaryActions?: { label: string; icon?: LucideIcon; onClick: () => void }[];
}> = memo(({ icon: Icon, emoji, title, description, primaryAction, secondaryActions = [] }) => (
  <div className="py-16 text-center animate-[fadeIn_0.3s_ease-out]">
    {emoji ? (
      <div className="text-5xl mb-4">{emoji}</div>
    ) : (
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 mb-5">
        <Icon size={40} className="text-slate-300" />
      </div>
    )}
    <h3 className="text-lg font-bold text-slate-700 mb-2">{title}</h3>
    <p className="text-sm text-slate-400 max-w-md mx-auto mb-2 leading-relaxed">{description}</p>

    {(primaryAction || secondaryActions.length > 0) && (
      <>
        <div className="flex items-center justify-center gap-2 my-4">
          <div className="h-px bg-slate-200 flex-1 max-w-[60px]" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Quick Start</span>
          <div className="h-px bg-slate-200 flex-1 max-w-[60px]" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              {primaryAction.icon && <primaryAction.icon size={18} />}
              {primaryAction.label}
            </button>
          )}
          {secondaryActions.map((a, i) => (
            <span key={i} className="flex items-center gap-3">
              {i > 0 && <span className="text-xs text-slate-300 font-medium">أو</span>}
              <button
                onClick={a.onClick}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                {a.icon && <a.icon size={16} />}
                {a.label}
              </button>
            </span>
          ))}
        </div>
      </>
    )}
  </div>
));

/* ---------- Loading State ---------- */
export const SalesLoading: React.FC = memo(() => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
  </div>
));

/* ---------- Advanced Filter Field ---------- */
export const FilterField: React.FC<{
  label: string;
  children: React.ReactNode;
}> = memo(({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
    {children}
  </div>
));

export const FilterInput: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
}> = memo(({ placeholder, value, onChange, type = 'text' }) => (
  <input
    type={type}
    value={value || ''}
    onChange={(e) => onChange?.(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white"
  />
));

/* ---------- Helpful Section ---------- */
export const SalesHelpfulSection: React.FC<{
  tips?: string[];
  documentation?: { label: string; onClick: () => void }[];
  nextSteps?: { label: string; description: string; onClick: () => void }[];
}> = memo(({ tips = [], documentation = [], nextSteps = [] }) => {
  if (tips.length === 0 && documentation.length === 0 && nextSteps.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
      {tips.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-amber-50/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} className="text-amber-500" />
            <h4 className="text-sm font-bold text-slate-700">نصائح / Tips</h4>
          </div>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium leading-relaxed">
                <span className="text-amber-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
      {documentation.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-blue-50/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-blue-500" />
            <h4 className="text-sm font-bold text-slate-700">الدليل / Documentation</h4>
          </div>
          <div className="space-y-2">
            {documentation.map((doc, i) => (
              <button
                key={i}
                onClick={doc.onClick}
                className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ChevronRight size={14} />
                {doc.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {nextSteps.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-green-50/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-green-500" />
            <h4 className="text-sm font-bold text-slate-700">الخطوات التالية / Next Steps</h4>
          </div>
          <div className="space-y-3">
            {nextSteps.map((step, i) => (
              <button
                key={i}
                onClick={step.onClick}
                className="block w-full text-right"
              >
                <div className="text-xs font-bold text-slate-700">{step.label}</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">{step.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

/* ---------- Re-exports for convenience ---------- */
export { Plus, Upload, BookOpen, Download, Printer, TrendingUp, Lightbulb, FileText, Target, Clock, Package, CheckCircle2, Zap, Link2 };
