import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Shield, Plus, Search, X, Lock, Unlock, User, Pencil, Trash2,
  Eye, Edit3, Trash, ChevronDown, ChevronRight, History,
  CheckCircle2, XCircle, Loader2, AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MODULE_REGISTRY } from '../../../../config/modules/registry';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

type SubPermission = 'view' | 'edit' | 'delete';

type RolePermission = {
  moduleId: string;
  actions: SubPermission[];
};

type Role = {
  id: string;
  name: string;
  nameAr?: string;
  color: string;
  isSystem: boolean;
  permissions: RolePermission[];
  fullAccess: boolean;
  users: number;
  status: 'active' | 'inactive';
  createdAt: string;
};

type AccessLogEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  actionAr: string;
  target: string;
  details: string;
  detailsAr: string;
};

const ROLE_COLORS = [
  'bg-blue-50 text-blue-600',
  'bg-purple-50 text-purple-600',
  'bg-emerald-50 text-emerald-600',
  'bg-amber-50 text-amber-600',
  'bg-rose-50 text-rose-600',
  'bg-cyan-50 text-cyan-600',
  'bg-indigo-50 text-indigo-600',
  'bg-orange-50 text-orange-600',
];

const DEFAULT_ROLES: Role[] = [
  {
    id: 'r1',
    name: 'Manager',
    nameAr: 'مدير',
    color: ROLE_COLORS[0],
    isSystem: true,
    fullAccess: true,
    permissions: [],
    users: 2,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'r2',
    name: 'Cashier',
    nameAr: 'كاشير',
    color: ROLE_COLORS[1],
    isSystem: true,
    fullAccess: false,
    permissions: [
      { moduleId: 'sales', actions: ['view', 'edit'] },
      { moduleId: 'core', actions: ['view'] },
    ],
    users: 5,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'r3',
    name: 'Inventory Staff',
    nameAr: 'مخزني',
    color: ROLE_COLORS[2],
    isSystem: true,
    fullAccess: false,
    permissions: [
      { moduleId: 'inventory', actions: ['view', 'edit', 'delete'] },
      { moduleId: 'core', actions: ['view'] },
    ],
    users: 3,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

const DEFAULT_LOGS: AccessLogEntry[] = [
  {
    id: 'l1',
    timestamp: new Date(Date.now() - 3600_000).toISOString(),
    actor: 'admin@mnmknk.com',
    action: 'Role Created',
    actionAr: 'إنشاء دور',
    target: 'Cashier',
    details: 'Created with sales.view, sales.edit, core.view',
    detailsAr: 'أُنشئ بصلاحيات: مبيعات.عرض، مبيعات.تعديل، رئيسي.عرض',
  },
  {
    id: 'l2',
    timestamp: new Date(Date.now() - 7200_000).toISOString(),
    actor: 'admin@mnmknk.com',
    action: 'Permission Modified',
    actionAr: 'تعديل صلاحية',
    target: 'Inventory Staff',
    details: 'Added inventory.delete permission',
    detailsAr: 'أُضيفت صلاحية مخزون.حذف',
  },
  {
    id: 'l3',
    timestamp: new Date(Date.now() - 86400_000).toISOString(),
    actor: 'manager@mnmknk.com',
    action: 'Role Login',
    actionAr: 'تسجيل دخول دور',
    target: 'Manager',
    details: 'Logged in from 192.168.1.5',
    detailsAr: 'تسجيل دخول من 192.168.1.5',
  },
];

const SUB_PERMS: { id: SubPermission; label: string; labelAr: string; icon: React.ElementType }[] = [
  { id: 'view', label: 'View', labelAr: 'عرض', icon: Eye },
  { id: 'edit', label: 'Edit', labelAr: 'تعديل', icon: Edit3 },
  { id: 'delete', label: 'Delete', labelAr: 'حذف', icon: Trash },
];

const PermissionsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [logs, setLogs] = useState<AccessLogEntry[]>(DEFAULT_LOGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState<'roles' | 'logs'>('roles');
  const [logSearch, setLogSearch] = useState('');

  // Load roles and access logs from backend
  const loadRoles = useCallback(async () => {
    const sid = String(shopId || '').trim();
    if (!sid) return;
    try {
      setLoading(true);
      setError(null);
      const [rolesData, logsData] = await Promise.all([
        ApiService.getHRRoles(sid),
        ApiService.getHRAccessLogs(sid, 50),
      ]);
      if (Array.isArray(rolesData) && rolesData.length) {
        setRoles(
          rolesData.map((r: any) => ({
            id: String(r.id || ''),
            name: String(r.name || ''),
            nameAr: r.name_ar || r.nameAr,
            color: String(r.color || 'bg-blue-50 text-blue-600'),
            isSystem: Boolean(r.is_system ?? r.isSystem),
            fullAccess: Boolean(r.full_access ?? r.fullAccess),
            permissions: (Array.isArray(r.permissions) ? r.permissions : []).map((p: any) => ({
              moduleId: String(p.moduleId || p.module_id || ''),
              actions: Array.isArray(p.actions) ? p.actions : [],
            })),
            users: Number(r.users || 0),
            status: (String(r.status || 'active') as Role['status']),
            createdAt: String(r.created_at || r.createdAt || new Date().toISOString()),
          })),
        );
      }
      if (Array.isArray(logsData) && logsData.length) {
        setLogs(
          logsData.map((l: any) => ({
            id: String(l.id || ''),
            timestamp: String(l.timestamp || l.created_at || new Date().toISOString()),
            actor: String(l.actor || ''),
            action: String(l.action || ''),
            actionAr: String(l.action_ar || l.actionAr || ''),
            target: String(l.target || ''),
            details: String(l.details || ''),
            detailsAr: String(l.details_ar || l.detailsAr || ''),
          })),
        );
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // New role form state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleNameAr, setNewRoleNameAr] = useState('');
  const [newRoleFullAccess, setNewRoleFullAccess] = useState(false);
  const [newRolePerms, setNewRolePerms] = useState<Record<string, SubPermission[]>>({});

  const allModules = useMemo(() => {
    return MODULE_REGISTRY.map((m) => ({
      id: m.id,
      name: m.name,
      nameAr: m.nameAr,
      color: m.color,
      permissions: m.permissions || [],
    }));
  }, []);

  const filteredRoles = roles.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      (r.nameAr || '').includes(search) ||
      r.id.toLowerCase().includes(q)
    );
  });

  const filteredLogs = logs.filter((l) => {
    const q = logSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      l.actor.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.target.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  const addLog = useCallback(
    (action: string, actionAr: string, target: string, details: string, detailsAr: string) => {
      const entry: AccessLogEntry = {
        id: `l${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'admin@mnmknk.com',
        action,
        actionAr,
        target,
        details,
        detailsAr,
      };
      setLogs((prev) => [entry, ...prev]);
    },
    [],
  );

  const toggleExpand = (roleId: string) => {
    setExpandedRoleId((prev) => (prev === roleId ? null : roleId));
  };

  const toggleRoleStatus = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    const newStatus = role.status === 'active' ? 'inactive' : 'active';
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, status: newStatus } : r)),
    );
    ApiService.updateHRRole(shopId, roleId, { status: newStatus }).catch(() => {});
    addLog(
      'Status Changed',
      'تغيير الحالة',
      role.name,
      `Status changed to ${newStatus}`,
      `تم تغيير الحالة إلى ${newStatus === 'active' ? 'نشط' : 'غير نشط'}`,
    );
  };

  const deleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role || role.isSystem) return;
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    ApiService.deleteHRRole(shopId, roleId).catch(() => {});
    addLog('Role Deleted', 'حذف دور', role.name, 'Role permanently deleted', 'تم حذف الدور نهائياً');
  };

  const updateRolePermission = (roleId: string, moduleId: string, action: SubPermission) => {
    const updatedRoleRef: { current: Role | null } = { current: null };
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId || r.fullAccess) return r;
        const existing = r.permissions.find((p) => p.moduleId === moduleId);
        let newPerms: RolePermission[];
        if (existing) {
          const hasAction = existing.actions.includes(action);
          newPerms = r.permissions.map((p) =>
            p.moduleId === moduleId
              ? { ...p, actions: hasAction ? p.actions.filter((a) => a !== action) : [...p.actions, action] }
              : p,
          );
        } else {
          newPerms = [...r.permissions, { moduleId, actions: [action] }];
        }
        const next = { ...r, permissions: newPerms.filter((p) => p.actions.length > 0) };
        updatedRoleRef.current = next;
        return next;
      }),
    );
    if (updatedRoleRef.current) {
      ApiService.updateHRRole(shopId, roleId, {
        permissions: updatedRoleRef.current.permissions.map((p: RolePermission) => ({ moduleId: p.moduleId, actions: p.actions })),
      }).catch(() => {});
    }
  };

  const toggleFullAccess = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    const newFull = !role.fullAccess;
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId ? { ...r, fullAccess: newFull, permissions: [] } : r,
      ),
    );
    ApiService.updateHRRole(shopId, roleId, { full_access: newFull, permissions: [] }).catch(() => {});
    addLog(
      'Access Level Changed',
      'تغيير مستوى الوصول',
      role.name,
      `Full access ${newFull ? 'enabled' : 'disabled'}`,
      `الوصول الكامل ${newFull ? 'مفعّل' : 'معطّل'}`,
    );
  };

  const handleCreateRole = async () => {
    const name = newRoleName.trim();
    if (!name) return;
    const perms: RolePermission[] = Object.entries(newRolePerms)
      .filter(([, actions]) => actions.length > 0)
      .map(([moduleId, actions]) => ({ moduleId, actions }));
    const color = ROLE_COLORS[roles.length % ROLE_COLORS.length];
    try {
      const created = await ApiService.createHRRole(shopId, {
        name,
        name_ar: newRoleNameAr.trim() || undefined,
        color,
        full_access: newRoleFullAccess,
        permissions: newRoleFullAccess ? [] : perms.map((p) => ({ moduleId: p.moduleId, actions: p.actions })),
      } as any);
      const role: Role = {
        id: created?.id || `r${Date.now()}`,
        name,
        nameAr: newRoleNameAr.trim() || undefined,
        color,
        isSystem: false,
        fullAccess: newRoleFullAccess,
        permissions: newRoleFullAccess ? [] : perms,
        users: 0,
        status: 'active',
        createdAt: created?.created_at || new Date().toISOString(),
      };
      setRoles((prev) => [...prev, role]);
      addLog('Role Created', 'إنشاء دور', role.name, `Created with ${perms.length} module permissions`, `أُنشئ بـ ${perms.length} صلاحية وحدة`);
    } catch (e: any) {
      setError(e?.message || 'Failed to create role');
    }
    resetForm();
    setShowCreateModal(false);
  };

  const handleSaveEdit = async () => {
    if (!editingRole) return;
    setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? editingRole : r)));
    try {
      await ApiService.updateHRRole(shopId, editingRole.id, {
        name: editingRole.name,
        name_ar: editingRole.nameAr,
        color: editingRole.color,
        full_access: editingRole.fullAccess,
        permissions: editingRole.permissions.map((p) => ({ moduleId: p.moduleId, actions: p.actions })),
      } as any);
    } catch (e: any) {
      setError(e?.message || 'Failed to update role');
    }
    addLog('Role Updated', 'تحديث دور', editingRole.name, 'Role settings updated', 'تم تحديث إعدادات الدور');
    setEditingRole(null);
  };

  const resetForm = () => {
    setNewRoleName('');
    setNewRoleNameAr('');
    setNewRoleFullAccess(false);
    setNewRolePerms({});
  };

  const toggleNewRolePerm = (moduleId: string, action: SubPermission) => {
    setNewRolePerms((prev) => {
      const existing = prev[moduleId] || [];
      const has = existing.includes(action);
      return {
        ...prev,
        [moduleId]: has ? existing.filter((a) => a !== action) : [...existing, action],
      };
    });
  };

  const getRolePermCount = (role: Role): number => {
    if (role.fullAccess) return allModules.length;
    return role.permissions.length;
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString(isArabic ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = [
    { label: isArabic ? 'إجمالي الأدوار' : 'Total Roles', value: roles.length, color: 'bg-blue-50 text-blue-600' },
    { label: isArabic ? 'نشطة' : 'Active', value: roles.filter((r) => r.status === 'active').length, color: 'bg-green-50 text-green-600' },
    { label: isArabic ? 'إجمالي المستخدمين' : 'Total Users', value: roles.reduce((s, r) => s + r.users, 0), color: 'bg-purple-50 text-purple-600' },
    { label: isArabic ? 'وصول كامل' : 'Full Access', value: roles.filter((r) => r.fullAccess).length, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-400" />
            {isArabic ? 'إدارة الصلاحيات' : 'Permissions Management'}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {isArabic
              ? 'إدارة صلاحيات الموظفين والأدوار والوصول للوحات والأقسام'
              : 'Manage staff roles, permissions, and access to dashboards and sections'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
        >
          <Plus className="w-4 h-4" />
          {isArabic ? 'دور جديد' : 'New Role'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      )}
      {error && !loading && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white">
            <div className={`p-2 rounded-lg ${s.color}`}><Shield className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400">{s.label}</p>
              <p className="text-lg font-black text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'roles' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Shield className="w-4 h-4" />
          {isArabic ? 'الأدوار' : 'Roles'}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-4 h-4" />
          {isArabic ? 'سجل العمليات' : 'Access Log'}
        </button>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <>
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isArabic ? 'بحث عن دور...' : 'Search roles...'}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-all"
            />
          </div>

          {/* Roles List */}
          <div className="space-y-3">
            {filteredRoles.map((role) => (
              <div key={role.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Role Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl ${role.color}`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-slate-900">
                          {isArabic && role.nameAr ? role.nameAr : role.name}
                        </p>
                        {role.isSystem && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-bold">
                            {isArabic ? 'نظام' : 'SYSTEM'}
                          </span>
                        )}
                        {role.fullAccess && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> {isArabic ? 'وصول كامل' : 'FULL ACCESS'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                          <User className="w-3 h-3" /> {role.users}
                        </span>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {getRolePermCount(role)} {isArabic ? 'وحدة' : 'modules'}
                        </span>
                        <span className="text-xs text-slate-300">·</span>
                        <span className={`text-xs font-bold ${role.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {role.status === 'active' ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'معطّل' : 'Inactive')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Expand */}
                    <button
                      onClick={() => toggleExpand(role.id)}
                      className="p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {expandedRoleId === role.id ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className={`w-4 h-4 text-slate-400 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    {/* Toggle status */}
                    <button
                      onClick={() => toggleRoleStatus(role.id)}
                      className={`p-2 rounded-lg transition-colors ${role.status === 'active' ? 'hover:bg-emerald-50' : 'hover:bg-slate-50'}`}
                      title={isArabic ? 'تبديل الحالة' : 'Toggle status'}
                    >
                      {role.status === 'active' ? (
                        <Unlock className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => setEditingRole({ ...role })}
                      className="p-2 rounded-lg hover:bg-slate-50 transition-colors"
                      title={isArabic ? 'تعديل' : 'Edit'}
                    >
                      <Pencil className="w-4 h-4 text-slate-400" />
                    </button>
                    {/* Delete (non-system only) */}
                    {!role.isSystem && (
                      <button
                        onClick={() => deleteRole(role.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title={isArabic ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Permissions */}
                {expandedRoleId === role.id && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                    {/* Full Access Toggle */}
                    <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-white border border-slate-100">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {isArabic ? 'وصول كامل لجميع الوحدات' : 'Full access to all modules'}
                          </p>
                          <p className="text-xs text-slate-400 font-semibold">
                            {isArabic ? 'يتجاوز جميع الصلاحيات الفردية' : 'Overrides all individual permissions'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFullAccess(role.id)}
                        disabled={role.isSystem && role.fullAccess}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          role.fullAccess ? 'bg-amber-500' : 'bg-slate-200'
                        } ${role.isSystem && role.fullAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                            role.fullAccess ? 'left-0.5' : 'left-5'
                          }`}
                        />
                      </button>
                    </div>

                    {!role.fullAccess && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 mb-2">
                          {isArabic ? 'الصلاحيات لكل وحدة' : 'Per-module permissions'}
                        </p>
                        {allModules.map((mod) => {
                          const perm = role.permissions.find((p) => p.moduleId === mod.id);
                          return (
                            <div key={mod.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mod.color }} />
                                <span className="text-sm font-semibold text-slate-700">
                                  {isArabic && mod.nameAr ? mod.nameAr : mod.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {SUB_PERMS.map((sp) => {
                                  const active = perm?.actions.includes(sp.id) || false;
                                  const SpIcon = sp.icon;
                                  return (
                                    <button
                                      key={sp.id}
                                      onClick={() => updateRolePermission(role.id, mod.id, sp.id)}
                                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        active
                                          ? 'bg-slate-900 text-white'
                                          : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                                      }`}
                                    >
                                      <SpIcon className="w-3 h-3" />
                                      {isArabic ? sp.labelAr : sp.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredRoles.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                <p className="font-bold text-slate-400 text-sm">
                  {isArabic ? 'لا توجد أدوار' : 'No roles found'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Access Log Tab */}
      {activeTab === 'logs' && (
        <>
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-300" />
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder={isArabic ? 'بحث في السجل...' : 'Search logs...'}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-all"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-4">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <History className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">
                        {isArabic ? log.actionAr : log.action}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold">
                        {log.target}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      {isArabic ? log.detailsAr : log.details}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold">{log.actor}</span>
                      <span className="text-[10px] text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{formatTime(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredLogs.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <History className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <p className="font-bold text-slate-400 text-sm">
                {isArabic ? 'لا توجد سجلات' : 'No log entries'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white flex items-center justify-between p-5 border-b border-slate-100">
              <h4 className="text-lg font-black text-slate-900">{isArabic ? 'إنشاء دور جديد' : 'Create New Role'}</h4>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-slate-50">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">{isArabic ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                  <input
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Cashier"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">{isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                  <input
                    value={newRoleNameAr}
                    onChange={(e) => setNewRoleNameAr(e.target.value)}
                    placeholder="مثال: كاشير"
                    dir="rtl"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none focus:border-slate-300"
                  />
                </div>
              </div>

              {/* Full Access */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{isArabic ? 'وصول كامل' : 'Full Access'}</p>
                    <p className="text-xs text-slate-400 font-semibold">{isArabic ? 'صلاحيات لكل الوحدات' : 'All modules, all actions'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setNewRoleFullAccess(!newRoleFullAccess)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${newRoleFullAccess ? 'bg-amber-500' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${newRoleFullAccess ? 'left-0.5' : 'left-5'}`} />
                </button>
              </div>

              {/* Per-module permissions */}
              {!newRoleFullAccess && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500">{isArabic ? 'الصلاحيات لكل وحدة' : 'Per-module permissions'}</p>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {allModules.map((mod) => {
                      const selected = newRolePerms[mod.id] || [];
                      return (
                        <div key={mod.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mod.color }} />
                            <span className="text-sm font-semibold text-slate-700">
                              {isArabic && mod.nameAr ? mod.nameAr : mod.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {SUB_PERMS.map((sp) => {
                              const active = selected.includes(sp.id);
                              const SpIcon = sp.icon;
                              return (
                                <button
                                  key={sp.id}
                                  onClick={() => toggleNewRolePerm(mod.id, sp.id)}
                                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                    active ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  <SpIcon className="w-3 h-3" />
                                  {isArabic ? sp.labelAr : sp.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleCreateRole}
                  disabled={!newRoleName.trim()}
                  className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isArabic ? 'إنشاء الدور' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditingRole(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h4 className="text-lg font-black text-slate-900">
                {isArabic ? 'تعديل الدور' : 'Edit Role'}: {isArabic && editingRole.nameAr ? editingRole.nameAr : editingRole.name}
              </h4>
              <button onClick={() => setEditingRole(null)} className="p-1 rounded-lg hover:bg-slate-50">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">{isArabic ? 'اسم الدور' : 'Role name'}</label>
                <input
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  disabled={editingRole.isSystem}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none focus:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">{isArabic ? 'الاسم (عربي)' : 'Arabic name'}</label>
                <input
                  value={editingRole.nameAr || ''}
                  onChange={(e) => setEditingRole({ ...editingRole, nameAr: e.target.value })}
                  dir="rtl"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none focus:border-slate-300"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">{isArabic ? 'عدد المستخدمين' : 'User count'}</span>
                </div>
                <input
                  type="number"
                  min={0}
                  value={editingRole.users}
                  onChange={(e) => setEditingRole({ ...editingRole, users: parseInt(e.target.value) || 0 })}
                  className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-center"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingRole(null)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all"
                >
                  {isArabic ? 'حفظ' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsPage;
