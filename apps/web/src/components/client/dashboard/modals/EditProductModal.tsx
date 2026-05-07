'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onUpdated: () => void;
};

const EditProductModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const t = useT();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 relative">
        <button onClick={onClose} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-black text-slate-900 text-right mb-6">{t('business.products.editProduct')}</h2>
      </div>
    </div>
  );
};

export default EditProductModal;
