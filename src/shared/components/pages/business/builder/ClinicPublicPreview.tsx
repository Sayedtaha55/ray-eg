import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ClinicTheme1 from './ClinicTheme1';
import ClinicTheme2 from './ClinicTheme2';

type Props = {
  config: any;
  logoDataUrl?: string;
  shop?: any;
};

const ClinicPublicPreview: React.FC<Props> = ({ config, logoDataUrl, shop }) => {
  const { t } = useTranslation();
  const primary = String((config as any)?.primaryColor || '#0EA5E9');
  const secondary = String((config as any)?.secondaryColor || '#0369A1');
  const pageBg = String((config as any)?.pageBackgroundColor || '#FFFFFF');

  const [query, setQuery] = useState('');

  const specialties = useMemo(() => {
    if (Array.isArray(config.clinicSpecialtiesList)) {
      return config.clinicSpecialtiesList.map((s: any) => ({
        ...s,
        icon: s.icon || null,
      }));
    }
    return [];
  }, [config.clinicSpecialtiesList]);

  const doctors = useMemo(() => {
    if (Array.isArray(config.clinicDoctorsList)) {
      return config.clinicDoctorsList;
    }
    return [];
  }, [config.clinicDoctorsList]);

  const slots = useMemo(() => {
    // Use dynamic data from sidebar if available, else defaults
    if (Array.isArray(config.clinicSlotsList) && config.clinicSlotsList.length > 0) {
      return config.clinicSlotsList;
    }
    return [
      { time: '05:30', label: t('business.builder.clinicPreview.slots.s0530'), available: true },
      { time: '06:00', label: t('business.builder.clinicPreview.slots.s0600'), available: true },
      { time: '06:30', label: t('business.builder.clinicPreview.slots.s0630'), available: false },
      { time: '07:00', label: t('business.builder.clinicPreview.slots.s0700'), available: true },
      { time: '07:30', label: t('business.builder.clinicPreview.slots.s0730'), available: true },
      { time: '08:00', label: t('business.builder.clinicPreview.slots.s0800'), available: true },
    ];
  }, [t, config.clinicSlotsList]);

  const testimonials = useMemo(
    () => [
      { id: 't1', name: t('business.builder.clinicPreview.testimonials.t1.name'), rating: 5, text: t('business.builder.clinicPreview.testimonials.t1.text') },
      { id: 't2', name: t('business.builder.clinicPreview.testimonials.t2.name'), rating: 5, text: t('business.builder.clinicPreview.testimonials.t2.text') },
      { id: 't3', name: t('business.builder.clinicPreview.testimonials.t3.name'), rating: 4, text: t('business.builder.clinicPreview.testimonials.t3.text') },
    ],
    [t]
  );

  const filteredDoctors = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d: any) => String(d.name).toLowerCase().includes(q) || String(d.title).toLowerCase().includes(q));
  }, [doctors, query]);

  const clinicLayout = String((config as any)?.clinicLayout || 'classic_grid');

  if (clinicLayout === 'banner_promo_booking') {
    return (
      <ClinicTheme2
        config={config}
        logoDataUrl={logoDataUrl}
        primary={primary}
        secondary={secondary}
        pageBg={pageBg}
        specialties={specialties}
        doctors={doctors}
        slots={slots}
        testimonials={testimonials}
        query={query}
        setQuery={setQuery}
        filteredDoctors={filteredDoctors}
        shop={shop}
      />
    );
  }

  return (
    <ClinicTheme1
      config={config}
      logoDataUrl={logoDataUrl}
      primary={primary}
      secondary={secondary}
      pageBg={pageBg}
      specialties={specialties}
      doctors={doctors}
      slots={slots}
      testimonials={testimonials}
      query={query}
      setQuery={setQuery}
      filteredDoctors={filteredDoctors}
      shop={shop}
    />
  );
};

export default React.memo(ClinicPublicPreview);
