
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
  secondaryColor: '#BD00FF',
  layout: 'modern',
  bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
  headerType: 'centered',
  pageBackgroundColor: '#FFFFFF',
  productDisplay: 'cards',
  // Typography
  headingSize: 'text-4xl',
  textSize: 'text-sm',
  fontWeight: 'font-black',
  // Buttons
  buttonShape: 'rounded-2xl',
  buttonPadding: 'px-6 py-3',
  buttonHover: 'bg-slate-900',
  // Spacing
  pagePadding: 'p-6 md:p-12',
  itemGap: 'gap-4 md:gap-6',
};

interface ShopDesign {
  primaryColor: string;
  secondaryColor: string;
  layout: string;
  bannerUrl: string;
  headerType: string;
  pageBackgroundColor: string;
  backgroundColor?: string;
  productDisplay: string;
  productDisplayStyle?: string;
  headingSize: string;
  textSize: string;
  fontWeight: string;
  buttonShape: string;
  buttonPadding: string;
  buttonHover: string;
  pagePadding: string;
  itemGap: string;
}

const PageBuilder: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addToast } = useToast();
  const [shopId, setShopId] = useState<string>('');
  const [config, setConfig] = useState<ShopDesign>(DEFAULT_PAGE_DESIGN);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [openSection, setOpenSection] = useState('colors');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSettingsMobile, setShowSettingsMobile] = useState(false);

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
    setSaving(true);
    try {
      // حفظ دائم في قاعدة البيانات
      const normalized = {
        ...config,
        pageBackgroundColor: config.pageBackgroundColor || config.backgroundColor,
        backgroundColor: config.backgroundColor || config.pageBackgroundColor,
        productDisplay: config.productDisplay || (config.productDisplayStyle === 'list' ? 'list' : undefined),
        productDisplayStyle: config.productDisplayStyle || (config.productDisplay === 'list' ? 'list' : undefined),
      };
      await ApiService.updateShopDesign(shopId, normalized);
      setSaving(false);
      setSaved(true);
      addToast('تم حفظ تصميم المتجر بنجاح!', 'success');
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaving(false);
      addToast('فشل حفظ التصميم، حاول مرة أخرى', 'error');
    }
  };

  if (!config) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00E5FF]" /></div>;

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? '' : id));
  };

  const Section = ({ id, title, icon, children }: any) => (
    <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full px-5 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2 flex-row-reverse">
          {icon}
          <span className="font-black text-sm">{title}</span>
        </div>
        <ChevronLeft className={`w-5 h-5 transition-transform ${openSection === id ? 'rotate-90' : 'rotate-180'}`} />
      </button>
      <AnimatePresence initial={false}>
        {openSection === id && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 overflow-hidden"
          >
            {children}
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );

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
                  disabled={saving}
                  className={`px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-[2rem] font-black text-xs md:text-sm transition-all flex items-center gap-2 ${
                    saved ? 'bg-green-500 text-white' : 'bg-slate-900 text-white shadow-xl'
                  }`}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                  <span>{saved ? 'تم الحفظ' : 'حفظ التصميم'}</span>
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4">
                <Section id="colors" title="الألوان" icon={<Palette size={16} className="text-[#00E5FF]" />}>
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
                </Section>

                <Section id="background" title="الخلفية" icon={<Palette size={16} className="text-slate-900" />}>
                  <div className="grid grid-cols-5 gap-3">
                    {['#FFFFFF', '#F8FAFC', '#F1F5F9', '#0F172A', '#111827', '#FAFAFA', '#FFF7ED', '#F0FDFA', '#FDF2F8', '#ECFEFF'].map(color => (
                      <button
                        key={color}
                        onClick={() => setConfig({ ...config, pageBackgroundColor: color, backgroundColor: color })}
                        className={`aspect-square rounded-xl border-2 transition-all relative ${(config.pageBackgroundColor || config.backgroundColor) === color ? 'scale-110 shadow-lg border-white ring-2 ring-slate-200' : 'border-transparent opacity-60'}`}
                        style={{ backgroundColor: color }}
                      >
                        {(config.pageBackgroundColor || config.backgroundColor) === color && <Check className="w-4 h-4 text-slate-900 mx-auto" />}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section id="banner" title="صورة البانر" icon={<Layout size={16} className="text-slate-900" />}>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBannerFile(file);
                            const url = URL.createObjectURL(file);
                            setBannerPreview(url);
                            setConfig({ ...config, bannerUrl: url });
                          }
                        }}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label
                        htmlFor="banner-upload"
                        className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold outline-none border border-slate-100 text-right cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-between"
                      >
                        <span className="text-slate-400">
                          {bannerFile ? bannerFile.name : 'اختر صورة أو فيديو من الجهاز'}
                        </span>
                        <Layout size={20} className="text-slate-400" />
                      </label>
                    </div>
                    {(bannerPreview || config.bannerUrl) && (
                      <div className="relative rounded-2xl overflow-hidden bg-slate-100">
                        {bannerFile && bannerFile.type.startsWith('video/') ? (
                          <video
                            src={bannerPreview || config.bannerUrl}
                            className="w-full h-32 object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={bannerPreview || config.bannerUrl}
                            className="w-full h-32 object-cover"
                            alt="Banner preview"
                          />
                        )}
                        <button
                          onClick={() => {
                            setBannerFile(null);
                            setBannerPreview('');
                            setConfig({ ...config, bannerUrl: '' });
                          }}
                          className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </Section>

                <Section id="header" title="الهيدر" icon={<Layout size={16} className="text-[#BD00FF]" />}>
                  <div className="space-y-3">
                    {[
                      { id: 'centered', label: 'في المنتصف' },
                      { id: 'side', label: 'يمين الصفحة' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setConfig({ ...config, headerType: item.id })}
                        className={`w-full p-4 rounded-2xl border-2 text-right transition-all ${String(config.headerType || 'centered') === item.id ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white'}`}
                      >
                        <p className="font-black text-sm">{item.label}</p>
                      </button>
                    ))}
                  </div>
                </Section>

                <Section id="products" title="عرض المعروضات" icon={<Layout size={16} className="text-[#00E5FF]" />}>
                  <div className="space-y-3">
                    {[
                      { id: 'cards', label: 'كروت' },
                      { id: 'list', label: 'قائمة' },
                      { id: 'minimal', label: 'بدون بطاقات' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setConfig({ ...config, productDisplay: item.id, productDisplayStyle: item.id === 'list' ? 'list' : undefined })}
                        className={`w-full p-4 rounded-2xl border-2 text-right transition-all ${(config.productDisplay || (config.productDisplayStyle === 'list' ? 'list' : undefined) || 'cards') === item.id ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white'}`}
                      >
                        <p className="font-black text-sm">{item.label}</p>
                      </button>
                    ))}
                  </div>
                </Section>

                <Section id="layout" title="النمط" icon={<Layout size={16} className="text-[#BD00FF]" />}>
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
                </Section>

                <Section id="typography" title="الخطوط" icon={<Layout size={16} className="text-[#00E5FF]" />}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">حجم العناوين</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'].map(size => (
                          <button
                            key={size}
                            onClick={() => setConfig({ ...config, headingSize: size })}
                            className={`p-3 rounded-xl border text-right transition-all ${config.headingSize === size ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white'}`}
                          >
                            <p className={`font-black ${size}`}>ع</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">حجم النصوص</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'].map(size => (
                          <button
                            key={size}
                            onClick={() => setConfig({ ...config, textSize: size })}
                            className={`p-3 rounded-xl border text-right transition-all ${config.textSize === size ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white'}`}
                          >
                            <p className={`font-black ${size}`}>أ</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">وزن الخط</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['font-bold', 'font-black', 'font-extrabold'].map(weight => (
                          <button
                            key={weight}
                            onClick={() => setConfig({ ...config, fontWeight: weight })}
                            className={`p-3 rounded-xl border text-right transition-all ${config.fontWeight === weight ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white'}`}
                          >
                            <p className={`${weight}`}>ع</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Section>

                <Section id="buttons" title="الأزرار" icon={<Layout size={16} className="text-[#BD00FF]" />}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">شكل الزر</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['rounded-none', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full'].map(shape => (
                          <button
                            key={shape}
                            onClick={() => setConfig({ ...config, buttonShape: shape })}
                            className={`p-3 rounded-xl border text-right transition-all ${config.buttonShape === shape ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white'}`}
                          >
                            <div className={`h-6 bg-slate-900 ${shape}`}></div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">حجم الحشو</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['px-3 py-2', 'px-4 py-2.5', 'px-6 py-3', 'px-8 py-4'].map(padding => (
                          <button
                            key={padding}
                            onClick={() => setConfig({ ...config, buttonPadding: padding })}
                            className={`p-3 rounded-xl border text-right transition-all ${config.buttonPadding === padding ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white'}`}
                          >
                            <p className="font-black text-xs">{padding}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">لون التمرير</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['bg-slate-900', 'bg-black', 'bg-red-600', 'bg-green-600', 'bg-blue-600'].map(hover => (
                          <button
                            key={hover}
                            onClick={() => setConfig({ ...config, buttonHover: hover })}
                            className={`p-3 rounded-xl border text-right transition-all ${config.buttonHover === hover ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white'}`}
                          >
                            <div className={`h-6 ${hover}`}></div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Section>

                <Section id="spacing" title="المسافات" icon={<Layout size={16} className="text-[#BD00FF]" />}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">حشو الصفحة</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['p-4 md:p-8', 'p-6 md:p-12', 'p-8 md:p-16', 'p-10 md:p-20'].map(padding => (
                          <button
                            key={padding}
                            onClick={() => setConfig({ ...config, pagePadding: padding })}
                            className={`p-3 rounded-xl border text-right transition-all ${config.pagePadding === padding ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white'}`}
                          >
                            <p className="font-black text-xs">{padding}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">المسافة بين العناصر</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['gap-2 md:gap-4', 'gap-3 md:gap-6', 'gap-4 md:gap-8', 'gap-6 md:gap-12'].map(gap => (
                          <button
                            key={gap}
                            onClick={() => setConfig({ ...config, itemGap: gap })}
                            className={`p-3 rounded-xl border text-right transition-all ${config.itemGap === gap ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white'}`}
                          >
                            <p className="font-black text-xs">{gap}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Section>
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

        <div className={`flex-1 overflow-y-auto ${config.pagePadding || 'p-6 md:p-12'} flex items-start justify-center`}>
          <MotionDiv 
            layout
            className={`shadow-2xl overflow-hidden transition-all duration-700 flex flex-col ${
              previewMode === 'mobile' ? 'w-full max-w-[375px] min-h-[667px] rounded-[3rem] border-[10px] border-slate-900 box-border' : 'w-full max-w-5xl rounded-[3rem]'
            }`}
            style={{ backgroundColor: config.pageBackgroundColor || config.backgroundColor || '#FFFFFF' }}
          >
            <div className="h-40 md:h-64 relative shrink-0">
               {(bannerPreview || config.bannerUrl) ? (
                 bannerFile && bannerFile.type.startsWith('video/') ? (
                   <video
                     src={bannerPreview || config.bannerUrl}
                     className="w-full h-full object-cover"
                     autoPlay
                     muted
                     loop
                     playsInline
                   />
                 ) : (
                   <img src={bannerPreview || config.bannerUrl} className="w-full h-full object-cover" />
                 )
               ) : (
                 <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                   <p className="text-slate-400 font-black">لا توجد صورة بانر</p>
                 </div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent" />
            </div>
            
            <div className={`p-8 -mt-16 relative flex flex-col gap-6 ${String(config.headerType || 'centered') === 'side' ? 'items-end text-right' : 'items-center text-center'}`}>
               <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2.5rem] shadow-xl p-2 border border-slate-50">
                  <div className="w-full h-full bg-slate-50 rounded-[2rem] flex items-center justify-center font-black text-slate-200 border-2 border-dashed border-slate-100 overflow-hidden text-[8px]">LOGO</div>
               </div>
               <div className="space-y-2">
                  <h1 className={`font-black ${config.headingSize || 'text-4xl'}`} style={{ color: config.primaryColor }}>معاينة المتجر</h1>
                  <p className={`${config.textSize || 'text-sm'} text-slate-400 font-bold`}>القاهرة، مصر</p>
               </div>
               <button className={`${config.buttonPadding || 'px-6 py-3'} ${config.buttonShape || 'rounded-2xl'} text-white font-black text-sm shadow-xl transition-all hover:${config.buttonHover || 'bg-slate-900'}`} style={{ backgroundColor: config.primaryColor }}>متابعة</button>
               
               <div className={`w-full mt-10 space-y-6 ${config.itemGap || 'gap-4 md:gap-6'}`}>
                  {(config.productDisplay || (config.productDisplayStyle === 'list' ? 'list' : undefined) || 'cards') === 'cards' ? (
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2].map(i => (
                        <div key={i} className={`p-3 rounded-2xl border ${config.layout === 'bold' ? 'border-2' : 'border-transparent'}`} style={{ borderColor: config.layout === 'bold' ? config.primaryColor + '22' : 'transparent' }}>
                          <div className="aspect-square bg-slate-100 rounded-xl mb-2" />
                          <div className="h-3 w-1/2 bg-slate-100 rounded-full mx-auto" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`flex flex-row-reverse items-center gap-3 ${((config.productDisplay || (config.productDisplayStyle === 'list' ? 'list' : undefined) || 'cards') === 'minimal') ? 'border-b border-slate-100 py-3' : 'bg-white border border-slate-100 rounded-2xl p-3'}`}>
                          <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
                            <div className="h-3 w-1/3 bg-slate-100 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
