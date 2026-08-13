'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, MoreVertical, User, Trash2, ArrowLeftRight,
  Loader2, RefreshCw, Shield, ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useToast } from '@/components/settings/ToastProvider';

const MotionDiv = motion.div as any;

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'merchant' | 'customer'>('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const loadUsers = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);
    try {
      const data = await apiRequest('/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: 'فشل تحميل المستخدمين', variant: 'destructive' });
      setUsers([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
    try {
      await apiRequest(`/users/${userId}`, { method: 'DELETE' });
      toast({ title: 'تم حذف المستخدم', variant: 'success' });
      await loadUsers(true);
    } catch {
      toast({ title: 'فشل الحذف', variant: 'destructive' });
    }
    setActiveMenu(null);
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'customer' ? 'merchant' : 'customer';
    try {
      await apiRequest(`/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      toast({
        title: `تم تغيير الدور إلى: ${newRole === 'merchant' ? 'تاجر' : 'عميل'}`,
        variant: 'success',
      });
      await loadUsers(true);
    } catch {
      toast({ title: 'فشل تغيير الدور', variant: 'destructive' });
    }
    setActiveMenu(null);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = !searchTerm ||
        String(user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || String(user?.role || '').toLowerCase() === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const paginatedUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const roleStats = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => String(u?.role || '').toLowerCase() === 'admin').length,
    merchants: users.filter((u) => String(u?.role || '').toLowerCase() === 'merchant').length,
    customers: users.filter((u) => String(u?.role || '').toLowerCase() === 'customer').length,
  }), [users]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-white">إدارة المستخدمين</h2>
              {isRefreshing && <RefreshCw size={16} className="text-[#00E5FF] animate-spin" />}
            </div>
            <p className="text-slate-500 text-sm font-bold">عرض وإدارة جميع مستخدمي المنصة</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 w-full md:w-auto">
          {[
            ['الإجمالي', roleStats.total, 'text-white'],
            ['أدمن', roleStats.admins, 'text-red-400'],
            ['تجار', roleStats.merchants, 'text-[#00E5FF]'],
            ['عملاء', roleStats.customers, 'text-slate-400'],
          ].map(([label, val, color]: any) => (
            <div key={label} className="rounded-2xl bg-slate-900/70 border border-white/5 px-4 py-3 text-center">
              <div className="text-slate-500 text-[10px] font-black">{label}</div>
              <div className={`mt-1 text-xl font-black ${color}`}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row gap-3 p-6 border-b border-white/5">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm"
              placeholder="ابحث بالاسم أو البريد..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as any); setPage(0); }}
            className="px-4 py-3 bg-slate-900 border border-white/5 rounded-xl text-white text-sm font-bold outline-none focus:border-[#00E5FF]/50"
          >
            <option value="all">كل الأدوار</option>
            <option value="admin">أدمن</option>
            <option value="merchant">تاجر</option>
            <option value="customer">عميل</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="py-24 text-center">
            <User size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
            <p className="text-slate-500 font-bold">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">المستخدم</th>
                  <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">الدور</th>
                  <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">البريد</th>
                  <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">تاريخ الانضمام</th>
                  <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest text-left">تحكم</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4 flex-row-reverse">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-[#00E5FF] border border-white/5">
                          {String(user?.name || '?').charAt(0)}
                        </div>
                        <span className="text-white font-bold group-hover:text-[#00E5FF] transition-colors">
                          {user?.name || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                          user?.role === 'admin'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : user?.role === 'merchant'
                            ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {user?.role === 'admin' ? 'أدمن' : user?.role === 'merchant' ? 'تاجر' : 'عميل'}
                      </span>
                    </td>
                    <td className="p-6 text-slate-500 text-sm font-medium">{user?.email || '-'}</td>
                    <td className="p-6 text-slate-500 text-xs font-bold">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : '-'}
                    </td>
                    <td className="p-6 relative text-left">
                      <button
                        onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                        className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      >
                        <MoreVertical size={18} />
                      </button>

                      <AnimatePresence>
                        {activeMenu === user.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                            <MotionDiv
                              initial={{ opacity: 0, scale: 0.9, x: -10 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.9, x: -10 }}
                              className="absolute left-12 top-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden"
                            >
                              {user?.role !== 'admin' && (
                                <button
                                  onClick={() => handleChangeRole(user.id, user.role)}
                                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 text-slate-300 text-xs font-bold transition-all"
                                >
                                  {user?.role === 'customer' ? 'ترقية إلى تاجر' : 'خفض إلى عميل'}
                                  <ArrowLeftRight size={14} className="text-[#00E5FF]" />
                                </button>
                              )}
                              {user?.role !== 'admin' && (
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 text-red-400 text-xs font-bold transition-all border-t border-white/5"
                                >
                                  حذف نهائي
                                  <Trash2 size={14} />
                                </button>
                              )}
                              {user?.role === 'admin' && (
                                <div className="p-4 text-slate-500 text-xs font-bold flex items-center gap-2">
                                  <Shield size={14} /> لا يمكن تعديل الأدمن
                                </div>
                              )}
                            </MotionDiv>
                          </>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <span className="text-slate-500 text-xs font-bold">
              صفحة {page + 1} من {totalPages} ({filteredUsers.length} مستخدم)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-200 text-xs font-black disabled:opacity-40"
              >
                السابق
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-200 text-xs font-black disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
