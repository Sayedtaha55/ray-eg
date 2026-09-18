'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  ChevronRight,
  Home,
  Briefcase
} from 'lucide-react';
import { api, clearStoredAuthToken, getStoredAuthToken } from '@/lib/api';

interface Address {
  id: string;
  label: string;
  governorate: string;
  city: string;
  street: string;
  building?: string;
  phone: string;
  isDefault?: boolean;
}

export default function ProfileAddressesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr_1',
      label: 'المنزل',
      governorate: 'القاهرة',
      city: 'مدينة نصر',
      street: 'شارع عباس العقاد',
      building: 'عمارة 14 - الدور 3',
      phone: '01012345678',
      isDefault: true,
    }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'المنزل',
    governorate: 'القاهرة',
    city: '',
    street: '',
    building: '',
    phone: '',
  });

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const userData = await api.get('/auth/me');
        setUser((userData as any)?.user ?? (userData as any)?.data?.user ?? userData);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = () => {
    clearStoredAuthToken();
    router.push('/');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.city || !newAddr.street || !newAddr.phone) return;
    const item: Address = {
      id: `addr_${Date.now()}`,
      ...newAddr,
      isDefault: addresses.length === 0,
    };
    setAddresses([...addresses, item]);
    setShowAddModal(false);
    setNewAddr({ label: 'المنزل', governorate: 'القاهرة', city: '', street: '', building: '', phone: '' });
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-brand-black text-white py-8 px-4 md:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-brand-cyan/20 rounded-xl flex items-center justify-center">
              <User className="w-10 h-10 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name || 'مستخدم'}</h1>
              <p className="text-white/60 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <nav className="space-y-2">
                <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors">
                  <User className="w-5 h-5" />
                  <span>الملف الشخصي</span>
                  <ChevronRight className="w-4 h-4 mr-auto" />
                </Link>
                <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                  <span>طلباتي</span>
                  <ChevronRight className="w-4 h-4 mr-auto" />
                </Link>
                <Link href="/profile/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>المفضلة</span>
                  <ChevronRight className="w-4 h-4 mr-auto" />
                </Link>
                <Link href="/profile/addresses" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-brand-cyan/10 text-brand-cyan font-semibold">
                  <MapPin className="w-5 h-5" />
                  <span>العناوين</span>
                </Link>
                <Link href="/profile/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>الإعدادات</span>
                  <ChevronRight className="w-4 h-4 mr-auto" />
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 font-semibold transition-colors mt-4">
                  <LogOut className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">عناوين التوصيل</h2>
                  <p className="text-sm text-slate-500 mt-1">إدارة عناوين الشحن والتوصيل لطلباتك</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-cyan text-black font-bold text-xs hover:bg-brand-cyan/90 transition-colors"
                >
                  <Plus className="w-4 h-4" /> إضافة عنوان جديد
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative bg-slate-50/50 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 font-bold text-sm text-slate-800 dark:text-slate-200">
                        {addr.label === 'العمل' ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan">افتراضي</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">{addr.governorate} - {addr.city}</p>
                    <p className="text-xs text-slate-500 mb-2">{addr.street} {addr.building && `، ${addr.building}`}</p>
                    <p className="text-xs text-slate-400 font-mono" dir="ltr">{addr.phone}</p>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="absolute top-4 left-4 text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal for adding address */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                  <h3 className="text-lg font-bold mb-4">إضافة عنوان توصيل جديد</h3>
                  <form onSubmit={handleAddAddress} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">النوع</label>
                      <select
                        value={newAddr.label}
                        onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      >
                        <option value="المنزل">المنزل</option>
                        <option value="العمل">العمل</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">المحافظة</label>
                        <input
                          type="text"
                          value={newAddr.governorate}
                          onChange={(e) => setNewAddr({ ...newAddr, governorate: e.target.value })}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">المدينة / الحي</label>
                        <input
                          type="text"
                          value={newAddr.city}
                          onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                          placeholder="مثال: المعادي"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">الشارع</label>
                      <input
                        type="text"
                        value={newAddr.street}
                        onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">رقم المبنى والشقة</label>
                      <input
                        type="text"
                        value={newAddr.building}
                        onChange={(e) => setNewAddr({ ...newAddr, building: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">رقم الهاتف للتوصيل</label>
                      <input
                        type="tel"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                        dir="ltr"
                        placeholder="010xxxxxxxx"
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl bg-brand-cyan text-black font-bold text-xs"
                      >
                        حفظ العنوان
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

