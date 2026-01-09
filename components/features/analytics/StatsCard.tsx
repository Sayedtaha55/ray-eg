import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../common/ui';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'error' | 'warning';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary',
}) => {
  const colorClasses = {
    primary: 'bg-[#00E5FF]/20 text-[#00E5FF]',
    success: 'bg-green-500/20 text-green-500',
    error: 'bg-red-500/20 text-red-500',
    warning: 'bg-yellow-500/20 text-yellow-500',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-black uppercase tracking-widest mb-2">
            {title}
          </p>
          <p className="text-3xl font-black text-white mb-2">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-bold ${
                  change.type === 'increase' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              <span className="text-slate-400 text-sm">من الشهر الماضي</span>
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}
        >
          {icon}
        </motion.div>
      </div>
    </Card>
  );
};

export default StatsCard;
