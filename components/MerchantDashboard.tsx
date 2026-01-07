
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Zap, Loader2, Sparkles, Eye, 
  Package, CalendarCheck, Settings, Smartphone, Palette, 
  Plus, Edit3, Save, ArrowUpRight, DollarSign, Users, ShoppingCart, 
  FileText, CreditCard, ChevronLeft, Menu, TrendingUp, Image as ImageIcon, Bell, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RayDB } from '../constants';
import { ApiService } from '../services/api.service';
import * as ReactRouterDOM from 'react-router-dom';
import { Product, Reservation } from '../types';
import POSSystem from './POSSystem';
import PageBuilder from './PageBuilder';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const { useSearchParams, useNavigate } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

type TabType = 'overview' | 'pos' | 'builder' | 'products' | 'reservations' | 'sales' | 'reports' | 'growth' | 'settings';

const MerchantDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabType) || 'overview';
  const [currentShop, setCurrentShop] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [dbData, setDbData] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();

  const syncData = async () => {
    const savedUserStr = localStorage.getItem('ray_user');
    if (!savedUserStr) {
      navigate('/login');
      return;
    }
    const savedUser = JSON.parse(savedUserStr);
    if (savedUser.role !== 'merchant') {
      navigate('/');
      return;
    }

    // جلب البيانات من Supabase/Bridge
    const shops = await RayDB.getShops();
    const myShop = shops.find((s: any) => s.id === savedUser.shopId) || shops[0];
    setCurrentShop(myShop);
    
    const products = await RayDB.getProducts();
    const res = await RayDB.getReservations();
    const sales = await ApiService.getAllOrders();
    const notifs = await ApiService.getNotifications(myShop.id);

    setDbData({ products, reservations: res, sales });
    setNotifications(notifs.slice(0, 5));
    setAnalytics(RayDB.getAnalytics(myShop.id));
  };

  useEffect(() => {
    syncData();
    const handleNewNotif = () => syncData();
    window.addEventListener('ray-db-update', syncData);
    window.addEventListener('new-notification', handleNewNotif);
    return () => {
      window.removeEventListener('ray-db-update', syncData);
      window.removeEventListener('new-notification', handleNewNotif);
    };
  }, [navigate]);

  if (!currentShop || !dbData || !analytics) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00E5FF] w-12 h-12" /></div>;

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return <OverviewTab shop={currentShop} analytics={analytics} notifications={notifications} />;
      case 'products': return <ProductsTab products={dbData.products.filter((p: any) => p.shopId === currentShop.id || p.shop_id === currentShop.id)} onAdd={() => setShowProductModal(true)} />;
      case 'reservations': return <ReservationsTab reservations={dbData.reservations} />;
      case 'sales': return <SalesTab sales={dbData.sales} />;
      case 'growth': return <GrowthTab shop={currentShop} analytics={analytics} />;
      case 'settings': return <SettingsTab shop={currentShop} />;
      default: return <OverviewTab shop={currentShop} analytics={analytics} notifications={notifications} />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-12 text-right pb-32 px-4 md:px-6 font-sans" dir="rtl">
      {/* Header Card */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10 mt-4 md:mt-0">
        <div className="flex items-center gap-4 md:gap-6 flex-row-reverse">
          <img src={currentShop.logoUrl || currentShop.logo_url} className="w-14 h-14 md:w-20 md:h-20 rounded-2xl object-cover border border-slate-50 shadow-sm" alt="logo" />
          <div className="text-right">
            <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{currentShop.name}</h1>
            <p className="text-slate-400 font-bold text-xs md:text-sm">إدارة النشاط التجاري • {currentShop.city}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:flex gap-2 md:gap-3">
           <button onClick={() => setSearchParams({ tab: 'pos' })} className="flex items-center justify-center gap-2 px-4 py-4 md:px-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] md:text-xs hover:scale-105 transition-all">
             <Smartphone size={16} /> الكاشير
           </button>
           <button onClick={() => setSearchParams({ tab: 'builder' })} className="flex items-center justify-center gap-2 px-4 py-4 md:px-6 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] md:text-xs hover:bg-slate-50 transition-all">
             <Palette size={16} /> الهوية
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100/50 backdrop-blur-md rounded-2xl md:rounded-[2rem] border border-slate-100 overflow-x-auto no-scrollbar sticky top-20 md:top-24 z-30 shadow-sm">
        <TabButton active={activeTab === 'overview'} onClick={() => setSearchParams({ tab: 'overview' })} icon={<TrendingUp size={16} />} label="نظرة عامة" />
        <TabButton active={activeTab === 'sales'} onClick={() => setSearchParams({ tab: 'sales' })} icon={<CreditCard size={16} />} label="المبيعات" />
        <TabButton active={activeTab === 'reservations'} onClick={() => setSearchParams({ tab: 'reservations' })} icon={<CalendarCheck size={16} />} label="الحجوزات" />
        <TabButton active={activeTab === 'products'} onClick={() => setSearchParams({ tab: 'products' })} icon={<Package size={16} />} label="المنتجات" />
        <TabButton active={activeTab === 'growth'} onClick={() => setSearchParams({ tab: 'growth' })} icon={<Zap size={16} />} label="مركز النمو" />
        <TabButton active={activeTab === 'settings'} onClick={() => setSearchParams({ tab: 'settings' })} icon={<Settings size={16} />} label="الإعدادات" />
      </div>

      <AnimatePresence mode="wait">
        <MotionDiv key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {activeTab === 'pos' ? <POSSystem onClose={() => setSearchParams({ tab: 'overview' })} /> : 
           activeTab === 'builder' ? <PageBuilder onClose={() => setSearchParams({ tab: 'overview' })} /> : 
           renderContent()}
        </MotionDiv>
      </AnimatePresence>

      <AddProductModal isOpen={showProductModal} onClose={() => setShowProductModal(false)} shopId={currentShop.id} />
    </div>
  );
};

// --- Sub-components Optimized ---

const OverviewTab: React.FC<{shop: any, analytics: any, notifications: any[]}> = ({shop, analytics, notifications}) => (
  <div className="space-y-6 md:space-y-12">
    {/* Stats */}
    <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto no-scrollbar pb-2">
      <div className="min-w-[160px] flex-1">
        <StatCard label="المتابعين" value={shop.followers?.toLocaleString() || '0'} icon={<Users />} color="cyan" />
      </div>
      <div className="min-w-[160px] flex-1">
        <StatCard label="الزيارات" value={shop.visitors?.toLocaleString() || '0'} icon={<Eye />} color="cyan" />
      </div>
      <div className="min-w-[160px] flex-1">
        <StatCard label="مبيعات اليوم" value={`${analytics.salesCountToday}`} icon={<ShoppingCart />} color="slate" />
      </div>
      <div className="min-w-[160px] flex-1">
        <StatCard label="إيرادات اليوم" value={`ج.م ${analytics.revenueToday}`} icon={<DollarSign size={20} />} color="cyan" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
       {/* Chart */}
       <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8 flex-row-reverse">
             <h3 className="text-lg md:text-xl font-black">أداء المبيعات</h3>
             <div className="flex items-center gap-2 text-green-500 font-black text-[10px] md:text-xs">
                <ArrowUpRight size={14} /> +١٢.٥٪ نمو
             </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', direction: 'rtl' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#00E5FF" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
       </div>

       {/* Notifications Section */}
       <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6 flex-row-reverse">
            <h3 className="text-lg md:text-xl font-black">أحدث التنبيهات</h3>
            <Bell size={18} className="text-[#00E5FF]" />
          </div>
          <div className="space-y-4 md:space-y-6 flex-1 overflow-y-auto no-scrollbar max-h-[400px]">
             {notifications.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <Bell size={32} className="opacity-20 mb-2" />
                  <p className="text-xs font-bold">لا يوجد نشاط مؤخراً</p>
               </div>
             ) : (
               notifications.map(n => (
                 <ActivityItem key={n.id} n={n} />
               ))
             )}
          </div>
          <button className="mt-6 w-full py-4 bg-slate-50 text-slate-400 rounded-xl font-black text-xs hover:bg-slate-100 transition-all">مشاهدة الكل</button>
       </div>
    </div>
  </div>
);

// Fix: ActivityItem defined as React.FC to allow 'key' prop in mapping
const ActivityItem: React.FC<{n: any}> = ({n}) => (
  <div className={`flex items-center gap-3 flex-row-reverse border-b border-slate-50 pb-4 ${!n.is_read ? 'bg-cyan-50/30 -mx-4 px-4 py-2 rounded-xl' : ''}`}>
     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
       n.type === 'sale' ? 'bg-green-100 text-green-600' : 
       n.type === 'reservation' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
     }`}>
        {n.type === 'sale' ? <ShoppingCart size={16} /> : n.type === 'reservation' ? <CalendarCheck size={16} /> : <Users size={16} />}
     </div>
     <div className="flex-1 text-right">
        <p className="font-black text-xs md:text-sm text-slate-900 leading-none mb-1">{n.title}</p>
        <p className="text-[10px] text-slate-500 font-bold mb-1 truncate">{n.message}</p>
        <div className="flex items-center justify-end gap-1 text-[8px] text-slate-400 font-black">
          <Clock size={10} /> {new Date(n.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
        </div>
     </div>
  </div>
);

const ProductsTab: React.FC<{products: Product[], onAdd: () => void}> = ({products, onAdd}) => (
  <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-8 flex-row-reverse">
       <h3 className="text-xl md:text-2xl font-black">المنتجات</h3>
       <button onClick={onAdd} className="px-5 py-3 bg-slate-900 text-white rounded-xl font-black text-xs flex items-center gap-2 hover:bg-black transition-all">
         <Plus size={16} /> إضافة منتج
       </button>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
       {products.length === 0 ? (
         <div className="col-span-full py-16 text-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-[2rem]">ابدأ بإضافة أول منتج لمتجرك</div>
       ) : (
         products.map(p => <ProductItem key={p.id} product={p} />)
       )}
    </div>
  </div>
);

const ProductItem: React.FC<{product: Product}> = ({product}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stock, setStock] = useState(product.stock);

  const handleUpdate = async () => {
    await RayDB.updateProductStock(product.id, stock);
    setIsEditing(false);
  };

  return (
    <div className="group p-3 md:p-4 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] border border-transparent hover:border-[#00E5FF] transition-all text-right relative">
      <div className="aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-4 bg-white shadow-inner">
        <img src={product.imageUrl} className="w-full h-full object-cover" />
      </div>
      <h4 className="font-black text-sm md:text-base mb-1 truncate">{product.name}</h4>
      <p className="text-[#00E5FF] font-black text-xs md:text-sm">ج.م {product.price}</p>
      
      <div className="flex flex-col gap-2 mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">المخزون</span>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input type="number" value={stock} onChange={(e) => setStock(parseInt(e.target.value) || 0)} className="w-12 px-2 py-1 bg-white border border-[#00E5FF] rounded-lg text-[10px] font-black outline-none" autoFocus />
              <button onClick={handleUpdate} className="p-1 bg-[#00E5FF] text-white rounded-lg"><Save size={12} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black ${product.stock < 5 ? 'text-red-500' : 'text-slate-900'}`}>{product.stock}</span>
              <button onClick={() => setIsEditing(true)} className="p-1 text-slate-300 hover:text-[#00E5FF]"><Edit3 size={12} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AddProductModal: React.FC<{ isOpen: boolean, onClose: () => void, shopId: string }> = ({ isOpen, onClose, shopId }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [discount, setDiscount] = useState('0');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const url = await ApiService.uploadImage(file);
        setImage(url);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    const newProduct = { 
      id: `p-${Date.now()}`, 
      shopId, 
      name, 
      price: Number(price), 
      stock: Number(stock), 
      imageUrl: image 
    };
    await RayDB.addProduct(newProduct, Number(discount));
    setLoading(false);
    onClose();
    setName(''); setPrice(''); setStock(''); setDiscount('0'); setImage(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <MotionDiv initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-6 md:p-10 text-right shadow-2xl overflow-y-auto max-h-[90vh]" dir="rtl">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 justify-end">إضافة منتج <Plus className="text-[#00E5FF]" /></h2>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video rounded-3xl border-4 border-dashed border-slate-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50 hover:bg-slate-100 transition-all">
                  {image ? <img src={image} className="w-full h-full object-cover" /> : (
                    <div className="text-center text-slate-300">
                      {loading ? <Loader2 className="animate-spin mx-auto" size={32} /> : <ImageIcon size={32} className="mx-auto mb-2" />}
                      <p className="font-black text-[10px]">رفع صورة المنتج</p>
                    </div>
                  )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={name} onChange={e => setName(e.target.value)} className="bg-slate-50 rounded-xl p-4 font-bold outline-none border-none text-right text-sm" placeholder="اسم المنتج" />
                <input required type="number" value={stock} onChange={e => setStock(e.target.value)} className="bg-slate-50 rounded-xl p-4 font-bold outline-none border-none text-right text-sm" placeholder="المخزون" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="bg-slate-50 rounded-xl p-4 font-bold outline-none border-none text-right text-sm" placeholder="السعر" />
                <input required type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="bg-slate-50 rounded-xl p-4 font-bold outline-none border-none text-right text-sm" placeholder="الخصم %" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-base hover:bg-black transition-all shadow-xl">تأكيد النشر</button>
            </form>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};

const GrowthTab: React.FC<{shop: any, analytics: any}> = ({shop, analytics}) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true); setInsight('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `أنا مساعد "تست" الذكي للأعمال. محل "${shop.name}" لديه إحصائيات كالتالي: مبيعات ج.م ${analytics.totalRevenue}، زيارات ${shop.visitors}، متابعين ${shop.followers}. قدم تحليل نمو احترافي ومختصر جداً بلهجة مصرية ذكية وقدم اقتراحاً واحداً لزيادة المبيعات.`,
        config: { thinkingConfig: { thinkingBudget: 4000 } }
      });
      setInsight(response.text || '');
    } catch (e) { setInsight('لم نتمكن من تحليل البيانات حالياً، يرجى المحاولة لاحقاً.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white text-right relative overflow-hidden group border border-white/5 shadow-2xl">
         <div className="absolute top-0 left-0 p-10 md:p-20 opacity-10 pointer-events-none">
            <Zap size={150} className="text-[#00E5FF] animate-pulse" />
         </div>
         <Zap className="w-10 h-10 md:w-16 md:h-16 text-[#00E5FF] mb-6" />
         <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tighter">ذكاء تست <br/><span className="text-[#00E5FF]">لمشروعك.</span></h2>
         <p className="text-slate-400 font-bold mb-8 max-w-sm text-sm md:text-base">اضغط للحصول على تحليل فوري لمتجرك باستخدام Gemini لمساعدتك في اتخاذ القرار.</p>
         <button onClick={generateInsight} disabled={loading} className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-black rounded-2xl font-black text-sm md:text-lg hover:bg-[#00E5FF] transition-all flex items-center justify-center gap-3 shadow-2xl relative z-10">
           {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="text-[#BD00FF]" />}
           {loading ? 'جاري التحليل...' : 'تحليل الأداء بالذكاء الاصطناعي'}
         </button>
      </div>
      <AnimatePresence>
        {insight && (
          <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl text-right">
             <div className="text-sm md:text-lg font-bold text-slate-700 leading-relaxed whitespace-pre-wrap flex gap-3 md:gap-4">
                <Sparkles className="text-[#00E5FF] shrink-0 mt-1" size={20} />
                <span>{insight}</span>
             </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

const ReservationsTab: React.FC<{reservations: Reservation[]}> = ({reservations}) => (
  <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm text-right">
     <h3 className="text-xl md:text-2xl font-black mb-8">حجوزات العملاء</h3>
     <div className="space-y-4">
        {reservations.length === 0 ? <p className="text-slate-300 py-10 text-center font-bold">لا توجد حجوزات نشطة.</p> : 
          reservations.map(res => (
            <div key={res.id} className="p-4 md:p-6 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl">
               <div className="flex items-center gap-4 flex-row-reverse">
                  <img src={res.itemImage} className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover shadow-sm" />
                  <div className="text-right">
                    <p className="font-black text-sm md:text-lg">{res.itemName}</p>
                    <p className="text-[10px] md:text-xs font-bold text-slate-500">{res.customerName} • {res.customerPhone}</p>
                  </div>
               </div>
               <div className="flex justify-between md:block">
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase">انتظار</span>
                  <p className="md:hidden font-black text-sm">ج.م {res.itemPrice}</p>
               </div>
            </div>
          ))
        }
     </div>
  </div>
);

const SalesTab: React.FC<{sales: any[]}> = ({sales}) => (
  <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm text-right">
    <div className="flex items-center justify-between mb-8 flex-row-reverse">
       <h3 className="text-xl md:text-2xl font-black">سجل المبيعات</h3>
       <button className="text-slate-400 font-bold text-[10px] md:text-xs flex items-center gap-2 hover:text-slate-900 transition-colors">
         <FileText size={16} /> تصدير PDF
       </button>
    </div>
    <div className="space-y-3">
       {sales.length === 0 ? <p className="text-slate-300 py-10 text-center font-bold">لم يتم تسجيل مبيعات.</p> : 
         sales.map(sale => (
           <div key={sale.id} className="p-4 md:p-6 bg-slate-50 rounded-2xl flex items-center justify-between flex-row-reverse transition-all hover:bg-white hover:shadow-md">
              <div className="text-right">
                 <p className="font-black text-sm md:text-lg">فاتورة #{sale.id.slice(-6)}</p>
                 <p className="text-slate-400 font-bold text-[9px] md:text-[10px]">{new Date(sale.created_at || sale.createdAt).toLocaleDateString('ar-EG')}</p>
              </div>
              <p className="font-black text-slate-900 text-base md:text-2xl">ج.م {sale.total.toLocaleString()}</p>
           </div>
         ))
       }
    </div>
  </div>
);

const SettingsTab: React.FC<{shop: any}> = ({shop}) => (
  <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm text-right">
     <h3 className="text-xl md:text-2xl font-black mb-8">إعدادات الحساب</h3>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">اسم المحل</label>
           <input className="w-full bg-slate-50 rounded-xl py-4 px-6 font-bold text-right outline-none border-none text-sm" defaultValue={shop.name} />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">المحافظة</label>
           <input className="w-full bg-slate-50 rounded-xl py-4 px-6 font-bold text-right outline-none border-none text-sm" defaultValue={shop.governorate} />
        </div>
     </div>
     <button className="mt-8 md:mt-10 px-10 md:px-12 py-4 md:py-5 bg-slate-900 text-white rounded-2xl font-black text-sm md:text-base hover:bg-black transition-all shadow-xl w-full md:w-auto">حفظ التعديلات</button>
  </div>
);

const StatCard: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-50 shadow-sm text-right group hover:shadow-md transition-all h-full">
    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl mb-4 md:mb-6 ${color === 'cyan' ? 'bg-cyan-50 text-[#00E5FF]' : 'bg-slate-50 text-slate-400'}`}>
      {icon}
    </div>
    <span className="text-slate-400 font-black text-[8px] md:text-[9px] uppercase block tracking-widest mb-1">{label}</span>
    <span className="text-xl md:text-3xl font-black tracking-tighter truncate block">{value}</span>
  </div>
);

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs transition-all whitespace-nowrap ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-white'}`}>
    {icon} <span>{label}</span>
  </button>
);

export default MerchantDashboard;
