import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button, SmartImage } from '../../common/ui';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { getOptimizedImageUrl } from '../../../lib/image-utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviews: number;
    category: string;
    inStock: boolean;
    discount?: number;
  };
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

/**
 * Optimized ProductCard component.
 * Performance improvements:
 * ⚡ Uses SmartImage for skeleton loading and smooth transitions
 * ⚡ Uses getOptimizedImageUrl to serve a medium-sized (md) variant, reducing bandwidth and memory
 * ⚡ Added decoding="async" via SmartImage to prevent main thread blocking
 */
const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <Card hover clickable className="overflow-hidden group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <SmartImage
          src={getOptimizedImageUrl(product.image, 'md')}
          alt={product.name}
          loading="lazy"
          className="w-full h-full"
          imgClassName="group-hover:scale-110 transition-transform duration-300 object-cover"
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <Badge variant="error" className="absolute top-3 right-3">
            -{discountPercentage}%
          </Badge>
        )}
        
        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggleFavorite?.(product.id)}
          className={`absolute top-3 left-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
            isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart size={16} className="sm:w-[18px] sm:h-[18px]" fill={isFavorite ? 'currentColor' : 'none'} />
        </motion.button>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {product.category}
          </span>
          {!product.inStock && (
            <Badge variant="error" size="sm">نفد المخزون</Badge>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-white font-black text-sm line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-white text-sm font-bold">{product.rating}</span>
          </div>
          <span className="text-slate-400 text-xs">({product.reviews} تقييم)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-black text-white">
            {product.price} ج.م
          </span>
          {product.originalPrice && (
            <span className="text-sm text-slate-400 line-through">
              {product.originalPrice} ج.م
            </span>
          )}
        </div>

        {/* Actions */}
        <Button
          size="sm"
          onClick={() => onAddToCart?.(product.id)}
          disabled={!product.inStock}
          className="w-full"
        >
          <ShoppingCart size={16} />
          {product.inStock ? 'أضف للسلة' : 'غير متوفر'}
        </Button>
      </div>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
