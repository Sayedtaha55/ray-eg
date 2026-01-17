
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Save, Layout, Palette, Check, 
  Monitor, Smartphone, X, 
  Sliders, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components';

const MotionDiv = motion.div as any;

const DEFAULT_PAGE_DESIGN = {
  primaryColor: '#00E5FF',
  layout: 'modern',
  bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
  headerType: 'centered',
};

const PageBuilder: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addToast } = useToast();
  const [shopId, setShopId] = useState<string>('');
  const [config, setConfig] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [showSettingsMobile, setShowSettingsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const loadCurrentDesign = async () => {
      const savedUser = localStorage.getItem('ray_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setShopId(user.shopId);
        try {
          const myShop = await ApiService.getMyShop();
          if (myShop && myShop.pageDesign) {
            setConfig(myShop.pageDesign);
          } else {
            setConfig(DEFAULT_PAGE_DESIGN);
          }
        } catch {
          setConfig(DEFAULT_PAGE_DESIGN);
        }
      }
    };
    loadCurrentDesign();
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const apply = () => setIsDesktop(mql.matches);
    apply();

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }

    const legacyMql = mql as any;
    if (typeof legacyMql.addListener === 'function') legacyMql.addListener(apply);
    return () => {
      if (typeof legacyMql.removeListener === 'function') legacyMql.removeListener(apply);
    };
  }, []);

  const handleSave = async () => {
    if (!shopId) return;
    setIsSaving(true);
    try {
      // حفظ دائم في قاعدة البيانات
      await ApiService.updateShopDesign(shopId, config);
      setIsSaving(false);
      setSaveSuccess(true);
      addToast('تم حفظ تصميم المتجر بنجاح!', 'success');
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      setIsSaving(false);
      addToast('فشل حفظ التصميم، حاول مرة أخرى', 'error');
    }
  };

  if (!config) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00E5FF]" /></div>;

  return (
    <div className="fixed inset-0 z-[200] bg-[#F8F9FA] flex flex-col md:flex-row-reverse text-right font-sans overflow-hidden" dir="rtl">
      
      {/* Control Sidebar */}
      <AnimatePresence>
        {(showSettingsMobile || isDesktop) && (
          <>
            <MotionDiv 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSettingsMobile(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[220] md:hidden"
            />
            
            <MotionDiv 
              initial={!isDesktop ? { y: '100%' } : { x: '100%' }}
              animate={!isDesktop ? { y: 0 } : { x: 0 }}
              exit={!isDesktop ? { y: '100%' } : { x: '100%' }}
              className="fixed bottom-0 left-0 right-0 md:relative md:w-[400px] lg:w-[450px] h-[80vh] md:h-full bg-white md:border-l border-slate-200 flex flex-col shadow-2xl z-[230] rounded-t-[2.5rem] md:rounded-none"
            >
              <header className="p-6 md:p-10 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xl z-30">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowSettingsMobile(false)} className="md:hidden p-2 bg-slate-50 rounded-full"><X size={20} /></button>
                  <h2 className="font-black text-xl md:text-3xl tracking-tighter">التصميم</h2>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-[2rem] font-black text-xs md:text-sm transition-all flex items-center gap-2 ${
                    saveSuccess ? 'bg-green-500 text-white' : 'bg-slate-900 text-white shadow-xl'
                  }`}
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : saveSuccess ? <Check size={16} /> : <Save size={16} />}
                  <span>{saveSuccess ? 'تم الحفظ' : 'حفظ التصميم'}</span>
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 md:space-y-16">
                {/* Color Customization */}
                <section>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex-row-reverse justify-end">
                    الألوان <Palette size={14} className="text-[#00E5FF]" />
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {['#1A1A1A', '#00E5FF', '#BD00FF', '#FF0055', '#FFCC00', '#00FF77', '#0077FF', '#FF6600', '#7C3AED', '#EC4899'].map(color => (
                      <button 
                        key={color}
                        onClick={() => setConfig({ ...config, primaryColor: color })}
                        className={`aspect-square rounded-xl border-2 transition-all relative ${config.primaryColor === color ? 'scale-110 shadow-lg border-white ring-2 ring-slate-200' : 'border-transparent opacity-60'}`}
                        style={{ backgroundColor: color }}
                      >
                        {config.primaryColor === color && <Check className="w-4 h-4 text-white mx-auto" />}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Layout Configuration */}
                <section>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex-row-reverse justify-end">
                    النمط <Layout size={14} className="text-[#BD00FF]" />
                  </label>
                  <div className="space-y-3">
                    {[
                      { id: 'minimal', label: 'بسيط' },
                      { id: 'modern', label: 'عصري' },
                      { id: 'bold', label: 'جريء' }
                    ].map(item => (
                      <button 
                        key={item.id}
                        onClick={() => setConfig({ ...config, layout: item.id as any })}
                        className={`w-full p-4 rounded-2xl border-2 text-right transition-all ${config.layout === item.id ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white'}`}
                      >
                        <p className="font-black text-sm">{item.label}</p>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>

      {/* Live Preview */}
      <main className="flex-1 flex flex-col relative bg-[#F1F3F5] overflow-hidden">
        <header className="h-20 md:h-24 bg-white/60 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 md:px-12 sticky top-0 z-10">
           <button onClick={onClose} className="p-3 bg-white rounded-xl shadow-sm text-slate-900"><ChevronLeft className="rotate-180" /></button>
           
           <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-inner border border-slate-100">
              <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Monitor size={18} /></button>
              <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Smartphone size={18} /></button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-20 flex items-start justify-center">
          <MotionDiv 
            layout
            className={`bg-white shadow-2xl overflow-hidden transition-all duration-700 flex flex-col ${
              previewMode === 'mobile' ? 'w-full max-w-[375px] min-h-[667px] rounded-[3rem] border-[10px] border-slate-900 box-border' : 'w-full max-w-5xl rounded-[3rem]'
            }`}
          >
            <div className="h-40 md:h-64 relative shrink-0">
               <img src={config.bannerUrl} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent" />
            </div>
            
            <div className={`p-8 -mt-16 relative flex flex-col items-center text-center gap-6`}>
               <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2.5rem] shadow-xl p-2 border border-slate-50">
                  <div className="w-full h-full bg-slate-50 rounded-[2rem] flex items-center justify-center font-black text-slate-200 border-2 border-dashed border-slate-100 overflow-hidden text-[8px]">LOGO</div>
               </div>
               <div className="space-y-2">
                  <h1 className="text-2xl md:text-4xl font-black" style={{ color: config.primaryColor }}>معاينة المتجر</h1>
                  <p className="text-slate-400 font-bold text-xs">القاهرة، مصر</p>
               </div>
               <button className="px-10 py-4 rounded-2xl text-white font-black text-sm shadow-xl" style={{ backgroundColor: config.primaryColor }}>متابعة</button>
               
               <div className="w-full mt-10 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                      <div key={i} className={`p-3 rounded-2xl border ${config.layout === 'bold' ? 'border-2' : 'border-transparent'}`} style={{ borderColor: config.layout === 'bold' ? config.primaryColor + '22' : 'transparent' }}>
                        <div className="aspect-square bg-slate-100 rounded-xl mb-2" />
                        <div className="h-3 w-1/2 bg-slate-100 rounded-full mx-auto" />
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </MotionDiv>
        </div>

        <button 
          onClick={() => setShowSettingsMobile(true)}
          className="md:hidden fixed bottom-6 left-6 w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl z-[210] active:scale-90 transition-transform"
        >
           <Sliders size={24} />
        </button>
      </main>
    </div>
  );
};

export default PageBuilder;
