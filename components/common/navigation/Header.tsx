import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Search, ShoppingCart, User } from 'lucide-react';
import { Button, Input } from '../ui';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
  cartItemsCount?: number;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  isMenuOpen = false,
  cartItemsCount = 0,
  userName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              onClick={onMenuToggle}
              className="p-2 text-white hover:bg-white/10 rounded-xl transition-all md:hidden"
            >
              {isMenuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00E5FF] to-[#BD00FF] rounded-xl" />
              <span className="text-lg sm:text-xl font-black text-white">MNMKNK</span>
            </div>
          </motion.div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Input
              type="text"
              placeholder="ابحث عن متاجر، منتجات، أو خدمات..."
              value={searchQuery}
              onChange={setSearchQuery}
              icon={<Search size={20} />}
              className="bg-white/5"
            />
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {/* Mobile Search */}
            <button type="button" aria-label="بحث" className="p-2 text-white hover:bg-white/10 rounded-xl transition-all md:hidden">
              <Search size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Cart */}
            <button type="button" aria-label="السلة" className="relative p-2 text-white hover:bg-white/10 rounded-xl transition-all">
              <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#00E5FF] text-black text-[10px] sm:text-xs font-black rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User */}
            {userName ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl">
                <User size={14} className="sm:w-4 sm:h-4" />
                <span className="text-white text-sm font-bold hidden sm:block">
                  {userName}
                </span>
              </div>
            ) : (
              <Button size="sm" variant="ghost">
                تسجيل الدخول
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Header;
