import React from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../../common/ui';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variant?: string;
  };
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex gap-4">
        {/* Product Image */}
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 rounded-xl object-cover"
        />

        {/* Product Details */}
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="text-white font-black">{item.name}</h3>
            {item.variant && (
              <p className="text-slate-400 text-sm">{item.variant}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#00E5FF] font-black text-lg">
              {item.price} ج.م
            </span>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDecrease}
                disabled={item.quantity <= 1}
                className="w-8 h-8 bg-white/10 text-white rounded-lg flex items-center justify-center hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus size={14} />
              </motion.button>

              <span className="text-white font-bold w-8 text-center">
                {item.quantity}
              </span>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleIncrease}
                className="w-8 h-8 bg-white/10 text-white rounded-lg flex items-center justify-center hover:bg-white/20"
              >
                <Plus size={14} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRemove(item.id)}
                className="w-8 h-8 bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500/30 ml-2"
              >
                <Trash2 size={14} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;
