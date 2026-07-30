import React, { useEffect, useState, useCallback } from 'react';
import { UserCog, Plus, Search, Loader2, Users, Mail, Phone, Clock } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { useTranslation } from 'react-i18next';

type Employee = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
};

type Props = {
  shopId: string;
  shop: any;
};

const EmployeesTab: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const { addToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadEmployees = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const data = await ApiService.getEmployees(shopId);
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const filtered = employees.filter((emp) => {
    const raw = search.trim().toLowerCase();
    if (!raw) return true;
    return (
      String(emp.name || '').toLowerCase().includes(raw) ||
      String(emp.email || '').toLowerCase().includes(raw) ||
      String(emp.role || '').toLowerCase().includes(raw)
    );
  });

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-slate-400" />
            {isArabic ? 'إدارة الموظفين' : 'Employee Management'}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {isArabic ? 'إدارة بيانات الموظفين والأدوار' : 'Manage employee records and roles'}
          </p>
        </div>
        <button
          onClick={() => addToast(isArabic ? 'قريباً' : 'Coming soon', 'info')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
        >
          <Plus className="w-4 h-4" />
          {isArabic ? 'إضافة موظف' : 'Add Employee'}
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isArabic ? 'بحث عن موظف...' : 'Search employees...'}
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <p className="font-bold text-slate-400 text-sm">
            {isArabic ? 'لا يوجد موظفون بعد' : 'No employees yet'}
          </p>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            {isArabic ? 'ابدأ بإضافة موظفين لإدارتهم' : 'Start by adding employees to manage them'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <UserCog className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{emp.name}</h3>
                  {emp.role && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-50 text-xs font-semibold text-slate-500">
                      {emp.role}
                    </span>
                  )}
                  {emp.email && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-semibold">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  )}
                  {emp.phone && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-semibold">
                      <Phone className="w-3 h-3" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeesTab;
