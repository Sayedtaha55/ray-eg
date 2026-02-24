import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { Input, Loading } from '../../common/ui';
import { Search, Filter, Grid, List } from 'lucide-react';

interface Product {
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
}

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favoriteProducts?: Set<string>;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading = false,
  onAddToCart,
  onToggleFavorite,
  favoriteProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Stabilize the favoriteProducts Set to avoid re-renders if the prop is undefined
  const safeFavoriteProducts = useMemo(() => favoriteProducts || new Set<string>(), [favoriteProducts]);

  // Memoize event handlers to maintain stable references for memoized child components
  const handleAddToCart = useCallback((productId: string) => {
    onAddToCart?.(productId);
  }, [onAddToCart]);

  const handleToggleFavorite = useCallback((productId: string) => {
    onToggleFavorite?.(productId);
  }, [onToggleFavorite]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading text="جاري تحميل المنتجات..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="ابحث عن منتجات..."
            value={searchQuery}
            onChange={setSearchQuery}
            icon={<Search size={20} />}
          />
        </div>
        
        <div className="flex gap-2">
          <button className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all">
            <Filter size={20} />
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
          >
            {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          تم العثور على {filteredProducts.length} منتج
        </p>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg font-bold">
            لم يتم العثور على منتجات مطابقة
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.1, 0.5) }}
              layout
            >
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={safeFavoriteProducts.has(product.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ProductList;
