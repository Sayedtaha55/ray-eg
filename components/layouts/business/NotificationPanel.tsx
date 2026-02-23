import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';

const MotionDiv = motion.div as any;

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: any[];
  onMarkRead: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, notifications, onMarkRead }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[300]"
          />
          <MotionDiv
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[310] flex flex-col"
          >
            <header className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-row-reverse">
                <Bell className="w-5 h-5 text-slate-900" />
                <h3 className="font-black text-lg">التنبيهات</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Bell className="w-12 h-12 opacity-20" />
                  <p className="font-bold">لا توجد تنبيهات حالياً</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      n.is_read ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-100 shadow-sm'
                    }`}
                  >
                    <h4 className="font-black text-sm text-slate-900 mb-1">{n.title}</h4>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">{n.content}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(n.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <footer className="p-4 border-t border-slate-100">
                <button
                  onClick={onMarkRead}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-black transition-all"
                >
                  تحديد الكل كمقروء
                </button>
              </footer>
            )}
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
};

export default React.memo(NotificationPanel);
