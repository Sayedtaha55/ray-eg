'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Spinner = () => <div className="h-12 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900" /></div>;

const AddProductModalRouter = dynamic(() => import('./add-product-activities/AddProductModalRouter'), { ssr: false, loading: Spinner });
const EditProductModal = dynamic(() => import('./EditProductModal'), { ssr: false, loading: Spinner });
const CreateOfferModal = dynamic(() => import('./CreateOfferModal'), { ssr: false, loading: Spinner });
const ShopImageMapEditorModal = dynamic(() => import('./ShopImageMapEditorModal'), { ssr: false, loading: Spinner });

export { AddProductModalRouter, EditProductModal, CreateOfferModal, ShopImageMapEditorModal };
