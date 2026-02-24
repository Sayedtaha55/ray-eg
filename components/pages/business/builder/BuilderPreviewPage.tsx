import React, { useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import ShopProfilePreview from '@/components/pages/business/builder/ShopProfilePreview';

const { useLocation } = ReactRouterDOM as any;

const BuilderPreviewPage: React.FC = () => {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(String(location?.search || '')), [location?.search]);
  const page = ((): 'home' | 'product' | 'gallery' | 'info' => {
    const raw = String(query.get('page') || 'home').trim();
    if (raw === 'product' || raw === 'gallery' || raw === 'info') return raw;
    return 'home';
  })();

  const [config, setConfig] = useState<any>({});
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [isPreviewHeaderMenuOpen, setIsPreviewHeaderMenuOpen] = useState(false);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('ray_builder_preview_design');
        const parsed = raw ? JSON.parse(raw) : null;
        setConfig(parsed && typeof parsed === 'object' ? parsed : {});
      } catch {
        setConfig({});
      }
      try {
        const rawLogo = localStorage.getItem('ray_builder_preview_logo');
        setLogoDataUrl(String(rawLogo || '').trim());
      } catch {
        setLogoDataUrl('');
      }
    };

    load();
    const onUpdate = () => load();
    window.addEventListener('ray-builder-preview-update', onUpdate as any);

    const onStorage = (e: StorageEvent) => {
      if (!e) return;
      if (e.key === 'ray_builder_preview_design' || e.key === 'ray_builder_preview_logo') load();
    };
    window.addEventListener('storage', onStorage as any);

    return () => {
      window.removeEventListener('ray-builder-preview-update', onUpdate as any);
      window.removeEventListener('storage', onStorage as any);
    };
  }, []);

  return (
    <div className="w-full h-full">
      <ShopProfilePreview
        page={page}
        config={config}
        shop={{ id: 'preview', name: 'معاينة المتجر' }}
        logoDataUrl={logoDataUrl}
        isPreviewHeaderMenuOpen={isPreviewHeaderMenuOpen}
        setIsPreviewHeaderMenuOpen={setIsPreviewHeaderMenuOpen}
      />
    </div>
  );
};

export default React.memo(BuilderPreviewPage);
