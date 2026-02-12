import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api.service';


interface StoreSettingsProps {
  shop: any;
  onSaved: () => void;
  adminShopId?: string;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({ shop, onSaved, adminShopId }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const baselineFormRef = useRef<any>(null);
  const baselineCoordsRef = useRef<{ lat: number | null; lng: number | null } | null>(null);
  const baselineMetaRef = useRef<{ locationSource: string; locationAccuracy: number | null; locationUpdatedAt: string } | null>(null);

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
    [
      shop?.layoutConfig?.whatsapp,
      shop?.layoutConfig?.customDomain,
      shop?.openingHours,
      (shop as any)?.opening_hours,
      shop?.displayAddress,
      (shop as any)?.display_address,
      shop?.mapLabel,
      (shop as any)?.map_label,
    ],
  );

  const [form, setForm] = useState(initial);

  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

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

  const coordsRef = useRef<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  useEffect(() => {
    coordsRef.current = { lat: latitude, lng: longitude };
  }, [latitude, longitude]);

  const locationMetaRef = useRef({ locationSource, locationAccuracy, locationUpdatedAt });
  useEffect(() => {
    locationMetaRef.current = { locationSource, locationAccuracy, locationUpdatedAt };
  }, [locationSource, locationAccuracy, locationUpdatedAt]);
  const [locatingShop, setLocatingShop] = useState(false);
  const [locationError, setLocationError] = useState('');
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

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
    const latFromShop =
      typeof shop?.latitude === 'number' ? shop.latitude : typeof shop?.lat === 'number' ? shop.lat : null;
    const lngFromShop =
      typeof shop?.longitude === 'number' ? shop.longitude : typeof shop?.lng === 'number' ? shop.lng : null;
    const locationSourceFromShop = String(shop?.locationSource || shop?.location_source || '').trim().toLowerCase();
    const locationAccuracyFromShop =
      typeof shop?.locationAccuracy === 'number'
        ? shop.locationAccuracy
        : typeof shop?.location_accuracy === 'number'
          ? shop.location_accuracy
          : null;
    const locationUpdatedAtFromShop = String(shop?.locationUpdatedAt || shop?.location_updated_at || '');

    baselineFormRef.current = initial;
    baselineCoordsRef.current = { lat: latFromShop, lng: lngFromShop };
    baselineMetaRef.current = {
      locationSource: locationSourceFromShop,
      locationAccuracy: locationAccuracyFromShop,
      locationUpdatedAt: locationUpdatedAtFromShop,
    };

    setForm(initial);
    setLatitude(latFromShop);
    setLongitude(lngFromShop);
    setLocationSource(locationSourceFromShop);
    setLocationAccuracy(locationAccuracyFromShop);
    setLocationUpdatedAt(locationUpdatedAtFromShop);

    try {
      window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'store', count: 0 } }));
    } catch {
    }
  }, [shop?.id, initial]);

  useEffect(() => {
    const baseForm = baselineFormRef.current || {};
    const baseCoords = baselineCoordsRef.current || { lat: null, lng: null };
    const baseMeta = baselineMetaRef.current || { locationSource: '', locationAccuracy: null, locationUpdatedAt: '' };

    const count =
      (String(form.whatsapp || '') !== String(baseForm.whatsapp || '') ? 1 : 0) +
      (String(form.customDomain || '') !== String(baseForm.customDomain || '') ? 1 : 0) +
      (String(form.openingHours || '') !== String(baseForm.openingHours || '') ? 1 : 0) +
      (String(form.displayAddress || '') !== String(baseForm.displayAddress || '') ? 1 : 0) +
      (String(form.mapLabel || '') !== String(baseForm.mapLabel || '') ? 1 : 0) +
      (Number(latitude ?? -999) !== Number(baseCoords.lat ?? -999) ? 1 : 0) +
      (Number(longitude ?? -999) !== Number(baseCoords.lng ?? -999) ? 1 : 0) +
      (String(locationSource || '').trim().toLowerCase() !== String(baseMeta.locationSource || '').trim().toLowerCase() ? 1 : 0) +
      (Number(locationAccuracy ?? -999) !== Number(baseMeta.locationAccuracy ?? -999) ? 1 : 0) +
      (String(locationUpdatedAt || '') !== String(baseMeta.locationUpdatedAt || '') ? 1 : 0);

    try {
      window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'store', count } }));
    } catch {
    }
  }, [form, latitude, longitude, locationSource, locationAccuracy, locationUpdatedAt]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        await import('leaflet/dist/leaflet.css');
        const leaflet = await import('leaflet');
        const markerIconMod: any = await import('leaflet/dist/images/marker-icon.png');
        const markerIcon2xMod: any = await import('leaflet/dist/images/marker-icon-2x.png');
        const markerShadowMod: any = await import('leaflet/dist/images/marker-shadow.png');

        if (cancelled) return;

        const L: any = (leaflet as any)?.default || leaflet;
        const markerIconUrl: string = String(markerIconMod?.default || markerIconMod || '');
        const markerIconRetinaUrl: string = String(markerIcon2xMod?.default || markerIcon2xMod || '');
        const markerShadowUrl: string = String(markerShadowMod?.default || markerShadowMod || '');

        const defaultIcon = L.icon({
          iconUrl: markerIconUrl,
          iconRetinaUrl: markerIconRetinaUrl,
          shadowUrl: markerShadowUrl,
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
      } catch {
      }
    })();

    return () => {
      cancelled = true;
    };
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
  };

  const saveStoreSettings = useCallback(async () => {
    setSaving(true);
    try {
      const currentForm = formRef.current;
      const currentCoords = coordsRef.current;
      const currentLocationMeta = locationMetaRef.current;
      const computedDisplayAddress = String(currentForm.displayAddress || '').trim() || String(shop?.addressDetailed || shop?.address_detailed || '').trim();
      const computedMapLabel = String(currentForm.mapLabel || '').trim() || String(shop?.name || '').trim();

      await ApiService.updateMyShop({
        ...(adminShopId ? { shopId: adminShopId } : {}),
        whatsapp: currentForm.whatsapp,
        customDomain: currentForm.customDomain,
        openingHours: currentForm.openingHours,
        displayAddress: computedDisplayAddress ? computedDisplayAddress : null,
        mapLabel: computedMapLabel ? computedMapLabel : null,
        latitude: currentCoords.lat,
        longitude: currentCoords.lng,
        locationSource: currentLocationMeta.locationSource ? currentLocationMeta.locationSource : undefined,
        locationAccuracy: currentLocationMeta.locationAccuracy,
        locationUpdatedAt: currentLocationMeta.locationUpdatedAt ? currentLocationMeta.locationUpdatedAt : undefined,
      });

      baselineFormRef.current = { ...currentForm };
      baselineCoordsRef.current = { lat: currentCoords.lat, lng: currentCoords.lng };
      baselineMetaRef.current = {
        locationSource: String(currentLocationMeta.locationSource || '').trim().toLowerCase(),
        locationAccuracy: currentLocationMeta.locationAccuracy,
        locationUpdatedAt: String(currentLocationMeta.locationUpdatedAt || ''),
      };
      try {
        window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'store', count: 0 } }));
      } catch {
      }
      toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات المتجر بنجاح' });
      onSaved();
      return true;
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : undefined;
      const msg = e?.message ? String(e.message) : '';
      const details = msg ? (status ? `${msg} (${status})` : msg) : status ? `(${status})` : '';
      toast({
        title: 'خطأ',
        description: details ? `فشل حفظ إعدادات المتجر: ${details}` : 'فشل حفظ إعدادات المتجر',
        variant: 'destructive',
      });
      throw e;
    } finally {
      setSaving(false);
    }
  }, [adminShopId, onSaved, shop?.addressDetailed, shop?.address_detailed, shop?.name, toast]);

  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent('merchant-settings-register-save-handler', {
          detail: { sectionId: 'store', handler: saveStoreSettings },
        }),
      );
    } catch {
    }
  }, [saveStoreSettings]);

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
        </Card>
      </form>

    </div>
  );
};

export default StoreSettings;
