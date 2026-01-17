
import React, { useEffect, useState, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { RayDB } from '@/constants';
import { Shop, Product, ShopDesign, Offer, Category, ShopGallery } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import { 
  Star, ChevronRight, X, Plus, Check, Heart, Users, 
  CalendarCheck, Eye, Layout, Palette, Layers, MousePointer2, 
  Zap, Loader2, AlertCircle, Home, Share2, Utensils, ShoppingBag, 
  Info, Clock, MapPin, Phone, MessageCircle, Sliders, Monitor, Send, Camera,
  Tag
} from 'lucide-react';
import ReservationModal from '../shared/ReservationModal';
import { ShopGallery as ShopGalleryComponent, useToast } from '@/components';
import { ApiService } from '@/services/api.service';

const { useParams, useNavigate, useLocation } = ReactRouterDOM as any;
const MotionImg = motion.img as any;
const MotionDiv = motion.div as any;

const DEFAULT_SHOP_DESIGN: ShopDesign = {
  primaryColor: '#00E5FF',
  layout: 'modern',
  bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
  headerType: 'centered',
};

const ProductCard: React.FC<{ 
  product: Product, 
  design: ShopDesign, 
  offer?: Offer,
  onAdd: (p: Product, price: number) => void,
  isAdded: boolean,
  onReserve: (p: any) => void,
  disabled?: boolean
}> = ({ product, design, offer, onAdd, isAdded, onReserve, disabled }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  const isMinimal = design.layout === 'minimal';
  const isModern = design.layout === 'modern';
  const isBold = design.layout === 'bold';

  useEffect(() => {
    const favs = RayDB.getFavorites();
    setIsFavorite(favs.includes(product.id));
  }, [product.id]);

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const state = RayDB.toggleFavorite(product.id);
    setIsFavorite(state);
    // Notify other components that favorites changed
    window.dispatchEvent(new Event('ray-db-update'));
    
    // Show toast notification
    const message = state ? 'تمت إضافة المنتج للمفضلة! ❤️' : 'تم حذف المنتج من المفضلة';
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[9999] font-black text-sm animate-pulse';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const currentPrice = offer ? offer.newPrice : product.price;

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className={`group relative bg-white transition-all duration-500 flex flex-col h-full overflow-hidden ${
        isBold ? 'rounded-[1.8rem] md:rounded-[2.5rem] border-2 shadow-2xl p-2 md:p-2.5' : 
        isModern ? 'rounded-[1.2rem] md:rounded-[1.5rem] border border-slate-100 shadow-lg p-1.5' :
        'rounded-none border-b border-slate-100 p-0 shadow-none'
      }`}
      style={{ borderColor: isBold ? design.primaryColor : isModern ? `${design.primaryColor}15` : undefined }}
    >
      <div 
        onClick={() => navigate(`/product/${product.id}`)}
        className={`relative aspect-square overflow-hidden cursor-pointer ${
          isBold ? 'rounded-[1.4rem] md:rounded-[2rem]' : isModern ? 'rounded-[1rem]' : 'rounded-none'
        }`}
      >
        <img 
          src={product.imageUrl || (product as any).image_url} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1s]" 
          alt={product.name} 
        />
        
        {offer && (
          <div className="absolute top-2 right-2 bg-[#BD00FF] text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full font-black text-[8px] md:text-[10px] shadow-lg flex items-center gap-1 z-10">
            <Zap size={8} fill="currentColor" className="md:w-[10px] md:h-[10px]" /> {offer.discount}%
          </div>
        )}

        <div className="absolute inset-0 bg-black/5 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <div className="w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl">
              <Eye size={14} className="md:w-4 md:h-4" />
           </div>
        </div>

        <button 
          onClick={toggleFav} 
          className={`absolute top-2 left-2 p-2 md:p-2.5 transition-all z-10 shadow-sm ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-slate-900'
          } rounded-full`}
        >
           <Heart size={12} className="md:w-[14px] md:h-[14px]" fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className={`p-2 md:p-4 flex flex-col flex-1 text-right ${isMinimal ? 'items-end' : ''}`}>
        <h4 className={`font-black mb-2 line-clamp-2 leading-tight text-slate-800 ${isBold ? 'text-base md:text-xl' : 'text-xs md:text-base'}`}>
          {product.name}
        </h4>
        
        <div className="mt-auto w-full">
          <div className={`flex items-center justify-between flex-row-reverse mb-2 md:mb-3 ${isMinimal ? 'flex-col items-end gap-1' : ''}`}>
             <div className="text-right">
                {offer && <p className="text-slate-300 line-through text-[8px] md:text-[10px] font-bold">ج.م {product.price}</p>}
                <span className={`font-black tracking-tighter ${isBold ? 'text-base md:text-2xl' : 'text-sm md:text-xl'}`} style={{ color: offer ? '#BD00FF' : design.primaryColor }}>
                  ج.م {currentPrice}
                </span>
             </div>
          </div>
          
          <div className="flex gap-1.5 md:gap-2">
             <button 
               disabled={Boolean(disabled)}
               onClick={(e) => {
                 e.stopPropagation();
                 if (disabled) return;
                 onAdd(product, currentPrice);
               }}
               className={`flex-1 py-2 md:py-3 flex items-center justify-center gap-1.5 md:gap-2 transition-all active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed ${
                 isAdded ? 'bg-green-500' : 'bg-slate-900'
               } text-white ${isBold ? 'rounded-xl md:rounded-[1.2rem]' : isModern ? 'rounded-lg md:rounded-xl' : 'rounded-none'} shadow-md`}
             >
               {isAdded ? <Check size={12} /> : <Plus size={12} />}
               <span className="text-[9px] md:text-[11px] font-black uppercase">{isAdded ? 'تم' : 'للسلة'}</span>
             </button>
             <button 
               disabled={Boolean(disabled)}
               onClick={(e) => {
                 e.stopPropagation();
                 if (disabled) return;
                 onReserve({ ...product, price: currentPrice });
               }}
               className={`flex-1 py-2 md:py-3 text-black flex items-center justify-center gap-1.5 md:gap-2 font-black text-[9px] md:text-[11px] uppercase transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md ${isBold ? 'rounded-xl md:rounded-[1.2rem]' : isModern ? 'rounded-lg md:rounded-xl' : 'rounded-none'}`}
               style={{ backgroundColor: design.primaryColor }}
             >
               <CalendarCheck size={12} /> حجز
             </button>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

const ChatWindow: React.FC<{ shop: Shop, onClose: () => void }> = ({ shop, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [user, setUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('ray_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      loadMessages(parsed.id);
      
      const sub = ApiService.subscribeToMessages(shop.id, (newMsg) => {
        if (newMsg.userId === parsed.id) {
          setMessages(prev => [...prev, newMsg]);
        }
      });
      return () => { sub.unsubscribe(); };
    }
  }, [shop.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const loadMessages = async (userId: string) => {
    const data = await ApiService.getMessages(shop.id, userId);
    setMessages(data);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;
    const msg = {
      shopId: shop.id,
      userId: user.id,
      senderId: user.id,
      senderName: user.name,
      text: inputText,
      role: 'customer' as const
    };
    setInputText('');
    await ApiService.sendMessage(msg);
  };

  if (!user) return (
    <div className="p-8 text-center bg-white rounded-3xl shadow-2xl w-[calc(100vw-2rem)] md:w-[320px]">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
         <MessageCircle size={32} className="text-[#00E5FF]" />
      </div>
      <p className="font-black text-sm mb-6 leading-relaxed text-slate-600">سجل دخولك الآن عشان تقدر تدردش مع {shop.name} مباشرة</p>
      <button onClick={() => window.location.hash = '/login'} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-105 transition-transform">دخول / تسجيل</button>
    </div>
  );

  return (
    <MotionDiv initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-[calc(100vw-2rem)] md:w-[400px] h-[450px] md:h-[500px] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100">
      <header className="p-5 md:p-6 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={shop.logoUrl || (shop as any).logo_url} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/20" />
          <div className="text-right">
            <p className="font-black text-xs md:text-sm leading-none mb-1">{shop.name}</p>
            <p className="text-[9px] md:text-[10px] text-green-400 font-bold flex items-center gap-1 justify-end">متصل الآن <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-green-400 rounded-full inline-block" /></p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={18} /></button>
      </header>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50 no-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <MessageCircle size={40} className="mb-2" />
            <p className="text-[10px] font-bold">ابدأ المحادثة مع {shop.name}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-2xl text-[11px] md:text-xs font-bold shadow-sm ${m.role === 'customer' ? 'bg-[#00E5FF] text-slate-900' : 'bg-white text-slate-700'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 md:p-4 bg-white border-t border-slate-100 flex gap-2">
        <input 
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="اكتب رسالتك هنا..."
          className="flex-1 bg-slate-50 rounded-xl px-4 py-3 outline-none font-bold text-[11px] md:text-xs text-right"
        />
        <button onClick={handleSend} className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
          <Send size={16} className="rotate-180" />
        </button>
      </div>
    </MotionDiv>
  );
};

const ShopProfile: React.FC = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [currentDesign, setCurrentDesign] = useState<ShopDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [spatialMode, setSpatialMode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [galleryImages, setGalleryImages] = useState<ShopGallery[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'offers' | 'gallery' | 'info'>('products');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [hasFollowed, setHasFollowed] = useState(false);
  const [selectedProductForRes, setSelectedProductForRes] = useState<any | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const getAuthToken = () => {
    try {
      return localStorage.getItem('ray_token') || '';
    } catch {
      return '';
    }
  };

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (activeTab === 'info') return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldOpenChat = params.get('chat') === '1' || params.get('chat') === 'true';
    if (shouldOpenChat) setShowChat(true);
  }, [location.search]);

  useEffect(() => {
    const syncData = async () => {
      if (!slug) return;
      setLoading(true);
      setError(false);
      try {
        const currentShopData = await ApiService.getShopBySlug(slug);
        if (currentShopData) {
          setShop(JSON.parse(JSON.stringify(currentShopData)));
          setCurrentDesign(currentShopData.pageDesign || DEFAULT_SHOP_DESIGN);
          const status = String((currentShopData as any)?.status || '').toLowerCase();
          if (status !== 'suspended') {
            await RayDB.incrementVisitors(String(currentShopData.id));
            const [prodData, allOffers, galleryData] = await Promise.all([
              ApiService.getProducts(currentShopData.id),
              ApiService.getOffers(),
              ApiService.getShopGallery(currentShopData.id)
            ]);
            setProducts(prodData);
            setOffers(allOffers.filter((o: any) => o.shopId === currentShopData.id));
            setGalleryImages(galleryData);
          } else {
            setProducts([]);
            setOffers([]);
            setGalleryImages([]);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        // Error fetching shop data - handled silently
        setError(true);
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    };
    syncData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.addEventListener('ray-db-update', syncData);
    return () => {
      window.removeEventListener('ray-db-update', syncData);
    };
  }, [slug]);

  useEffect(() => {
    if (activeTab !== 'info') return;
    if (!shop) return;
    const lat = typeof (shop as any)?.latitude === 'number' ? (shop as any).latitude : null;
    const lng = typeof (shop as any)?.longitude === 'number' ? (shop as any).longitude : null;
    if (lat == null || lng == null) return;
    if (!mapContainerRef.current) return;

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41],
    });
    (L.Marker.prototype as any).options.icon = defaultIcon;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);

      markerRef.current = L.marker([lat, lng], { draggable: false }).addTo(mapRef.current);
    } else {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom() || 15);
      markerRef.current?.setLatLng([lat, lng]);
    }

    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 0);
  }, [activeTab, shop?.id, (shop as any)?.latitude, (shop as any)?.longitude]);

  const design = currentDesign || DEFAULT_SHOP_DESIGN;
  const hasShopLocation = typeof (shop as any)?.latitude === 'number' && typeof (shop as any)?.longitude === 'number';
  const googleMapsUrl = hasShopLocation ? `https://www.google.com/maps?q=${(shop as any).latitude},${(shop as any).longitude}` : '';
  const isSuspended = String((shop as any)?.status || '').toLowerCase() === 'suspended';

  const handleShare = async () => {
    if (!shop) return;
    const shareData = {
      title: shop.name,
      text: `شوفوا المحل ده على منصة Ray: ${shop.name}`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData as any);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        addToast('تم نسخ الرابط', 'info');
      }
    } catch {
      // ignore
    }
  };

  const handleAddToCart = (product: Product, price: number) => {
    const event = new CustomEvent('add-to-cart', {
      detail: {
        id: product.id,
        productId: product.id,
        name: product.name,
        image: product.imageUrl || (product as any).image_url,
        price,
        quantity: 1,
        shopId: (shop as any)?.id,
        shopName: (shop as any)?.name,
      },
    });
    window.dispatchEvent(event);
    setAddedItemId(product.id);
    setTimeout(() => setAddedItemId(null), 1200);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
      <Loader2 className="w-10 h-10 animate-spin text-[#00E5FF]" />
    </div>
  );

  if (error || !shop) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <AlertCircle className="w-14 h-14 text-slate-300 mb-6" />
      <h2 className="text-2xl font-black mb-4">المحل غير متاح حالياً</h2>
      <button onClick={() => navigate('/')} className="px-8 py-4 bg-slate-900 text-white rounded-full font-black flex items-center gap-3"><Home size={20} /> العودة للرئيسية</button>
    </div>
  );

  if (isSuspended) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <AlertCircle className="w-14 h-14 text-slate-300 mb-6" />
      <h2 className="text-2xl font-black mb-4">المتجر غير متاح مؤقتاً</h2>
      <p className="text-slate-500 font-bold max-w-xl mb-8">ممكن يكون صاحب المتجر بيجهّز تحديثات وتحسينات.</p>
      <button onClick={() => navigate('/')} className="px-8 py-4 bg-slate-900 text-white rounded-full font-black flex items-center gap-3"><Home size={20} /> العودة للرئيسية</button>
    </div>
  );

  const offerByProductId = new Map<string, Offer>();
  offers.forEach((o: any) => {
    const pid = String(o.productId || o.product_id || '');
    if (pid) offerByProductId.set(pid, o);
  });

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="sticky top-0 z-[60] bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-row-reverse">
            <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl border border-slate-100"><ChevronRight size={18} /></button>
            <div className="text-right">
              <div className="font-black text-lg md:text-2xl">{shop.name}</div>
              <div className="text-[10px] md:text-xs font-bold text-slate-400">/s/{shop.slug}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 bg-white rounded-xl border border-slate-100"><Share2 size={18} /></button>
            <button onClick={() => navigate('/')} className="p-2 bg-white rounded-xl border border-slate-100"><Home size={18} /></button>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex gap-6 justify-end overflow-x-auto no-scrollbar">
            <NavTab active={activeTab === 'products'} onClick={() => setActiveTab('products')} label="المنتجات" primaryColor={design.primaryColor} layout={design.layout} />
            <NavTab active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} label="العروض" primaryColor={design.primaryColor} layout={design.layout} />
            <NavTab active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} label="المعرض" primaryColor={design.primaryColor} layout={design.layout} />
            <NavTab active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="معلومات" primaryColor={design.primaryColor} layout={design.layout} />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        {activeTab === 'products' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                design={design}
                offer={offerByProductId.get(String(p.id))}
                onAdd={handleAddToCart}
                isAdded={addedItemId === p.id}
                onReserve={(x) => setSelectedProductForRes(x)}
              />
            ))}
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((o: any) => (
              <div key={o.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 text-right">
                <div className="font-black text-xl mb-2">{o.title}</div>
                <div className="text-slate-500 font-bold text-sm mb-4">خصم {o.discount}%</div>
                <button
                  onClick={() => navigate(`/product/${o.productId || o.product_id || o.id}`)}
                  className="px-6 py-3 rounded-2xl font-black text-sm text-black"
                  style={{ backgroundColor: design.primaryColor }}
                >
                  مشاهدة العرض
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div>
            <ShopGalleryComponent images={galleryImages as any} shopName={shop.name} primaryColor={design.primaryColor} layout={design.layout} />
          </div>
        )}

        {activeTab === 'info' && (
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3 flex-row-reverse">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#00E5FF] mt-1 shrink-0" />
                  <div className="text-right">
                    <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">العنوان</div>
                    <div className="font-black text-sm md:text-base text-white">{(shop as any).addressDetailed || `${(shop as any).city || ''}${(shop as any).governorate ? `, ${(shop as any).governorate}` : ''}`}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 flex-row-reverse">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-[#BD00FF] mt-1 shrink-0" />
                  <div className="text-right">
                    <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">الهاتف</div>
                    <div className="font-black text-sm md:text-base text-white">{(shop as any).phone || 'غير متاح'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 flex-row-reverse">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-slate-300 mt-1 shrink-0" />
                  <div className="text-right">
                    <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">مواعيد العمل</div>
                    <div className="font-black text-sm md:text-base text-white">{(shop as any).openingHours || 'غير محدد'}</div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 flex-row-reverse">
                  {hasShopLocation ? (
                    <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-black text-xs md:text-sm transition-all">
                      فتح الموقع على Google Maps
                    </a>
                  ) : null}
                  <button onClick={handleShare} className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-black text-xs md:text-sm transition-all">
                    مشاركة المتجر
                  </button>
                  <button onClick={() => navigate('/')} className="px-5 py-3 rounded-2xl font-black text-xs md:text-sm transition-all text-black" style={{ backgroundColor: design.primaryColor }}>
                    العودة للمنصة
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 min-h-[260px]">
                {hasShopLocation ? <div ref={mapContainerRef} className="w-full h-[260px] md:h-full" /> : <div className="w-full h-[260px] flex items-center justify-center text-slate-400 font-bold">لا يوجد موقع للمحل</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      <ReservationModal 
        isOpen={!!selectedProductForRes} 
        onClose={() => setSelectedProductForRes(null)} 
        item={selectedProductForRes ? {
          id: selectedProductForRes.id,
          name: selectedProductForRes.name,
          image: selectedProductForRes.imageUrl || (selectedProductForRes as any).image_url,
          price: selectedProductForRes.price,
          shopId: selectedProductForRes.shopId,
          shopName: selectedProductForRes.shopName
        } : null}
      />

      {/* Spatial Discovery Overlay */}
      <AnimatePresence>
        {spatialMode && (
          <MotionDiv key="spatial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 md:p-8 text-center text-white">
             <div className="relative mb-8 md:mb-12">
               <div className="w-20 h-20 md:w-24 md:h-24 border-[4px] md:border-[6px] rounded-full border-white/5 border-t-[#00E5FF] animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 border-[4px] md:border-[6px] rounded-full border-white/5 border-t-[#BD00FF] animate-spin-reverse" />
               </div>
             </div>
             <h2 className="text-3xl md:text-7xl font-black mb-4 md:mb-6 tracking-tighter">جاري تهيئة الشعاع المكاني...</h2>
             <p className="text-slate-400 font-bold text-sm md:text-xl max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed px-4">
               استعد لتجربة تسوق ثورية. ستتمكن قريباً من المشي داخل "{shop.name}" واختيار منتجاتك بشكل ثلاثي الأبعاد بالكامل من منزلك.
             </p>
             <button onClick={() => setSpatialMode(false)} className="px-10 py-4 md:px-16 md:py-6 bg-white text-black rounded-full font-black text-lg md:text-2xl active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">العودة للواقع</button>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavTab = ({ active, onClick, label, primaryColor, layout }: any) => {
  const isBold = layout === 'bold';
  return (
    <button 
      onClick={onClick} 
      className={`pb-4 px-2 md:pb-5 md:px-4 transition-all relative whitespace-nowrap font-black flex flex-col items-center ${
        active ? 'opacity-100' : 'text-slate-300 hover:text-slate-400 opacity-70 hover:opacity-100'
      } ${isBold ? 'text-base md:text-2xl' : 'text-sm md:text-xl'}`}
      style={{ color: active ? primaryColor : undefined }}
    >
      {label}
      {active && (
        <motion.div 
          layoutId="tab-underline" 
          className={`absolute bottom-0 left-0 right-0 rounded-t-full ${isBold ? 'h-1.5' : 'h-1'}`}
          style={{ backgroundColor: primaryColor }}
        />
      )}
    </button>
  );
};

const InfoItem = ({ icon, title, value }: any) => (
  <div className="flex items-center gap-4 flex-row-reverse w-full">
     <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">{icon}</div>
     <div className="text-right flex-1 min-w-0">
        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-xs md:text-lg font-black text-slate-800 break-words leading-tight">{value}</p>
     </div>
  </div>
);

export default ShopProfile;
