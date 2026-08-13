import { MODULE_MAP, MODULE_DEFINITIONS } from './moduleDefinitions';
import { getBusinessTypeById } from './businessCategories';
import type { ModuleId, SystemSummaryData, ModuleRecommendation } from './types';

export const ALL_MODULE_IDS: ModuleId[] = MODULE_DEFINITIONS.map((m) => m.id);

export const DEFAULT_ENABLED_MODULES: ModuleId[] = MODULE_DEFINITIONS
  .filter((m) => m.defaultEnabled)
  .map((m) => m.id);

export function resolveDependencies(moduleIds: ModuleId[]): ModuleId[] {
  const result = new Set<ModuleId>(moduleIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(result)) {
      const mod = MODULE_MAP[id];
      if (!mod) continue;
      for (const dep of mod.dependencies) {
        if (!result.has(dep)) {
          result.add(dep);
          changed = true;
        }
      }
    }
  }
  return Array.from(result);
}

export function getDependents(moduleIds: ModuleId[], targetId: ModuleId): ModuleId[] {
  const result: ModuleId[] = [];
  for (const id of moduleIds) {
    if (id === targetId) continue;
    const mod = MODULE_MAP[id];
    if (!mod) continue;
    if (mod.dependencies.includes(targetId)) {
      result.push(id);
    }
  }
  return result;
}

export function toggleModule(
  enabledIds: ModuleId[],
  moduleId: ModuleId,
): { next: ModuleId[]; added: ModuleId[]; removed: ModuleId[]; blocked: ModuleId[] } {
  const mod = MODULE_MAP[moduleId];
  if (!mod || !mod.optional) {
    return { next: enabledIds, added: [], removed: [], blocked: [moduleId] };
  }

  const currentSet = new Set(enabledIds);

  if (currentSet.has(moduleId)) {
    const dependents = getDependents(Array.from(currentSet), moduleId);
    currentSet.delete(moduleId);
    const removed = [moduleId];
    for (const dep of dependents) {
      if (currentSet.has(dep)) {
        currentSet.delete(dep);
        removed.push(dep);
      }
    }
    return {
      next: Array.from(currentSet),
      added: [],
      removed,
      blocked: [],
    };
  }

  currentSet.add(moduleId);
  const resolved = resolveDependencies(Array.from(currentSet));
  const added = resolved.filter((id) => !currentSet.has(id) || id === moduleId);
  const newlyAdded = resolved.filter((id) => !enabledIds.includes(id));

  return {
    next: resolved,
    added: newlyAdded,
    removed: [],
    blocked: [],
  };
}

export function getRecommendedModules(businessTypeId: string): ModuleRecommendation[] {
  const businessType = getBusinessTypeById(businessTypeId);
  if (!businessType) return [];
  return businessType.recommendedModules;
}

export function getRecommendedModuleIds(businessTypeId: string): ModuleId[] {
  const recommendations = getRecommendedModules(businessTypeId);
  const ids = recommendations
    .filter((r) => r.priority === 'required' || r.priority === 'recommended')
    .map((r) => r.moduleId);
  return resolveDependencies(ids);
}

export function getInitialModules(businessTypeId: string): ModuleId[] {
  return getRecommendedModuleIds(businessTypeId);
}

export function computeSystemSummary(enabledModuleIds: ModuleId[]): SystemSummaryData {
  const resolved = resolveDependencies(enabledModuleIds);
  const enabledModules = resolved
    .map((id) => MODULE_MAP[id])
    .filter(Boolean)
    .map((mod) => ({
      id: mod.id,
      name: mod.name,
      nameAr: mod.nameAr,
      icon: mod.icon,
      color: mod.color,
      features: mod.features.length,
    }));

  let totalFeatures = 0;
  let totalPages = 0;
  let totalDashboardWidgets = 0;
  let totalNavigationItems = 0;
  let estimatedSetupMinutes = 0;

  for (const id of resolved) {
    const mod = MODULE_MAP[id];
    if (!mod) continue;
    totalFeatures += mod.features.length;
    totalPages += mod.pages.length;
    totalDashboardWidgets += mod.dashboardWidgets.length;
    for (const navSection of mod.navigation) {
      totalNavigationItems += navSection.items.length;
    }
    estimatedSetupMinutes += mod.estimatedSetupMinutes;
  }

  return {
    enabledModules,
    totalFeatures,
    totalPages,
    totalDashboardWidgets,
    totalNavigationItems,
    estimatedSetupMinutes,
    moduleCount: enabledModules.length,
  };
}

export function getNavigationSections(enabledModuleIds: ModuleId[], moduleFeatures?: Record<string, string[]> | null) {
  const resolved = resolveDependencies(enabledModuleIds);
  const sections: Array<{
    id: string;
    title: string;
    titleKey?: string;
    order: number;
    items: Array<{ id: string; label: string; labelKey?: string; route: string; tabId?: string; icon?: string; order: number }>;
  }> = [];

  for (const id of resolved) {
    const mod = MODULE_MAP[id];
    if (!mod) continue;

    const enabledFeatures = moduleFeatures ? moduleFeatures[id] : null;

    for (const navSection of mod.navigation) {
      const items = navSection.items.filter((item) => {
        const isFeature = mod.features.some((f) => f.id === item.id);
        if (isFeature && enabledFeatures != null) {
          return enabledFeatures.includes(item.id);
        }
        return true;
      });

      if (items.length > 0) {
        sections.push({
          id: navSection.id,
          title: navSection.title,
          titleKey: navSection.titleKey,
          order: navSection.order ?? 100,
        items: items.map((item) => ({
          id: item.id,
          label: item.label,
          labelKey: item.labelKey,
          route: item.route,
          tabId: item.tabId,
          icon: item.icon,
          order: item.order ?? 0,
        })),
      });
    }
  }
  }

  return sections.sort((a, b) => a.order - b.order);
}

export function getDashboardWidgets(enabledModuleIds: ModuleId[]) {
  const resolved = resolveDependencies(enabledModuleIds);
  const widgets: Array<{
    id: string;
    label: string;
    labelKey?: string;
    component?: string;
    order: number;
    size: 'small' | 'medium' | 'large' | 'full';
    moduleId: ModuleId;
  }> = [];

  for (const id of resolved) {
    const mod = MODULE_MAP[id];
    if (!mod) continue;
    for (const widget of mod.dashboardWidgets) {
      widgets.push({
        id: widget.id,
        label: widget.label,
        labelKey: widget.labelKey,
        component: widget.component,
        order: widget.order ?? 100,
        size: widget.size ?? 'medium',
        moduleId: id,
      });
    }
  }

  return widgets.sort((a, b) => a.order - b.order);
}

export function getEnabledTabIds(enabledModuleIds: ModuleId[], moduleFeatures?: Record<string, string[]> | null): string[] {
  const resolved = resolveDependencies(enabledModuleIds);
  const tabIds = new Set<string>();
  for (const id of resolved) {
    const mod = MODULE_MAP[id];
    if (!mod) continue;

    const enabledFeatures = moduleFeatures ? moduleFeatures[id] : null;

    for (const page of mod.pages) {
      if (page.tabId) {
        const isFeature = mod.features.some((f) => f.id === page.id);
        if (isFeature && enabledFeatures != null) {
          if (enabledFeatures.includes(page.id)) {
            tabIds.add(page.tabId);
          }
        } else {
          tabIds.add(page.tabId);
        }
      }
    }
  }
  return Array.from(tabIds);
}

export function getSettingsSections(enabledModuleIds: ModuleId[]) {
  const resolved = resolveDependencies(enabledModuleIds);
  const sections: Array<{
    id: string;
    label: string;
    labelKey?: string;
    moduleId: ModuleId;
  }> = [];

  for (const id of resolved) {
    const mod = MODULE_MAP[id];
    if (!mod) continue;
    for (const section of mod.settingsSections) {
      sections.push({
        id: section.id,
        label: section.label,
        labelKey: section.labelKey,
        moduleId: id,
      });
    }
  }

  return sections;
}

export function getPermissions(enabledModuleIds: ModuleId[]) {
  const resolved = resolveDependencies(enabledModuleIds);
  const permissions: Array<{ id: string; label: string; moduleId: ModuleId }> = [];

  for (const id of resolved) {
    const mod = MODULE_MAP[id];
    if (!mod) continue;
    for (const perm of mod.permissions) {
      permissions.push({
        id: perm.id,
        label: perm.label,
        moduleId: id,
      });
    }
  }

  return permissions;
}
