
import React, { useState, useEffect } from 'react';
import { Users, Search, MoreVertical, Shield, User, Trash2, ShieldCheck, ArrowLeftRight, Loader2, X } from 'lucide-react';
import { ApiService } from '../services/api.service';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './Toaster';

const MotionDiv = motion.div as any;

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getAllUsers();
      setUsers(data);
    } catch (e) {
      addToast('فشل تحميل قائمة المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب نهائياً؟')) return;
    try {
      await ApiService.deleteUser(userId);
      addToast('تم حذف المستخدم بنجاح', 'success');
      loadUsers();
    } catch (e) {
      addToast('فشل حذف المستخدم', 'error');
    }
    setActiveMenu(null);
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'customer' ? 'merchant' : 'customer';
    try {
      await ApiService.updateUserRole(userId, newRole);
      addToast(`تم تغيير دور المستخدم إلى ${newRole === 'merchant' ? 'تاجر' : 'عميل'}`, 'success');
      loadUsers();
    } catch (e) {
      addToast('فشل تغيير الصلاحيات', 'error');
    }
    setActiveMenu(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">إدارة المستخدمين</h2>
            <p className="text-slate-500 text-sm font-bold">عرض وإدارة صلاحيات كافة أعضاء المنصة.</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm" placeholder="ابحث عن مستخدم..." />
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">المستخدم</th>
                <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">نوع الحساب</th>
                <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">البريد الإلكتروني</th>
                <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">التحكم</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-[#00E5FF]">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-white font-bold">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                      user.role === 'admin' ? 'bg-red-500/10 text-red-500' : 
                      user.role === 'merchant' ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {user.role === 'admin' ? 'مدير' : user.role === 'merchant' ? 'تاجر' : 'عميل'}
                    </span>
                  </td>
                  <td className="p-6 text-slate-500 text-sm">{user.email}</td>
                  <td className="p-6 relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                      className="p-2 text-slate-500 hover:text-white transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    <AnimatePresence>
                      {activeMenu === user.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                          <MotionDiv
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="absolute left-0 top-full mt-2 w-48 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden"
                          >
                            <button 
                              onClick={() => handleChangeRole(user.id, user.role)}
                              className="w-full flex items-center justify-between p-4 hover:bg-white/5 text-slate-300 text-xs font-bold transition-all"
                            >
                              تغيير الدور <ArrowLeftRight size={14} className="text-[#00E5FF]" />
                            </button>
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 text-red-400 text-xs font-bold transition-all border-t border-white/5"
                            >
                              حذف المستخدم <Trash2 size={14} />
                            </button>
                          </MotionDiv>
                        </>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
