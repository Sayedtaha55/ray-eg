import React, { memo } from 'react';

interface PurchaseHeaderProps {
  shopName: string;
  onBack: () => void;
}

const PurchaseHeader: React.FC<PurchaseHeaderProps> = ({ shopName, onBack }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-[60] p-3 sm:p-6 flex justify-between items-center pointer-events-none">
      <button
        onClick={onBack}
        className="pointer-events-auto bg-black/50 backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-2xl hover:bg-white/10 transition-all font-black text-sm active:scale-90"
        type="button"
      >
        رجوع
      </button>
      <div className="pointer-events-auto bg-black/50 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 text-white font-black text-sm shadow-2xl">
        {shopName ? `تسوق من ${shopName}` : 'وضع الشراء بالتصفح'}
      </div>
    </div>
  );
};

export default memo(PurchaseHeader);
