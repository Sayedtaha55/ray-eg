import React, { useEffect, useState } from 'react';
import { ApiService } from '@/services/api.service';
import { Image as ImageIcon, Loader2, Search, Check, UploadCloud, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HomeExperienceSection: React.FC<{ config: any; setConfig: (next: any) => void; shop?: any }> = ({ config, setConfig, shop }) => {
  const { t } = useTranslation();
  const mode = String(config.homeLayoutMode || 'banner_ads_story');
  const clinicLayout = String(config.clinicLayout || 'classic_grid');
  
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [uploadingAbout, setUploadingAbout] = useState(false);
  const [uploadingStory, setUploadingStory] = useState(false);

  useEffect(() => {
    if (shop?.id) {
      setLoadingProducts(true);
      ApiService.getProducts(shop.id, { page: 1, limit: 100 })
        .then((res) => setProducts(Array.isArray(res) ? res : []))
        .catch((err) => console.error('Failed to load products for checklist:', err))
        .finally(() => setLoadingProducts(false));
    }
  }, [shop?.id]);

  const setVal = (key: string, value: any) => setConfig({ ...config, [key]: value });

  const handleUploadImage = async (file: File, type: 'about' | 'story') => {
    if (!shop?.id) return;
    const isAbout = type === 'about';
    if (isAbout) setUploadingAbout(true);
    else setUploadingStory(true);

    try {
      const uploaded = await ApiService.uploadMediaRobust({
        file,
        purpose: 'shop_banner',
        shopId: shop.id,
      });
      const url = String(uploaded?.url || '').trim();
      if (url) {
        setVal(isAbout ? 'homeAboutImageUrl' : 'homeStoryImageUrl', url);
      }
    } catch (err) {
      console.error('Failed to upload experience image:', err);
    } finally {
      if (isAbout) setUploadingAbout(false);
      else setUploadingStory(false);
    }
  };

  const selectedProductIds = Array.isArray(config.homeHighlightedProductIds)
    ? config.homeHighlightedProductIds.map(String)
    : [];

  const handleToggleProduct = (productId: string) => {
    const isSelected = selectedProductIds.includes(productId);
    let nextIds = [...selectedProductIds];
    if (isSelected) {
      nextIds = nextIds.filter((id) => id !== productId);
    } else {
      if (nextIds.length >= 6) {
        return; // Max 6 products
      }
      nextIds.push(productId);
    }
    setVal('homeHighlightedProductIds', nextIds);
  };

  const filteredProducts = products.filter((p) => {
    const name = String(p?.name || '').toLowerCase();
    const cat = String(p?.category || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return name.includes(query) || cat.includes(query);
  });

  return (
    <div className="space-y-5 text-right" dir="rtl">
      {/* 1. Page Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">اسم الصفحة الرئيسية</label>
          <input 
            value={String(config.homePageName || 'الرئيسية')} 
            onChange={(e) => setVal('homePageName', e.target.value)} 
            className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all" 
            placeholder="مثال: الرئيسية" 
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            {shop?.category === 'SERVICE' ? 'اسم صفحة الخدمات والأطباء' : 'اسم صفحة المنتجات'}
          </label>
          <input 
            value={String(config.allProductsPageName || (shop?.category === 'SERVICE' ? 'خدماتنا وأطباؤنا' : 'جميع المنتجات'))} 
            onChange={(e) => setVal('allProductsPageName', e.target.value)} 
            className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all" 
            placeholder={shop?.category === 'SERVICE' ? 'مثال: الأطباء والعيادات' : 'مثال: المنتجات / المنيو'} 
          />
        </div>
      </div>

      {/* 2. Theme Type — Hidden for clinics (they always use story layout) */}
      {shop?.category !== 'SERVICE' && (
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">نوع الصفحة الرئيسية</label>
          <div className="grid grid-cols-1 gap-2">
            <button 
              type="button" 
              onClick={() => setVal('homeLayoutMode', 'banner_products')} 
              className={`p-3.5 rounded-xl border text-right font-black text-xs transition-all ${mode === 'banner_products' ? 'border-cyan-400 bg-cyan-50/50 text-cyan-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              بانر + منتجات مباشرة (Catalog Clean)
            </button>
            <button 
              type="button" 
              onClick={() => setVal('homeLayoutMode', 'banner_ads_story')} 
              className={`p-3.5 rounded-xl border text-right font-black text-xs transition-all ${mode === 'banner_ads_story' ? 'border-cyan-400 bg-cyan-50/50 text-cyan-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              بانر + إعلانات متحركة + تعريفات + فوتر (Restaurant Pro / Fashion Glow)
            </button>
          </div>
        </div>
      )}
      {shop?.category === 'SERVICE' && (
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">هيكل وتصميم صفحة الحجوزات</label>
          <div className="grid grid-cols-1 gap-2">
            <button 
              type="button" 
              onClick={() => {
                setConfig({
                  ...config,
                  clinicLayout: 'classic_grid',
                  quickTheme: 'clinic_elegant_blue',
                  primaryColor: '#0EA5E9',
                  secondaryColor: '#0369A1',
                  headerBackgroundColor: '#FFFFFF',
                  headerTextColor: '#0F172A',
                  footerBackgroundColor: '#FFFFFF',
                  footerTextColor: '#0F172A',
                  pageBackgroundColor: '#FFFFFF'
                });
              }} 
              className={`p-4 rounded-2xl border text-right transition-all flex flex-col gap-1 ${clinicLayout === 'classic_grid' ? 'border-cyan-400 bg-cyan-50/50 text-cyan-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              <span className="text-xs font-black">1. رعاية الشفاء الكلاسيكية (ثيم أزرق طبي كلاسيكي)</span>
              <span className="text-[10px] font-bold text-slate-500">حجز سريع مباشر + شبكة الأطباء والخدمات + آراء العملاء بتصميم أزرق هادئ</span>
            </button>
            <button 
              type="button" 
              onClick={() => {
                setConfig({
                  ...config,
                  clinicLayout: 'banner_promo_booking',
                  quickTheme: 'clinic_modern_purple',
                  primaryColor: '#8B5CF6',
                  secondaryColor: '#EC4899',
                  headerBackgroundColor: '#FFFFFF',
                  headerTextColor: '#0F172A',
                  footerBackgroundColor: '#FFFFFF',
                  footerTextColor: '#0F172A',
                  pageBackgroundColor: '#FCF8FF'
                });
              }} 
              className={`p-4 rounded-2xl border text-right transition-all flex flex-col gap-1 ${clinicLayout === 'banner_promo_booking' ? 'border-cyan-400 bg-cyan-50/50 text-cyan-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              <span className="text-xs font-black">2. النخبة الطبية الفاخرة (ثيم بنفسجي ووردي عصري)</span>
              <span className="text-[10px] font-bold text-slate-500">بنر رئيسي فاخر + بطاقات تعريفية مع صور مميزة + تأثيرات زجاجية وتفاعلية</span>
            </button>
          </div>
        </div>
      )}

      {(mode === 'banner_ads_story' || shop?.category === 'SERVICE') && (
        <>
          <div className="h-px bg-slate-100 my-4" />

          {/* 3. Alternating Sections Customization */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 mb-1 border-r-4 border-cyan-400 pr-2">تخصيص الأقسام التعريفية</h3>

            {/* Card 1: About Section */}
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <span className="text-[10px] font-black text-cyan-600 block mb-1">القسم الأول (من نحن)</span>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">عنوان القسم الأول</label>
                <input 
                  value={String(config.homeAboutTitle || 'من نحن وقيمتنا')} 
                  onChange={(e) => setVal('homeAboutTitle', e.target.value)} 
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white" 
                  placeholder="من نحن وقيمتنا" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">نص تعريف النشاط</label>
                <textarea 
                  value={String(config.homeIntroText || '')} 
                  onChange={(e) => setVal('homeIntroText', e.target.value)} 
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold min-h-[72px] bg-white" 
                  placeholder="اكتب تعريف النشاط وقيم متجرك..." 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">صورة القسم الأول</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    id="about-img-upload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadImage(file, 'about');
                    }}
                  />
                  <label 
                    htmlFor="about-img-upload" 
                    className="flex-1 bg-white border border-slate-200 border-dashed rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all min-h-[80px]"
                  >
                    {uploadingAbout ? (
                      <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">اختر صورة للرفع</span>
                      </>
                    )}
                  </label>
                  {config.homeAboutImageUrl && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                      <img src={config.homeAboutImageUrl} alt="About us Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setVal('homeAboutImageUrl', '')} 
                        className="absolute top-1 left-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Story Section */}
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <span className="text-[10px] font-black text-cyan-600 block mb-1">القسم الثاني (خدماتنا وقصتنا)</span>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">عنوان القسم الثاني</label>
                <input 
                  value={String(config.homeStoryTitle || 'خدماتنا وإعلاناتنا')} 
                  onChange={(e) => setVal('homeStoryTitle', e.target.value)} 
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white" 
                  placeholder="خدماتنا وإعلاناتنا" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">رسالة إضافية أو قصة النشاط</label>
                <textarea 
                  value={String(config.homeStoryText || '')} 
                  onChange={(e) => setVal('homeStoryText', e.target.value)} 
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold min-h-[72px] bg-white" 
                  placeholder="قصة العلامة التجارية أو مميزات الخدمات..." 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">صورة القسم الثاني</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    id="story-img-upload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadImage(file, 'story');
                    }}
                  />
                  <label 
                    htmlFor="story-img-upload" 
                    className="flex-1 bg-white border border-slate-200 border-dashed rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all min-h-[80px]"
                  >
                    {uploadingStory ? (
                      <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">اختر صورة للرفع</span>
                      </>
                    )}
                  </label>
                  {config.homeStoryImageUrl && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                      <img src={config.homeStoryImageUrl} alt="Story Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setVal('homeStoryImageUrl', '')} 
                        className="absolute top-1 left-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-4" />

          {/* 4. Marquee Ads titles */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 border-r-4 border-cyan-400 pr-2">شريط الإعلانات المتحرك</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">إعلان الشريط اليمين</label>
                <input 
                  value={String(config.homeRightAdTitle || '')} 
                  onChange={(e) => setVal('homeRightAdTitle', e.target.value)} 
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white transition-all" 
                  placeholder="مثال: توصيل سريع ومجاني!" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">إعلان الشريط اليسار</label>
                <input 
                  value={String(config.homeLeftAdTitle || '')} 
                  onChange={(e) => setVal('homeLeftAdTitle', e.target.value)} 
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white transition-all" 
                  placeholder="مثال: خصم خاص 20% اليوم!" 
                />
              </div>
            </div>
          </div>

          {/* 5. Highlighted Products Selector — Hidden for clinics */}
          {shop?.category !== 'SERVICE' && (
            <>
              <div className="h-px bg-slate-100 my-4" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    اختر المنتجات المميزة (6 كحد أقصى)
                  </span>
                  <span className="text-[10px] font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
                    {selectedProductIds.length} / 6
                  </span>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ابحث في المنتجات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2.5 pr-9 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-200 transition-all"
                  />
                </div>

                {/* List */}
                <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                  {loadingProducts ? (
                    <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-500 mb-2" />
                      <span className="text-[10px] font-bold">جاري تحميل المنتجات...</span>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 font-bold text-xs">
                      لا توجد منتجات مطابقة للبحث
                    </div>
                  ) : (
                    <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100">
                      {filteredProducts.map((prod) => {
                        const id = String(prod.id);
                        const active = selectedProductIds.includes(id);
                        const disabled = !active && selectedProductIds.length >= 6;
                        
                        return (
                          <button
                            key={id}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleToggleProduct(id)}
                            className={`w-full p-3 flex items-center justify-between text-right transition-colors ${active ? 'bg-cyan-50/30' : 'hover:bg-slate-50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                                {prod.imageUrl || prod.image_url ? (
                                  <img src={prod.imageUrl || prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <ImageIcon size={16} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-black text-xs text-slate-900 block leading-tight">{prod.name}</span>
                                <span className="text-[9px] text-slate-400 font-bold leading-none">{prod.category || 'تصنيف عام'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-600">{prod.price} ج.م</span>
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${active ? 'bg-cyan-400 border-cyan-400 text-white' : 'border-slate-200 bg-white'}`}>
                                {active && <Check size={12} strokeWidth={3} />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default HomeExperienceSection;
