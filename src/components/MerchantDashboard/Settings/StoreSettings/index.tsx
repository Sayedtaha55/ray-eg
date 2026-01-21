import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api.service';
import { RayDB } from '@/constants';
import L from 'leaflet';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface StoreSettingsProps {
  shop: any;
  onSaved: () => void;
  adminShopId?: string;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({ shop, onSaved, adminShopId }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [togglingActive, setTogglingActive] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(Boolean(shop?.isActive));

  useEffect(() => {
    setIsActive(Boolean(shop?.isActive));
  }, [shop?.isActive]);

  const initial = useMemo(
    () => ({
      whatsapp: String(shop?.layoutConfig?.whatsapp || ''),
      customDomain: String(shop?.layoutConfig?.customDomain || ''),
      openingHours: String(shop?.openingHours || shop?.opening_hours || ''),
      displayAddress: String(shop?.displayAddress || shop?.display_address || ''),
      mapLabel: String(shop?.mapLabel || shop?.map_label || ''),
    }),
    [shop],
  );

  const [form, setForm] = useState(initial);

  const [latitude, setLatitude] = useState<number | null>(
    typeof shop?.latitude === 'number' ? shop.latitude : typeof shop?.lat === 'number' ? shop.lat : null,
  );
  const [longitude, setLongitude] = useState<number | null>(
    typeof shop?.longitude === 'number' ? shop.longitude : typeof shop?.lng === 'number' ? shop.lng : null,
  );
  const [locationSource, setLocationSource] = useState<string>(
    String(shop?.locationSource || shop?.location_source || '').trim().toLowerCase(),
  );
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(
    typeof shop?.locationAccuracy === 'number'
      ? shop.locationAccuracy
      : typeof shop?.location_accuracy === 'number'
        ? shop.location_accuracy
        : null,
  );
  const [locationUpdatedAt, setLocationUpdatedAt] = useState<string>(
    String(shop?.locationUpdatedAt || shop?.location_updated_at || ''),
  );
  const [locatingShop, setLocatingShop] = useState(false);
  const [locationError, setLocationError] = useState('');
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const touchLocationMeta = (source: string, accuracy: number | null) => {
    setLocationSource(String(source || '').trim().toLowerCase());
    setLocationAccuracy(typeof accuracy === 'number' ? accuracy : null);
    setLocationUpdatedAt(new Date().toISOString());
  };

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

    const hasCoords = latitude != null && longitude != null;
    const centerLat = hasCoords ? latitude! : 30.0444;
    const centerLng = hasCoords ? longitude! : 31.2357;
    const defaultZoom = hasCoords ? 15 : 12;

    const ensureMarker = (lat: number, lng: number) => {
      if (!mapRef.current) return;
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
        markerRef.current.on('dragend', () => {
          const p = markerRef.current?.getLatLng();
          if (!p) return;
          setLatitude(p.lat);
          setLongitude(p.lng);
          touchLocationMeta('map', null);
        });
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
    };

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([centerLat, centerLng], defaultZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);

      mapRef.current.on('click', (e: any) => {
        const p = e?.latlng;
        if (!p) return;
        setLatitude(p.lat);
        setLongitude(p.lng);
        touchLocationMeta('map', null);
        ensureMarker(p.lat, p.lng);
      });

      if (hasCoords) {
        ensureMarker(latitude!, longitude!);
      }
    } else {
      mapRef.current.setView([centerLat, centerLng], mapRef.current.getZoom() || defaultZoom);
      if (hasCoords) {
        ensureMarker(latitude!, longitude!);
      }
    }

    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 0);
  }, [latitude, longitude]);

  const handleUseMyLocation = async () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      return;
    }
    setLocatingShop(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        touchLocationMeta('gps', typeof pos?.coords?.accuracy === 'number' ? pos.coords.accuracy : null);
        setLocatingShop(false);
      },
      () => {
        setLocatingShop(false);
        setLocationError('فشل تحديد موقعك. تأكد من السماح بالوصول للموقع.');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const receiptLogoInputRef = useRef<HTMLInputElement>(null);
  const receiptShopId = String(adminShopId || shop?.id || '');
  const [receiptShopName, setReceiptShopName] = useState('');
  const [receiptPhone, setReceiptPhone] = useState('');
  const [receiptAddress, setReceiptAddress] = useState('');
  const [receiptLogoDataUrl, setReceiptLogoDataUrl] = useState('');
  const [receiptFooterNote, setReceiptFooterNote] = useState('');
  const [savingReceiptTheme, setSavingReceiptTheme] = useState(false);

  useEffect(() => {
    const theme = RayDB.getReceiptTheme(receiptShopId);
    setReceiptShopName(String((theme as any)?.shopName || shop?.name || ''));
    setReceiptPhone(String((theme as any)?.phone || shop?.phone || ''));
    setReceiptAddress(String((theme as any)?.address || shop?.addressDetailed || shop?.address_detailed || ''));
    setReceiptLogoDataUrl(String((theme as any)?.logoDataUrl || ''));
    setReceiptFooterNote(String((theme as any)?.footerNote || ''));
  }, [receiptShopId, shop?.name, shop?.phone, shop?.addressDetailed, shop?.address_detailed]);

  const handlePickReceiptLogo = () => {
    receiptLogoInputRef.current?.click();
  };

  const handleReceiptLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'خطأ', description: 'الصورة كبيرة جداً، يرجى اختيار صورة أقل من 2 ميجابايت', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptLogoDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveReceiptTheme = async () => {
    if (!receiptShopId) {
      toast({ title: 'خطأ', description: 'لا يمكن حفظ ثيم الفاتورة بدون متجر', variant: 'destructive' });
      return;
    }
    setSavingReceiptTheme(true);
    try {
      RayDB.setReceiptTheme(receiptShopId, {
        shopName: receiptShopName,
        phone: receiptPhone,
        address: receiptAddress,
        logoDataUrl: receiptLogoDataUrl,
        footerNote: receiptFooterNote,
      });
      toast({ title: 'تم الحفظ', description: 'تم حفظ ثيم الفاتورة بنجاح' });
    } catch {
      toast({ title: 'خطأ', description: 'فشل حفظ ثيم الفاتورة', variant: 'destructive' });
    } finally {
      setSavingReceiptTheme(false);
    }
  };

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleToggleActive = async () => {
    setTogglingActive(true);
    const next = !isActive;
    try {
      await ApiService.updateMyShop({
        ...(adminShopId ? { shopId: adminShopId } : {}),
        isActive: next,
      });
      setIsActive(next);
      toast({ title: 'تم التحديث', description: next ? 'تم فتح المتجر' : 'تم قفل المتجر' });
      onSaved();
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : '';
      toast({ title: 'خطأ', description: msg ? `فشل تحديث حالة المتجر: ${msg}` : 'فشل تحديث حالة المتجر', variant: 'destructive' });
    } finally {
      setTogglingActive(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const computedDisplayAddress = String(form.displayAddress || '').trim() || String(shop?.addressDetailed || shop?.address_detailed || '').trim();
      const computedMapLabel = String(form.mapLabel || '').trim() || String(shop?.name || '').trim();

      await ApiService.updateMyShop({
        ...(adminShopId ? { shopId: adminShopId } : {}),
        whatsapp: form.whatsapp,
        customDomain: form.customDomain,
        openingHours: form.openingHours,
        displayAddress: computedDisplayAddress ? computedDisplayAddress : null,
        mapLabel: computedMapLabel ? computedMapLabel : null,
        latitude,
        longitude,
        locationSource: locationSource ? locationSource : undefined,
        locationAccuracy,
        locationUpdatedAt: locationUpdatedAt ? locationUpdatedAt : undefined,
      });

      toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات المتجر بنجاح' });
      onSaved();
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء حفظ التغييرات', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">إعدادات المتجر</h1>
        <p className="text-muted-foreground">إعدادات الظهور ومعلومات التواصل</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>حالة المتجر</CardTitle>
          <CardDescription>
            {isActive ? 'المتجر مفتوح ويظهر للعملاء' : 'المتجر مقفول ولن يظهر للعملاء'}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end border-t px-6 py-4">
          <Button type="button" onClick={handleToggleActive} disabled={togglingActive} variant={isActive ? 'destructive' : 'default'}>
            {togglingActive ? 'جارٍ التحديث...' : isActive ? 'قفل المتجر' : 'فتح المتجر'}
          </Button>
        </CardFooter>
      </Card>

      <form onSubmit={onSubmit}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>التواصل</CardTitle>
            <CardDescription>حدّث بيانات التواصل التي تظهر للعملاء.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">واتساب</Label>
                <Input id="whatsapp" value={form.whatsapp} onChange={onChange('whatsapp')} placeholder="+2010..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customDomain">دومين مخصص</Label>
                <Input id="customDomain" value={form.customDomain} onChange={onChange('customDomain')} placeholder="shop.example.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openingHours">ساعات العمل</Label>
              <Input id="openingHours" value={form.openingHours} onChange={onChange('openingHours')} placeholder="10:00 - 22:00" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t px-6 py-4">
            <Button type="submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
          </CardFooter>
        </Card>

        <div className="h-4" />

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>العنوان</CardTitle>
            <CardDescription>البيانات التي تظهر على صفحة المتجر.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayAddress">العنوان المختصر</Label>
                <Input id="displayAddress" value={form.displayAddress} onChange={onChange('displayAddress')} placeholder="الرياض - ..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mapLabel">اسم الموقع على الخريطة</Label>
                <Input id="mapLabel" value={form.mapLabel} onChange={onChange('mapLabel')} placeholder="اسم المتجر" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t px-6 py-4">
            <Button type="submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
          </CardFooter>
        </Card>

        <div className="h-4" />

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>موقع المتجر على الخريطة</CardTitle>
            <CardDescription>اضغط على الخريطة أو اسحب العلامة لتحديد المكان.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Button type="button" onClick={handleUseMyLocation} disabled={locatingShop} variant="outline">
                {locatingShop ? 'جاري تحديد موقعي...' : 'استخدم موقعي'}
              </Button>
            </div>

            {locationError ? (
              <div className="p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{locationError}</div>
            ) : null}

            <div className="rounded-md overflow-hidden border border-slate-200 bg-white">
              <div ref={mapContainerRef} className="w-full h-72" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-md border border-slate-200 bg-white p-3 text-right">
                <div className="text-xs text-slate-500">Latitude</div>
                <div className="font-bold text-slate-900">{latitude == null ? 'غير محدد' : latitude.toFixed(6)}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3 text-right">
                <div className="text-xs text-slate-500">Longitude</div>
                <div className="font-bold text-slate-900">{longitude == null ? 'غير محدد' : longitude.toFixed(6)}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t px-6 py-4">
            <Button type="submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
          </CardFooter>
        </Card>
      </form>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>ثيم الفاتورة</CardTitle>
          <CardDescription>خصّص بيانات الفاتورة (محليًا على هذا الجهاز).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="receiptShopName">اسم المتجر على الفاتورة</Label>
              <Input id="receiptShopName" value={receiptShopName} onChange={(e) => setReceiptShopName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptPhone">هاتف الفاتورة</Label>
              <Input id="receiptPhone" value={receiptPhone} onChange={(e) => setReceiptPhone(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptAddress">عنوان الفاتورة</Label>
            <Input id="receiptAddress" value={receiptAddress} onChange={(e) => setReceiptAddress(e.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>شعار الفاتورة (اختياري)</Label>
              <div className="flex items-center gap-3">
                <div
                  onClick={handlePickReceiptLogo}
                  className="w-20 h-20 rounded-md overflow-hidden bg-slate-50 border border-slate-200 shrink-0 cursor-pointer flex items-center justify-center"
                >
                  {receiptLogoDataUrl ? (
                    <img src={receiptLogoDataUrl} className="w-full h-full object-cover" alt="receipt-logo" />
                  ) : (
                    <ImageIcon className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Button type="button" onClick={handlePickReceiptLogo} variant="outline">اختيار شعار</Button>
                  <Button type="button" onClick={() => setReceiptLogoDataUrl('')} variant="secondary">حذف الشعار</Button>
                </div>
                <input ref={receiptLogoInputRef} type="file" hidden accept="image/*" onChange={handleReceiptLogoChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptFooterNote">ملاحظة أسفل الفاتورة</Label>
              <Input id="receiptFooterNote" value={receiptFooterNote} onChange={(e) => setReceiptFooterNote(e.target.value)} placeholder="شكراً لزيارتكم" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t px-6 py-4">
          <Button type="button" onClick={handleSaveReceiptTheme} disabled={savingReceiptTheme}>
            {savingReceiptTheme ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ ثيم الفاتورة'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StoreSettings;
