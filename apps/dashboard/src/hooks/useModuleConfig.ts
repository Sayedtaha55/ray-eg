import { useMemo } from 'react';
import {
  MODULE_DEFINITIONS,
  resolveDependencies,
  getNavigationSections,
  getDashboardWidgets,
  getEnabledTabIds,
  getSettingsSections,
  getInitialModules,
  getBusinessTypeById,
  DEFAULT_ENABLED_MODULES,
} from '../config/modules';
import type { ModuleId } from '../config/modules';

const CATEGORY_TO_TYPE_MAP: Record<string, string> = {
  RESTAURANT: 'restaurant',
  FOOD: 'grocery',
  FASHION: 'fashion',
  RETAIL: 'other',
  SERVICE: 'serviceCompanies',
  ELECTRONICS: 'electronics',
  HEALTH: 'health',
  OTHER: 'other',
};

export function getShopModuleIds(shop: any): ModuleId[] {
  if (!shop) return DEFAULT_ENABLED_MODULES;

  const enabledModules = (shop as any)?.enabledModules;
  if (Array.isArray(enabledModules) && enabledModules.length > 0) {
    const ids = enabledModules
      .map((m: any) => String(m).trim())
      .filter(Boolean) as ModuleId[];
    return resolveDependencies(ids);
  }

  const pageDesign = (shop as any)?.pageDesign;
  if (pageDesign) {
    const moduleConfig = pageDesign.moduleConfig;
    if (moduleConfig?.enabledModules && Array.isArray(moduleConfig.enabledModules)) {
      const ids = moduleConfig.enabledModules
        .map((m: any) => String(m).trim())
        .filter(Boolean) as ModuleId[];
      return resolveDependencies(ids);
    }

    const legacyEnabledModules = pageDesign.enabledModules;
    if (Array.isArray(legacyEnabledModules) && legacyEnabledModules.length > 0) {
      const ids = legacyEnabledModules
        .map((m: any) => String(m).trim())
        .filter(Boolean) as ModuleId[];
      return resolveDependencies(ids);
    }

    const bookingActivityType = pageDesign.bookingActivityType;
    if (bookingActivityType) {
      const bookingType = getBusinessTypeById(bookingActivityType);
      if (bookingType) {
        return getInitialModules(bookingType.id);
      }
    }
  }

  const category = String((shop as any)?.category || '').toUpperCase();
  if (category) {
    const typeId = CATEGORY_TO_TYPE_MAP[category] || 'other';
    return getInitialModules(typeId);
  }

  return DEFAULT_ENABLED_MODULES;
}

export interface ModuleConfigResult {
  moduleIds: ModuleId[];
  navigationSections: ReturnType<typeof getNavigationSections>;
  dashboardWidgets: ReturnType<typeof getDashboardWidgets>;
  enabledTabIds: string[];
  settingsSections: ReturnType<typeof getSettingsSections>;
  isModuleDriven: boolean;
}

export function useModuleConfig(shop: any): ModuleConfigResult {
  return useMemo(() => {
    const moduleIds = getShopModuleIds(shop);
    const isModuleDriven = Boolean(
      (shop as any)?.enabledModules ||
      (shop as any)?.pageDesign?.moduleConfig?.enabledModules ||
      (shop as any)?.pageDesign?.enabledModules,
    );

    return {
      moduleIds,
      navigationSections: getNavigationSections(moduleIds),
      dashboardWidgets: getDashboardWidgets(moduleIds),
      enabledTabIds: getEnabledTabIds(moduleIds),
      settingsSections: getSettingsSections(moduleIds),
      isModuleDriven,
    };
  }, [shop]);
}
