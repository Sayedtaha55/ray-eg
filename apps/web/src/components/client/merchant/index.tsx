'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const PulseBlock = () => <div className="h-40 bg-white rounded-[3rem] animate-pulse" />;

const ClinicOverviewPage = dynamic(() => import('../clinic/ClinicOverviewPage'), { ssr: false, loading: PulseBlock });
const ClinicBookingsPage = dynamic(() => import('../clinic/ClinicBookingsPage'), { ssr: false, loading: PulseBlock });
const ClinicBookingManagementPage = dynamic(() => import('../clinic/ClinicBookingManagementPage'), { ssr: false, loading: PulseBlock });
const ClinicDesignPage = dynamic(() => import('../clinic/ClinicDesignPage'), { ssr: false, loading: PulseBlock });
const ClinicSettingsPage = dynamic(() => import('../clinic/ClinicSettingsPage'), { ssr: false, loading: PulseBlock });
const ClinicLayoutPage = dynamic(() => import('../clinic/ClinicLayoutPage'), { ssr: false, loading: PulseBlock });

const BookingsPage = dynamic(() => import('../bookings/BookingsPage'), { ssr: false, loading: PulseBlock });

const MerchantProfilePage = dynamic(() => import('./MerchantProfilePage'), { ssr: false, loading: PulseBlock });

const ShopProfilePreview = dynamic(() => import('../builder/ShopProfilePreview'), { ssr: false, loading: PulseBlock });
const ProductPagePreview = dynamic(() => import('../builder/ProductPagePreview'), { ssr: false, loading: PulseBlock });
const ClinicPublicPreview = dynamic(() => import('../builder/ClinicPublicPreview'), { ssr: false, loading: PulseBlock });

const PortalEditListingPage = dynamic(() => import('../portal/PortalEditListingPage'), { ssr: false, loading: PulseBlock });

export {
  ClinicOverviewPage, ClinicBookingsPage, ClinicBookingManagementPage,
  ClinicDesignPage, ClinicSettingsPage, ClinicLayoutPage,
  BookingsPage, MerchantProfilePage,
  ShopProfilePreview, ProductPagePreview, ClinicPublicPreview,
  PortalEditListingPage,
};
