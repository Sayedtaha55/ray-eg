import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Input, Button } from '../../common/ui';
import { Calendar, Clock, Users, MessageSquare } from 'lucide-react';

interface ReservationFormProps {
  onSubmit: (data: ReservationData) => void;
  loading?: boolean;
  error?: string;
}

interface ReservationData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  onSubmit,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState<ReservationData>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    specialRequests: '',
  });

  const handleChange = (field: keyof ReservationData) => (value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00'
  ];

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black text-white mb-2">حجز طاولة</h3>
          <p className="text-slate-400">احجز طاولتك الآن واستمتع بتجربة مميزة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            label="الاسم الكامل"
            placeholder="أدخل اسمك الكامل"
            value={formData.name}
            onChange={handleChange('name')}
            required
          />

          <Input
            type="email"
            label="البريد الإلكتروني"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange('email')}
            required
          />

          <Input
            type="tel"
            label="رقم الهاتف"
            placeholder="+20 123 456 7890"
            value={formData.phone}
            onChange={handleChange('phone')}
            required
          />

          <Input
            type="number"
            label="عدد الأشخاص"
            placeholder="2"
            value={formData.guests.toString()}
            onChange={(value) => handleChange('guests')(parseInt(value) || 1)}
            min="1"
            max="20"
            required
            icon={<Users size={20} />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="التاريخ"
            value={formData.date}
            onChange={handleChange('date')}
            required
            icon={<Calendar size={20} />}
            min={new Date().toISOString().split('T')[0]}
          />

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              الوقت
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {timeSlots.map((time) => (
                <motion.button
                  key={time}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChange('time')(time)}
                  className={`p-2 rounded-lg text-sm font-bold transition-all ${
                    formData.time === time
                      ? 'bg-[#00E5FF] text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {time}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            طلبات خاصة
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => handleChange('specialRequests')(e.target.value)}
            placeholder="أي طلبات خاصة أو ملاحظات..."
            rows={4}
            className="w-full bg-slate-800 border-none rounded-2xl py-5 px-8 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all resize-none"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 font-bold">
            {error}
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          disabled={!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time}
          className="w-full py-4"
        >
          تأكيد الحجز
        </Button>
      </form>
    </Card>
  );
};

export default ReservationForm;
