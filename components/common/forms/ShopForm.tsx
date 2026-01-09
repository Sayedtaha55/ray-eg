import React, { useState } from 'react';
import { Button, Input } from '../ui';
import { Store, Phone, MapPin, FileText, Mail } from 'lucide-react';

interface ShopFormProps {
  onSubmit: (shopData: ShopFormData) => void;
  loading?: boolean;
  error?: string;
  initialData?: Partial<ShopFormData>;
}

interface ShopFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
}

const ShopForm: React.FC<ShopFormProps> = ({
  onSubmit,
  loading = false,
  error,
  initialData,
}) => {
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    ...initialData,
  });

  const handleChange = (field: keyof ShopFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="text"
        label="اسم المتجر"
        placeholder="أدخل اسم المتجر"
        value={formData.name}
        onChange={handleChange('name')}
        required
        icon={<Store size={20} />}
      />

      <Input
        type="email"
        label="البريد الإلكتروني"
        placeholder="shop@example.com"
        value={formData.email}
        onChange={handleChange('email')}
        required
        icon={<Mail size={20} />}
      />
      
      <Input
        type="tel"
        label="رقم الهاتف"
        placeholder="+20 123 456 7890"
        value={formData.phone}
        onChange={handleChange('phone')}
        required
        icon={<Phone size={20} />}
      />

      <Input
        type="text"
        label="العنوان"
        placeholder="أدخل العنوان الكامل"
        value={formData.address}
        onChange={handleChange('address')}
        required
        icon={<MapPin size={20} />}
      />

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          الوصف
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description')(e.target.value)}
          placeholder="اكتب وصفاً للمتجر..."
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
        disabled={!formData.name || !formData.email || !formData.phone || !formData.address}
        className="w-full py-4"
      >
        حفظ بيانات المتجر
      </Button>
    </form>
  );
};

export default ShopForm;
