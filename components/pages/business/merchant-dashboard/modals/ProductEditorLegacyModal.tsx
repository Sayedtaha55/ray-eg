import React, { Suspense, lazy } from 'react';
import { X } from 'lucide-react';

const ProductEditorLegacyApp = lazy(() => import('@/src/features/product-editor/legacy/App'));

type Props = {
  open: boolean;
  onClose: () => void;
  shopId: string;
};

const ProductEditorLegacyModal: React.FC<Props> = ({ open, onClose, shopId }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-0">
        <div className="absolute top-4 right-4 z-[410]">
          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/15 border border-white/10"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="w-full h-full overflow-auto" dir="rtl">
          <Suspense fallback={null}>
            <ProductEditorLegacyApp shopId={shopId} onClose={onClose} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ProductEditorLegacyModal;
