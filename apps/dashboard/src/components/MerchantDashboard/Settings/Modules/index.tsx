import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  RefreshCw,
  FileText,
  ShoppingCart,
  Camera,
  Users,
  Megaphone,
  BarChart3,
  Palette,
  Settings,
  LayoutGrid,
  Store,
  Coins,
  UserCog,
  Clock,
  Wallet,
  Package,
  Tag,
  Monitor,
  Receipt,
  CreditCard,
  Download,
  Trash2,
  Loader2,
  Sparkles,
  ChevronDown,
  Calendar,
  ArrowLeftRight,
  Star,
  ListChecks,
  Clipboard,
  Truck,
  Scan,
  QrCode,
  Bell,
  TrendingUp,
  Briefcase,
  MessageSquare,
  Ticket,
  Headphones,
  ThumbsUp,
  StickyNote,
  Phone,
  Percent,
  Mail,
  Smartphone,
  Gift,
  CalendarCheck,
  Building,
  Stethoscope,
  CalendarX,
  AlarmClock,
  Utensils,
  ShieldCheck,
  CalendarOff,
  CheckSquare,
  PieChart,
  LineChart,
  Eye,
  MousePointer,
  Pen,
  Search,
  Lightbulb,
  Brain,
} from 'lucide-react';

const moduleIcons: Record<string, any> = {
  overview: LayoutGrid,
  apps: LayoutGrid,
  products: Package,
  promotions: Tag,
  builder: Monitor,
  settings: Settings,
  gallery: Camera,
  reservations: Clock,
  invoice: Receipt,
  pos: ShoppingCart,
  sales: CreditCard,
  customers: Users,
  reports: BarChart3,
  marketing: Megaphone,
  expenses: Coins,
  employees: UserCog,
  attendance: Clock,
  payroll: Wallet,
  orders: CreditCard,
  quotes: FileText,
  payments: Wallet,
  returns: ArrowLeftRight,
  loyalty: Star,
  subscriptions: CreditCard,
  epayment: CreditCard,
  orderStatus: ListChecks,
  abandonedCart: ShoppingCart,
  categories: Tag,
  variants: ListChecks,
  warehouses: Package,
  stocktake: Clipboard,
  suppliers: Truck,
  purchaseOrders: FileText,
  transfers: ArrowLeftRight,
  barcode: Scan,
  qrCode: QrCode,
  stockTracking: Package,
  lowStockAlerts: Bell,
  revenue: TrendingUp,
  profits: Coins,
  taxes: Receipt,
  journal: FileText,
  cashflow: TrendingUp,
  accounts: Briefcase,
  wallets: Wallet,
  financialReports: BarChart3,
  chats: MessageSquare,
  tickets: Ticket,
  complaints: Headphones,
  reviews: ThumbsUp,
  notes: StickyNote,
  followUps: Phone,
  contactLog: ListChecks,
  campaigns: Megaphone,
  coupons: Ticket,
  discounts: Percent,
  messages: MessageSquare,
  emailCampaigns: Mail,
  pushNotifications: Smartphone,
  smsCampaigns: Smartphone,
  loyaltyPrograms: Gift,
  seasonalOffers: Star,
  providers: Users,
  services: ListChecks,
  appointments: CalendarCheck,
  calendar: Calendar,
  rooms: Building,
  doctors: Stethoscope,
  bookingConfirm: CalendarCheck,
  bookingCancel: CalendarX,
  bookingReminder: AlarmClock,
  patient_records: FileText,
  activity_inventory: Package,
  restaurant_tables: Utensils,
  permissions: ShieldCheck,
  checkOut: Clock,
  leaves: CalendarOff,
  tasks: CheckSquare,
  kpi: TrendingUp,
  charts: PieChart,
  salesPerformance: LineChart,
  productPerformance: BarChart3,
  visitors: Eye,
  conversions: MousePointer,
  ai_theme: Palette,
  ai_pages: FileText,
  ai_brand: Sparkles,
  ai_chat: MessageSquare,
  aiContent: Pen,
  aiImages: Sparkles,
  aiSEO: Search,
  aiAnalysis: BarChart3,
  aiReplies: MessageSquare,
  aiSuggestions: Lightbulb,
  aiPages: Sparkles,
  aiDataAnalysis: Brain,
};
type ModuleGroup = {
  id: string;
  label: string;
  labelAr: string;
  icon: any;
  color: string;
  registryModuleIds: string[];
};

const MODULE_GROUPS: ModuleGroup[] = [
  {
    id: 'sales',
    label: 'Sales & Orders',
    labelAr: 'المبيعات والطلبات',
    icon: CreditCard,
    color: '#2563EB',
    registryModuleIds: ['sales'],
  },
  {
    id: 'inventory',
    label: 'Inventory & Products',
    labelAr: 'المخزون والمنتجات',
    icon: Package,
    color: '#16A34A',
    registryModuleIds: ['inventory'],
  },
  {
    id: 'finance',
    label: 'Finance & Invoicing',
    labelAr: 'المالية والفواتير',
    icon: Receipt,
    color: '#7C3AED',
    registryModuleIds: ['finance'],
  },
  {
    id: 'crm',
    label: 'Customer Relations',
    labelAr: 'علاقات العملاء',
    icon: Users,
    color: '#DC2626',
    registryModuleIds: ['crm'],
  },
  {
    id: 'marketing',
    label: 'Marketing & Promotions',
    labelAr: 'التسويق والعروض',
    icon: Megaphone,
    color: '#EA580C',
    registryModuleIds: ['marketing'],
  },
  {
    id: 'bookings',
    label: 'Bookings & Reservations',
    labelAr: 'الحجوزات والمواعيد',
    icon: Calendar,
    color: '#0891B2',
    registryModuleIds: ['bookings'],
  },
  {
    id: 'hr',
    label: 'Human Resources',
    labelAr: 'الموارد البشرية',
    icon: UserCog,
    color: '#9333EA',
    registryModuleIds: ['hr'],
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    labelAr: 'التحليلات والتقارير',
    icon: BarChart3,
    color: '#059669',
    registryModuleIds: ['analytics'],
  },
  {
    id: 'ai',
    label: 'AI Assistant',
    labelAr: 'مساعد الذكاء الاصطناعي',
    icon: Sparkles,
    color: '#BD00FF',
    registryModuleIds: ['ai'],
  },
];

import { MODULE_REGISTRY } from '../../../../config/modules/registry';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api.service';
import { useTranslation } from 'react-i18next';
import { BUSINESS_ACTIVITY_GROUPS, getBusinessActivityById, getBusinessActivityThemePatch, getDefaultActivityForCategory } from '@/utils/businessActivityCatalog';
import { BOOKING_ACTIVITIES, getBookingActivityById, getDefaultActivity, ACTIVITY_MODULES, isShopBookingActivity } from '@/components/pages/business/bookings/config';
import * as ReactRouterDOM from 'react-router-dom';

const { useLocation } = ReactRouterDOM as any;

type ModuleId = string;

type ModuleDef = {
  id: ModuleId;
  label: string;
  kind: 'core' | 'optional';
};

const CORE_IDS: ModuleId[] = ['overview', 'products', 'promotions', 'builder', 'settings'];

type SaveHandler = () => Promise<boolean>;

type SectionChangesHandlerDetail = { sectionId: string; count: number };

type Props = {
  shop: any;
  onSaved: () => void;
  adminShopId?: string;
  defaultExpandedSection?: string;
};

const getInitialActivityId = (shop: any) => {
  const isBooking = isShopBookingActivity(shop);
  if (isBooking) {
    return shop?.pageDesign?.bookingActivityType || 'clinic';
  }
  const act = getBusinessActivityById(shop?.pageDesign?.businessActivityId) || getDefaultActivityForCategory(shop?.category);
  return act?.id || '';
};

const ModulesSettings: React.FC<Props> = ({ shop, onSaved, adminShopId, defaultExpandedSection }) => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const location = useLocation ? useLocation() : { search: '', hash: '' };

  const resolvedActivityId = useMemo(() => {
    const params = new URLSearchParams(location.search || (location.hash.includes('?') ? location.hash.split('?')[1] : ''));
    const urlActivity = params.get('activity');
    if (urlActivity) return urlActivity;

    if (isShopBookingActivity(shop)) {
      return shop?.pageDesign?.bookingActivityType || 'clinic';
    }
    return shop?.pageDesign?.businessActivityId || '';
  }, [shop, location.search, location.hash]);

  const MODULES: ModuleDef[] = useMemo(() => [
    { id: 'overview', label: t('modulesSettings.moduleOverview'), kind: 'core' },
    { id: 'products', label: t('modulesSettings.moduleProducts'), kind: 'core' },
    { id: 'promotions', label: t('modulesSettings.modulePromotions'), kind: 'core' },
    { id: 'builder', label: t('modulesSettings.moduleBuilder'), kind: 'core' },
    { id: 'settings', label: t('modulesSettings.moduleSettings'), kind: 'core' },
    { id: 'inventory', label: t('modulesSettings.moduleInventory'), kind: 'optional' },
    { id: 'sales', label: t('modulesSettings.moduleSales'), kind: 'optional' },
    { id: 'pos', label: t('modulesSettings.modulePos'), kind: 'optional' },
    { id: 'finance', label: t('modulesSettings.moduleFinance'), kind: 'optional' },
    { id: 'crm', label: t('modulesSettings.moduleCRM'), kind: 'optional' },
    { id: 'marketing', label: t('modulesSettings.moduleMarketing'), kind: 'optional' },
    { id: 'bookings', label: t('modulesSettings.moduleBookings'), kind: 'optional' },
    { id: 'hr', label: t('modulesSettings.moduleHR'), kind: 'optional' },
    { id: 'website', label: t('modulesSettings.moduleWebsite'), kind: 'optional' },
    { id: 'analytics', label: t('modulesSettings.moduleAnalytics'), kind: 'optional' },
    { id: 'ai', label: t('modulesSettings.moduleAI'), kind: 'optional' },
    { id: 'gallery', label: t('modulesSettings.moduleGallery'), kind: 'optional' },
    { id: 'reservations', label: t('modulesSettings.moduleReservations'), kind: 'optional' },
    { id: 'invoice', label: t('modulesSettings.moduleInvoice'), kind: 'optional' },
    { id: 'customers', label: t('modulesSettings.moduleCustomers'), kind: 'optional' },
    { id: 'reports', label: t('modulesSettings.moduleReports'), kind: 'optional' },
    { id: 'abandonedCart', label: t('modulesSettings.moduleAbandonedCart'), kind: 'optional' },
  ], [t]);

  const baselineRef = useRef<string[]>([]);
  const activityBaselineRef = useRef<string[]>([]);

  const activeEnabled = useMemo(() => {
    const raw = (shop as any)?.layoutConfig?.enabledModules;
    if (!Array.isArray(raw)) {
      const coreOnly = Array.from(new Set(CORE_IDS));
      coreOnly.sort();
      return coreOnly;
    }
    const list = raw.map((x: any) => String(x || '').trim()).filter(Boolean) as ModuleId[];
    const merged = Array.from(new Set([...list, ...CORE_IDS]));
    merged.sort();
    return merged;
  }, [shop]);

  const initialEnabled = useMemo(() => {
    return activeEnabled;
  }, [activeEnabled]);

  const [selectedActivityId, setSelectedActivityId] = useState<string>(() => getInitialActivityId(shop));
  const selectedActivityBaselineRef = useRef<string>(getInitialActivityId(shop));
  const [enabledActivityButtons, setEnabledActivityButtons] = useState<Set<string>>(() => new Set(Array.isArray((shop as any)?.pageDesign?.activityEnabledButtons) ? (shop as any).pageDesign.activityEnabledButtons.map((x: any) => String(x || '').trim()).filter(Boolean) : []));
  const [pendingRequestedButtons, setPendingRequestedButtons] = useState<Set<string>>(() => new Set());
  const [enabled, setEnabled] = useState<Set<ModuleId>>(() => new Set(initialEnabled as any));
  const [saving, setSaving] = useState(false);
  const [pendingFromAdmin, setPendingFromAdmin] = useState<Set<string>>(new Set());
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [moduleFeatures, setModuleFeatures] = useState<Record<string, Set<string>>>({});
  const [expandedFeatureModules, setExpandedFeatureModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (defaultExpandedSection) {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        MODULE_GROUPS.forEach((g) => {
          if (g.registryModuleIds?.includes(defaultExpandedSection) || g.id === defaultExpandedSection) {
            next.add(g.id);
          }
        });
        return next;
      });
    }
  }, [defaultExpandedSection]);

  const registryModuleMap = useMemo(() => {
    const map: Record<string, typeof MODULE_REGISTRY[0]> = {};
    for (const mod of MODULE_REGISTRY) {
      map[mod.id] = mod;
    }
    return map;
  }, []);

  const savedFeatures = (shop as any)?.layoutConfig?.enabledFeatures as Record<string, string[]> | undefined;

  useEffect(() => {
    const initial: Record<string, Set<string>> = {};
    for (const mod of MODULE_REGISTRY) {
      const saved = savedFeatures?.[mod.id];
      if (Array.isArray(saved)) {
        initial[mod.id] = new Set(saved);
      } else {
        initial[mod.id] = new Set(
          (mod as any).features
            .filter((f: any) => f.defaultEnabled)
            .map((f: any) => f.id)
        );
      }
    }
    setModuleFeatures(initial);
  }, [savedFeatures]);

  const persistFeatures = useCallback(async (nextFeatures: Record<string, Set<string>>) => {
    try {
      const featuresObj: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(nextFeatures)) {
        featuresObj[k] = Array.from(v);
      }
      const previousLayout = ((shop as any)?.layoutConfig && typeof (shop as any).layoutConfig === 'object') ? (shop as any).layoutConfig : {};
      await ApiService.updateMyShop({
        layoutConfig: {
          ...previousLayout,
          enabledFeatures: featuresObj,
        },
      });
      // Update local shop reference to avoid re-initialization from stale data
      if (shop && typeof shop === 'object') {
        (shop as any).layoutConfig = {
          ...previousLayout,
          enabledFeatures: featuresObj,
        };
      }
    } catch (e: any) {
      toast({
        title: t('modulesSettings.error'),
        description: e?.message || t('modulesSettings.saveModulesFailedShort'),
        variant: 'destructive',
      });
    }
  }, [shop, toast, t]);

  const toggleFeature = (moduleId: string, featureId: string) => {
    const current = moduleFeatures[moduleId] || new Set<string>();
    const isCurrentlyEnabled = current.has(featureId);

    if (isCurrentlyEnabled) {
      // Uninstalling — instant removal
      setModuleFeatures((prev) => {
        const next = new Set(prev[moduleId] || new Set<string>());
        next.delete(featureId);
        const nextState = { ...prev, [moduleId]: next };
        persistFeatures(nextState);
        return nextState;
      });
    } else {
      // Installing — add feature locally and persist, then send module upgrade request
      setModuleFeatures((prev) => {
        const next = new Set(prev[moduleId] || new Set<string>());
        next.add(featureId);
        const nextState = { ...prev, [moduleId]: next };
        persistFeatures(nextState);
        return nextState;
      });
      // Send upgrade request for the module (so admin can approve the module if not yet active)
      (async () => {
        try {
          await (ApiService as any).createMyModuleUpgradeRequest?.({
            requestedModules: [moduleId],
          });
          toast({
            title: t('modulesSettings.requestSent'),
            description: isArabic ? 'تم تثبيت الميزة وإرسال طلب الترقية للمراجعة' : 'Feature installed and upgrade request sent for review',
          });
          await fetchMyRequests();
        } catch (e: any) {
          // Feature is already saved locally, just log the upgrade request error
          if (e?.status !== 400) {
            toast({
              title: t('modulesSettings.error'),
              description: e?.message || t('modulesSettings.saveModulesFailedShort'),
              variant: 'destructive',
            });
          }
        }
      })();
    }
  };

  const toggleFeatureModule = (moduleId: string) => {
    setExpandedFeatureModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const fetchMyRequests = useCallback(async () => {
    if (adminShopId) return;
    setLoadingRequests(true);
    try {
      const requests = await ApiService.listMyModuleUpgradeRequests();
      const pendingSet = new Set<string>();
      if (Array.isArray(requests)) {
        for (const req of requests) {
          if (req.status === 'PENDING') {
            let modules: string[] = [];
            if (Array.isArray(req.requestedModules)) {
              modules = req.requestedModules;
            } else if (typeof req.requestedModules === 'string') {
              try {
                modules = JSON.parse(req.requestedModules);
              } catch {}
            }
            if (Array.isArray(modules)) {
              modules.forEach((m) => pendingSet.add(String(m).trim()));
            }
          }
        }
      }
      setPendingFromAdmin(pendingSet);
    } catch (err) {
      console.error('Failed to load upgrade requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, [adminShopId]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  useEffect(() => {
    const s = new Set<ModuleId>(initialEnabled as any);
    setEnabled(s);
    baselineRef.current = Array.from(s).map(String).sort();
    fetchMyRequests();
  }, [initialEnabled, fetchMyRequests]);

  useEffect(() => {
    const isBooking = isShopBookingActivity(shop);
    let activityId = '';
    if (isBooking) {
      activityId = (shop as any)?.pageDesign?.bookingActivityType || 'clinic';
    } else {
      const nextActivity = getBusinessActivityById((shop as any)?.pageDesign?.businessActivityId) || getDefaultActivityForCategory((shop as any)?.category);
      activityId = nextActivity?.id || '';
    }
    setSelectedActivityId(activityId);
    selectedActivityBaselineRef.current = activityId;
    const rawButtons = (shop as any)?.pageDesign?.activityEnabledButtons;
    const nextButtons = Array.isArray(rawButtons) ? rawButtons.map((x: any) => String(x || '').trim()).filter(Boolean) : [];
    setEnabledActivityButtons(new Set(nextButtons));
    activityBaselineRef.current = nextButtons.sort();
  }, [shop]);

  useEffect(() => {
    if (resolvedActivityId) {
      setSelectedActivityId(resolvedActivityId);
    }
  }, [resolvedActivityId]);

  const toSortedArray = (s: Set<ModuleId>) => Array.from(s).map(String).sort();

  const emitChanges = (count: number) => {
    try {
      window.dispatchEvent(
        new CustomEvent('merchant-settings-section-changes', {
          detail: { sectionId: 'modules', count } satisfies SectionChangesHandlerDetail,
        }),
      );
    } catch {
    }
  };

  useEffect(() => {
    const current = toSortedArray(enabled);
    const baseline = baselineRef.current || [];
    const hasPendingButtons = pendingRequestedButtons.size > 0;
    const activityCurrent = Array.from(enabledActivityButtons).map(String).sort();
    const activityBaseline = activityBaselineRef.current || [];
    const activityChanged = selectedActivityId !== selectedActivityBaselineRef.current;
    
    const changed = 
      JSON.stringify(current) !== JSON.stringify(baseline) || 
      (adminShopId && JSON.stringify(activityCurrent) !== JSON.stringify(activityBaseline)) || 
      (adminShopId && activityChanged) ||
      (!adminShopId && hasPendingButtons);

    emitChanges(changed ? 1 : 0);
  }, [enabled, enabledActivityButtons, selectedActivityId, pendingRequestedButtons, adminShopId]);

  const canEnableCustomersOrReports = (next: Set<ModuleId>) => next.has('sales');

  const buildRemovalWarning = (id: ModuleId) => {
    const label = MODULES.find((m) => m.id === id)?.label || id;

    const details = (() => {
      switch (id) {
        case 'invoice':
          return t('modulesSettings.removeInvoiceDetail');
        case 'reservations':
          return t('modulesSettings.removeReservationsDetail');
        case 'gallery':
          return t('modulesSettings.removeGalleryDetail');
        case 'customers':
          return t('modulesSettings.removeCustomersDetail');
        case 'reports':
          return t('modulesSettings.removeReportsDetail');
        case 'pos':
          return t('modulesSettings.removePosDetail');
        case 'sales':
          return t('modulesSettings.removeSalesDetail');
        default:
          return t('modulesSettings.removeDefaultDetail');
      }
    })();

    return t('modulesSettings.removeConfirm', { label, details });
  };

  const removeActiveModule = useCallback(
    async (id: ModuleId) => {
      if (CORE_IDS.includes(id)) return;
      if (!activeEnabled.includes(id)) return;

      const ok = typeof window !== 'undefined' ? window.confirm(buildRemovalWarning(id)) : false;
      if (!ok) return;

      setSaving(true);
      try {
        const next = new Set<ModuleId>(activeEnabled as any);
        next.delete(id);
        if (id === 'sales') {
          next.delete('customers');
          next.delete('reports');
        }

        const list = toSortedArray(next as any);
        await ApiService.updateMyShop(adminShopId ? { shopId: adminShopId, enabledModules: list } : { enabledModules: list });
        baselineRef.current = list;
        emitChanges(0);
        setEnabled(new Set(list as any));
        toast({ title: t('modulesSettings.deleted'), description: t('modulesSettings.moduleDeletedDesc') });
        onSaved();
      } catch (e: any) {
        const msg = e?.message ? String(e.message) : '';
        toast({
          title: t('modulesSettings.error'),
          description: msg ? t('modulesSettings.removeModuleFailed', { msg }) : t('modulesSettings.removeModuleFailedShort'),
          variant: 'destructive',
        });
      } finally {
        setSaving(false);
      }
    },
    [activeEnabled, adminShopId, onSaved, toast],
  );

  const selectedActivity = useMemo(() => {
    const isBooking = isShopBookingActivity(shop);
    if (isBooking) {
      const bookingAct = getBookingActivityById(selectedActivityId) || getDefaultActivity();
      const extraMods = ACTIVITY_MODULES[bookingAct.id] || [];
      const privateButtons = extraMods
        .filter((mod) => mod.isExtra)
        .map((mod) => ({ id: mod.id, label: mod.label }));
      return {
        id: bookingAct.id,
        title: bookingAct.title,
        description: bookingAct.description,
        privateButtons,
      };
    } else {
      const act = getBusinessActivityById(selectedActivityId) || getDefaultActivityForCategory(shop?.category);
      return {
        id: act.id,
        title: act.title,
        description: act.description,
        privateButtons: act.privateButtons || [],
      };
    }
  }, [shop, selectedActivityId]);

  const toggleActivityButton = (id: string) => {
    setEnabledActivityButtons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleRequestedButton = (buttonId: string) => {
    setPendingRequestedButtons((prev) => {
      const next = new Set(prev);
      if (next.has(buttonId)) {
        next.delete(buttonId);
      } else {
        next.add(buttonId);
      }
      return next;
    });
  };

  const removeActiveActivityButton = useCallback(
    async (buttonId: string) => {
      const activeButtons = Array.from(enabledActivityButtons);
      if (!activeButtons.includes(buttonId)) return;

      const ok = typeof window !== 'undefined' ? window.confirm('هل أنت متأكد من رغبتك في حذف هذا الزر الخاص؟') : false;
      if (!ok) return;

      setSaving(true);
      try {
        const next = new Set<string>(activeButtons);
        next.delete(buttonId);

        const list = Array.from(next).sort();
        const previousPageDesign = ((shop as any)?.pageDesign && typeof (shop as any).pageDesign === 'object') ? (shop as any).pageDesign : {};
        const nextPageDesign = {
          ...previousPageDesign,
          activityEnabledButtons: list,
        };

        await ApiService.updateMyShop(adminShopId ? { shopId: adminShopId, pageDesign: nextPageDesign } : { pageDesign: nextPageDesign });
        activityBaselineRef.current = list;
        setEnabledActivityButtons(next);
        emitChanges(0);
        toast({ title: t('modulesSettings.deleted'), description: 'تم حذف الزر الخاص بنجاح.' });
        onSaved();
      } catch (e: any) {
        const msg = e?.message ? String(e.message) : '';
        toast({
          title: t('modulesSettings.error'),
          description: msg ? `فشل في حذف الزر الخاص: ${msg}` : 'فشل في حذف الزر الخاص.',
          variant: 'destructive',
        });
      } finally {
        setSaving(false);
      }
    },
    [enabledActivityButtons, adminShopId, shop, onSaved, toast, t],
  );

  const toggleOptional = (id: ModuleId) => {
    if (CORE_IDS.includes(id)) return;

    setEnabled((prev) => {
      const next = new Set(prev);

      if (activeEnabled.includes(id)) {
        return prev;
      }

      if (next.has(id)) {
        next.delete(id);
        if (id === 'sales') {
          next.delete('customers');
          next.delete('reports');
        }
        return next;
      }

      if ((id === 'customers' || id === 'reports') && !canEnableCustomersOrReports(next)) {
        try {
          toast({
            title: t('modulesSettings.notAllowed'),
            description: t('modulesSettings.customersRequiresSales'),
            variant: 'destructive',
          });
        } catch {
        }
        return prev;
      }

      next.add(id);
      return next;
    });
  };

  const saveModules: SaveHandler = useCallback(async () => {
    setSaving(true);
    try {
      const list = toSortedArray(enabled);
      const activityButtonList = Array.from(enabledActivityButtons).map(String).sort();
      const previousPageDesign = ((shop as any)?.pageDesign && typeof (shop as any).pageDesign === 'object') ? (shop as any).pageDesign : {};
      
      const isBooking = isShopBookingActivity(shop);
      const nextPageDesign = {
        ...previousPageDesign,
        activityEnabledButtons: activityButtonList,
        activityPrivateButtonLabels: Object.fromEntries((selectedActivity.privateButtons || []).map((button) => [button.id, button.label])),
        ...(isBooking 
          ? { bookingActivityType: selectedActivity.id } 
          : { businessActivityId: selectedActivity.id }
        )
      };

      if (adminShopId) {
        await ApiService.updateMyShop({
          shopId: adminShopId,
          enabledModules: list,
          pageDesign: nextPageDesign,
        });

        baselineRef.current = list;
        activityBaselineRef.current = activityButtonList;
        selectedActivityBaselineRef.current = selectedActivity.id;
        emitChanges(0);
        toast({ title: t('modulesSettings.saved'), description: t('modulesSettings.modulesSavedDesc') });
        onSaved();
        return true;
      }

      const latestActiveSet = await (async () => {
        try {
          const fresh = await ApiService.getMyShop();
          const raw = (fresh as any)?.layoutConfig?.enabledModules;
          const next = Array.isArray(raw)
            ? (raw.map((x: any) => String(x || '').trim()).filter(Boolean) as ModuleId[])
            : ([] as ModuleId[]);
          return new Set<ModuleId>(Array.from(new Set([...next, ...CORE_IDS])) as any);
        } catch {
          return new Set<ModuleId>(activeEnabled as any);
        }
      })();

      const requestedModules = list
        .filter((id) => !latestActiveSet.has(id as any))
        .filter((id) => !CORE_IDS.includes(id as any));

      const requestedButtons = Array.from(pendingRequestedButtons);
      const allRequested = [...requestedModules, ...requestedButtons];

      if (allRequested.length === 0) {
        toast({ title: t('modulesSettings.nothingNew'), description: t('modulesSettings.noNewModulesSelected') });
        baselineRef.current = toSortedArray(latestActiveSet as any);
        emitChanges(0);
        setEnabled(new Set(latestActiveSet as any));
        return true;
      }

      await (ApiService as any).createMyModuleUpgradeRequest?.({
        requestedModules: allRequested,
      });

      toast({
        title: t('modulesSettings.requestSent'),
        description: t('modulesSettings.requestSentDesc'),
      });

      setPendingRequestedButtons(new Set());
      const baseline = toSortedArray(latestActiveSet as any);
      baselineRef.current = baseline;
      emitChanges(0);
      setEnabled(new Set(latestActiveSet as any));
      await fetchMyRequests();
      onSaved();
      return true;
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : undefined;
      const msg = e?.message ? String(e.message) : '';

      if (status === 400 && (msg.includes('مفعلة بالفعل') || msg.toLowerCase().includes('already enabled'))) {
        toast({
          title: t('modulesSettings.nothingNew'),
          description: t('modulesSettings.alreadyEnabled'),
        });
        try {
          const fresh = await ApiService.getMyShop();
          const raw = (fresh as any)?.layoutConfig?.enabledModules;
          const next = Array.isArray(raw)
            ? (raw.map((x: any) => String(x || '').trim()).filter(Boolean) as ModuleId[])
            : ([] as ModuleId[]);
          const merged = Array.from(new Set([...next, ...CORE_IDS]));
          merged.sort();
          baselineRef.current = merged;
          emitChanges(0);
          setEnabled(new Set(merged as any));
        } catch {
        }
        onSaved();
        return true;
      }

      toast({
        title: t('modulesSettings.error'),
        description: msg ? t('modulesSettings.saveModulesFailed', { msg }) : t('modulesSettings.saveModulesFailedShort'),
        variant: 'destructive',
      });
      throw e;
    } finally {
      setSaving(false);
    }
  }, [activeEnabled, adminShopId, enabled, enabledActivityButtons, pendingRequestedButtons, onSaved, selectedActivity, shop, toast, t, fetchMyRequests]);

  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent('merchant-settings-register-save-handler', {
          detail: { sectionId: 'modules', handler: saveModules },
        }),
      );
    } catch {
    }
  }, [saveModules]);

  const coreModules = useMemo(() => MODULES.filter((m) => m.kind === 'core'), []);
  const optionalModules = useMemo(() => MODULES.filter((m) => m.kind === 'optional'), []);

  return (
    <div className={`space-y-10 ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* ── العنوان والوصف ── */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl">
        <h3 className="text-3xl font-black">{t('modulesSettings.upgrade')}</h3>
        <p className="text-sm font-bold text-slate-300 mt-3 leading-relaxed max-w-2xl">
          {t('modulesSettings.upgradeDesc')}
        </p>
      </div>

      {/* ── الأقسام الأساسية (Core) ── */}
      <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
            <LayoutGrid size={20} />
          </div>
          <div className="font-black text-slate-900 text-lg">{t('modulesSettings.coreModules')}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {coreModules.map((m) => {
            const Icon = moduleIcons[m.id] || LayoutGrid;
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-slate-900 text-sm truncate">{m.label}</div>
                  <div className="text-[10px] font-black text-emerald-600">{t('modulesSettings.core')}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── أزرار النشاط الخاص (Activity Private Buttons) ── */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 shadow-sm border border-cyan-100">
              <Store size={20} />
            </div>
            <div>
              <div className="font-black text-slate-900 text-lg">أزرار النشاط الخاص</div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">{selectedActivity.title} — {selectedActivity.description}</div>
            </div>
          </div>
          {!adminShopId && (
            <div className="text-[11px] font-black text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-full px-4 py-1.5 shadow-sm">نشاطك الحالي</div>
          )}
        </div>

        {adminShopId && (
          <div className="mb-6 p-5 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-xs font-black text-slate-500 mb-4">اختر النشاط الدقيق ثم فعّل الأزرار الخاصة التي تظهر للتاجر بجانب الأزرار العامة.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shop?.category === 'SERVICE' ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-4 col-span-2 shadow-sm">
                  <div className="font-black text-slate-900 text-sm mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-cyan-500" />
                    أنشطة الحجوزات والمواعيد
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {BOOKING_ACTIVITIES.map((activity) => {
                      const checked = selectedActivityId === activity.id;
                      return (
                        <button
                          key={activity.id}
                          type="button"
                          onClick={() => {
                            setSelectedActivityId(activity.id);
                            setEnabledActivityButtons(new Set());
                          }}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all ${
                            checked ? 'border-cyan-400 bg-cyan-50 text-slate-900 shadow-sm' : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          {activity.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                BUSINESS_ACTIVITY_GROUPS.map((group) => (
                  <div key={group.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="font-black text-slate-900 text-sm mb-3">{group.title}</div>
                    <div className="flex flex-wrap gap-2">
                      {group.activities.map((activity) => {
                        const checked = selectedActivityId === activity.id;
                        return (
                          <button
                            key={activity.id}
                            type="button"
                            onClick={() => {
                              setSelectedActivityId(activity.id);
                              setEnabledActivityButtons(new Set());
                            }}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all ${
                              checked ? 'border-cyan-400 bg-cyan-50 text-slate-900 shadow-sm' : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-200'
                            }`}
                          >
                            {activity.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedActivity.privateButtons.map((button) => {
            const isActive = enabledActivityButtons.has(button.id);
            const isChecked = pendingRequestedButtons.has(button.id);
            const isPendingApproval = pendingFromAdmin.has(button.id);
            const Icon = moduleIcons[button.id] || Store;
            
            return (
              <div
                key={button.id}
                className={`relative group bg-white rounded-3xl border transition-all duration-300 p-5 flex flex-col gap-4 ${
                  isActive ? 'border-emerald-200 bg-emerald-50/10 shadow-sm' :
                  isPendingApproval ? 'border-amber-200 bg-amber-50/50 animate-pulse' :
                  isChecked ? 'border-cyan-400 bg-cyan-50/40' :
                  'border-slate-100 hover:border-slate-200 hover:shadow-md'
                }`}
              >
                {isActive && (
                  <div className="absolute top-4 left-4 rtl:right-4 rtl:left-auto">
                    <div className="bg-emerald-500 text-white rounded-full p-1 shadow-lg shadow-emerald-100">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                    isActive ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Icon size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 text-base truncate">{button.label}</h4>
                    {isPendingApproval ? (
                      <span className="text-[10px] text-amber-600 font-black block mt-0.5 animate-pulse">
                        {isArabic ? 'جاري المراجعة...' : 'Pending Review...'}
                      </span>
                    ) : isActive ? (
                      <span className="text-[10px] text-emerald-600 font-black block mt-0.5">
                        {isArabic ? 'مفعل ونشط' : 'Active & Enabled'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-black block mt-0.5">
                        {isArabic ? 'زر خاص بنشاطك' : 'Private Activity Button'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex gap-2 pt-2">
                  {isPendingApproval ? (
                    <div className="w-full py-3 rounded-2xl bg-amber-100 text-amber-700 text-xs font-black text-center flex items-center justify-center gap-2 border border-amber-200">
                      <Clock size={14} />
                      {isArabic ? 'قيد الانتظار' : 'Pending'}
                    </div>
                  ) : isActive ? (
                    <button
                      type="button"
                      onClick={() => removeActiveActivityButton(button.id)}
                      disabled={saving}
                      className="w-full py-3 rounded-2xl bg-red-50 text-red-600 text-xs font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      {isArabic ? 'إزالة الزر' : 'Uninstall'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (adminShopId) {
                          toggleActivityButton(button.id);
                        } else {
                          toggleRequestedButton(button.id);
                        }
                      }}
                      className={`w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                        isChecked || (adminShopId && isActive)
                          ? 'bg-slate-900 text-white hover:bg-black' 
                          : 'bg-cyan-500 text-white hover:brightness-110 shadow-lg shadow-cyan-100'
                      }`}
                    >
                      {(isChecked || (adminShopId && isActive)) ? (
                        <>
                          <Check size={14} />
                          {isArabic ? 'تم الاختيار' : 'Selected'}
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          {isArabic ? 'تثبيت الآن' : 'Install Now'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── الأقسام الاختيارية (Optional Modules) ── */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="font-black text-slate-900 text-lg">{t('modulesSettings.optionalModules')}</div>
            <p className="text-xs font-bold text-slate-500 mt-0.5">{t('modulesSettings.upgradeDesc')}</p>
          </div>
        </div>

        <div className="space-y-4">
          {MODULE_GROUPS.map((group) => {
            const groupRegModules = group.registryModuleIds
              .map((id) => registryModuleMap[id])
              .filter(Boolean);
            if (groupRegModules.length === 0) return null;
            const isExpanded = expandedGroups.has(group.id);
            const totalFeatures = groupRegModules.reduce((sum, mod) => sum + mod.features.length, 0);
            const activeCount = groupRegModules.reduce((sum, mod) => sum + ((moduleFeatures[mod.id] || new Set()).size), 0);
            const pendingCount = groupRegModules.reduce((sum, mod) =>
              sum + mod.features.filter((f: any) => pendingFromAdmin.has(`${mod.id}:${f.id}`)).length, 0);
            const GroupIcon = group.icon;

            return (
              <div key={group.id} className="rounded-[2rem] border border-slate-100 overflow-hidden transition-all bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setExpandedGroups((prev) => {
                      const next = new Set(prev);
                      if (next.has(group.id)) next.delete(group.id);
                      else next.add(group.id);
                      return next;
                    });
                  }}
                  className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-white shrink-0"
                    style={{ backgroundColor: group.color }}
                  >
                    <GroupIcon size={24} />
                  </div>
                  <div className="flex-1 min-w-0 text-left rtl:text-right">
                    <h4 className="font-black text-slate-900 text-base">
                      {isArabic ? group.labelAr : group.label}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-black text-slate-400">
                        {totalFeatures} {isArabic ? 'ميزة' : 'features'}
                      </span>
                      {activeCount > 0 && (
                        <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                          {activeCount} {isArabic ? 'مفعل' : 'active'}
                        </span>
                      )}
                      {pendingCount > 0 && (
                        <span className="text-[11px] font-black text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 animate-pulse">
                          {pendingCount} {isArabic ? 'قيد المراجعة' : 'pending'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    size={24}
                    className={`text-slate-400 transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="p-4 pt-2 bg-slate-50/50 border-t border-slate-100 space-y-2">
                    {groupRegModules.flatMap((regMod) => {
                      return regMod.features.map((feature: any) => {
                        const featureKey = `${regMod.id}:${feature.id}`;
                        const featureEnabled = (moduleFeatures[regMod.id] || new Set()).has(feature.id);
                        const isPending = pendingFromAdmin.has(featureKey);
                        return (
                          <div
                            key={`${regMod.id}-${feature.id}`}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              featureEnabled
                                ? 'border-emerald-200 bg-emerald-50/50'
                                : isPending
                                ? 'border-amber-200 bg-amber-50/50 animate-pulse'
                                : 'border-slate-100 bg-white'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              featureEnabled ? 'bg-emerald-100 text-emerald-600' : isPending ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {featureEnabled ? <Check size={16} strokeWidth={3} /> : isPending ? <Clock size={16} /> : (() => {
                                const FeatureIcon = moduleIcons[feature.id] || LayoutGrid;
                                return <FeatureIcon size={16} />;
                              })()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-black text-slate-900">
                                {isArabic ? (feature.labelAr || feature.label) : feature.label}
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                                {featureEnabled
                                  ? (isArabic ? 'مفعّلة' : 'Enabled')
                                  : isPending
                                  ? (isArabic ? 'قيد المراجعة' : 'Pending Review')
                                  : (isArabic ? 'غير مفعّلة' : 'Not enabled')}
                              </div>
                            </div>
                            {isPending ? (
                              <div className="px-3 py-2 rounded-xl text-[11px] font-black flex items-center gap-1.5 shrink-0 bg-amber-50 text-amber-700 border border-amber-100">
                                <Clock size={12} />
                                {isArabic ? 'قيد المراجعة' : 'Pending'}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleFeature(regMod.id, feature.id)}
                                className={`px-3 py-2 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 shrink-0 ${
                                  featureEnabled
                                    ? 'bg-white border border-red-100 text-red-600 hover:bg-red-50'
                                    : 'bg-cyan-500 text-white hover:brightness-110 shadow-sm shadow-cyan-100'
                                }`}
                              >
                                {featureEnabled ? (
                                  <>
                                    <Trash2 size={12} />
                                    {isArabic ? 'إزالة' : 'Uninstall'}
                                  </>
                                ) : (
                                  <>
                                    <Download size={12} />
                                    {isArabic ? 'تثبيت' : 'Install'}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      });
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── زر الحفظ النهائي ── */}
        <div className="mt-12 pt-8 border-t border-slate-50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50 rounded-[2.5rem] p-6 md:p-8">
            <div className="text-right">
              <div className="font-black text-slate-900 text-lg">هل انتهيت من اختيار أقسامك؟</div>
              <p className="text-xs font-bold text-slate-500 mt-1">سيتم إرسال طلبك للأدمن للمراجعة والتفعيل مباشرة.</p>
            </div>
            <button
              type="button"
              disabled={saving || (Array.from(pendingRequestedButtons).length === 0 && Array.from(enabled).length === (baselineRef.current?.length || 0))}
              onClick={() => {
                saveModules().catch(() => {});
              }}
              className="w-full md:w-auto min-w-[280px] py-5 px-8 rounded-[2rem] bg-slate-900 text-white font-black hover:bg-black transition-all shadow-2xl shadow-slate-300 flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed transform active:scale-95"
            >
              {saving ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  {t('modulesSettings.saving')}
                </>
              ) : (
                <>
                  <RefreshCw size={24} />
                  {isArabic ? 'حفظ وإرسال طلب الترقية' : 'Save & Submit Upgrade Request'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulesSettings;
