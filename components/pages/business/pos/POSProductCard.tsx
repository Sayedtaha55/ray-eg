import React from 'react';
import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';

const MotionDiv = motion.div as any;

interface POSProductCardProps {
  product: any;
  addToCart: (product: any, qty?: number) => void;
  isProductHasMenuVariants: (product: any) => boolean;
  isProductHasFashionDifferentSizePrices: (product: any) => boolean;
  getProductEffectivePrice: (product: any) => number;
  getProductStock: (product: any) => number;
  isProductTrackStockEnabled: (product: any) => boolean;
}

const POSProductCard: React.FC<POSProductCardProps> = ({
  product,
  addToCart,
  isProductHasMenuVariants,
  isProductHasFashionDifferentSizePrices,
  getProductEffectivePrice,
  getProductStock,
  isProductTrackStockEnabled,
}) => {
  const stock = getProductStock(product);
  const isOutOfStock = stock <= 0;
  const hasVariants = isProductHasMenuVariants(product) || isProductHasFashionDifferentSizePrices(product);

  return (
    <MotionDiv
      whileTap={{ scale: 0.95 }}
      onClick={() => !isOutOfStock && addToCart(product, 1)}
      className={`relative active:scale-[0.97] ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} aspect-square`}
    >
      <div className={`w-full h-full rounded-lg md:rounded-[1.8rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#BD00FF] transition-all group overflow-hidden relative`}>
        <div className="absolute inset-0">
          {hasVariants && (
            <div className="absolute top-1 right-1 z-10">
              <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-slate-100">
                <Ruler size={14} className="text-[#BD00FF]" />
              </div>
            </div>
          )}
          
          <img
            src={product.imageUrl || '/brand/logo.png'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            alt={product.name}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 text-right">
            <h3 className="text-white font-black text-[10px] md:text-sm line-clamp-2 leading-tight mb-1">
              {product.name}
            </h3>
            <div className="flex items-center justify-between flex-row-reverse">
              <span className="text-[#00E5FF] font-black text-[10px] md:text-sm">
                ج.م {getProductEffectivePrice(product).toFixed(0)}
              </span>
              {isProductTrackStockEnabled(product) && (
                <span className={`text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isOutOfStock ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'}`}>
                  {isOutOfStock ? 'نفذ' : `${stock} ق`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default POSProductCard;
