import { Injectable } from '@nestjs/common';

@Injectable()
export class ShopModulesService {
  getAllowedDashboardModules() {
    return new Set([
      'overview',
      'products',
      'promotions',
      'builder',
      'settings',
      'gallery',
      'reservations',
      'invoice',
      'sales',
      'customers',
      'reports',
      'pos',
    ]);
  }

  getCoreDashboardModules() {
    return ['overview', 'products', 'promotions', 'builder', 'settings'];
  }

  getAllowedDashboardModulesForCategory(categoryRaw: any) {
    const cat = String(categoryRaw || '').trim().toUpperCase();
    const core = this.getCoreDashboardModules();
    const always = new Set<string>(core);
    always.add('gallery');
    always.add('reservations');

    const add = (...ids: string[]) => {
      for (const id of ids) always.add(id);
    };

    // Keep this mapping aligned with frontend ACTIVITY_CONFIGS.
    if (cat === 'RESTAURANT') {
      add('reservations', 'sales', 'customers', 'reports', 'pos');
      return always;
    }
    if (cat === 'SERVICE') {
      add('reservations', 'sales', 'customers', 'reports', 'pos');
      return always;
    }
    if (cat === 'FASHION') {
      add('sales', 'customers', 'reports', 'pos');
      return always;
    }
    if (cat === 'RETAIL' || cat === 'ELECTRONICS' || cat === 'HEALTH' || cat === 'FOOD') {
      add('sales', 'customers', 'reports', 'pos');
      return always;
    }

    return always;
  }

  normalizeRequestedModules(raw: any) {
    const list = Array.isArray(raw) ? raw : [];
    const allowed = this.getAllowedDashboardModules();
    const normalized = list
      .map((x) => String(x || '').trim())
      .filter(Boolean)
      .filter((id) => allowed.has(id));
    return Array.from(new Set(normalized));
  }

  getDefaultDashboardConfigForCategory(categoryRaw: any) {
    const cat = String(categoryRaw || '').trim().toUpperCase();
    const core = ['overview', 'products', 'promotions', 'builder', 'settings'];
    const manageByDefault = cat === 'RESTAURANT' || cat === 'FOOD' || cat === 'RETAIL' || cat === 'HEALTH';

    return {
      dashboardMode: manageByDefault ? 'manage' : 'showcase',
      enabledModules: core,
    };
  }
}
