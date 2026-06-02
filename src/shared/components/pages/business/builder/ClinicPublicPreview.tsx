import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Stethoscope,
  User2,
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
    // Use dynamic data from sidebar if available, else defaults
    if (Array.isArray(config.clinicSpecialtiesList) && config.clinicSpecialtiesList.length > 0) {
      return config.clinicSpecialtiesList.map((s: any) => ({
        ...s,
        icon: s.icon || null,
      }));
    }
    return [
      { id: 'dentistry', name: t('business.builder.clinicPreview.specialties.dentistry'), iconName: 'Stethoscope', icon: <Stethoscope size={18} /> },
      { id: 'dermatology', name: t('business.builder.clinicPreview.specialties.dermatology'), iconName: 'Shield', icon: <Shield size={18} /> },
      { id: 'pediatrics', name: t('business.builder.clinicPreview.specialties.pediatrics'), iconName: 'User2', icon: <User2 size={18} /> },
      { id: 'orthopedics', name: t('business.builder.clinicPreview.specialties.orthopedics'), iconName: 'CheckCircle2', icon: <CheckCircle2 size={18} /> },
    ];
  }, [t, config.clinicSpecialtiesList]);

  const doctors = useMemo(() => {
    // Use dynamic data from sidebar if available, else defaults
    if (Array.isArray(config.clinicDoctorsList) && config.clinicDoctorsList.length > 0) {
      return config.clinicDoctorsList;
    }
    return [
      {
        id: 'd1',
        name: t('business.builder.clinicPreview.doctors.d1.name'),
        title: t('business.builder.clinicPreview.doctors.d1.title'),
        rating: 4.9,
        reviews: 320,
        next: t('business.builder.clinicPreview.doctors.d1.next'),
      },
      {
        id: 'd2',
        name: t('business.builder.clinicPreview.doctors.d2.name'),
        title: t('business.builder.clinicPreview.doctors.d2.title'),
        rating: 4.8,
        reviews: 210,
        next: t('business.builder.clinicPreview.doctors.d2.next'),
      },
      {
        id: 'd3',
        name: t('business.builder.clinicPreview.doctors.d3.name'),
        title: t('business.builder.clinicPreview.doctors.d3.title'),
        rating: 4.7,
        reviews: 185,
        next: t('business.builder.clinicPreview.doctors.d3.next'),
      },
    ];
  }, [t, config.clinicDoctorsList]);

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
    return doctors.filter((d) => String(d.name).toLowerCase().includes(q) || String(d.title).toLowerCase().includes(q));
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
