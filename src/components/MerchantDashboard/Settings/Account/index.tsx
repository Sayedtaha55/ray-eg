import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api.service';
import { Loader2, User, Mail, Phone, MapPin, Save } from 'lucide-react';

interface AccountProps {
  shop: any;
  onSaved: () => void;
  adminShopId?: string;
}

const Account: React.FC<AccountProps> = ({ shop, onSaved, adminShopId }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: shop?.name || '',
    governorate: shop?.governorate || '',
    city: shop?.city || '',
    category: shop?.category || 'RETAIL',
    email: shop?.email || '',
    phone: shop?.phone || '',
    address: shop?.addressDetailed || shop?.address_detailed || '',
    description: shop?.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await ApiService.updateMyShop({
        ...(adminShopId ? { shopId: adminShopId } : {}),
        name: formData.name,
        governorate: formData.governorate,
        city: formData.city,
        category: formData.category,
        email: formData.email,
        phone: formData.phone,
        addressDetailed: formData.address,
        description: formData.description,
      });
      
      toast({
        title: "تم الحفظ",
        description: "تم تحديث معلومات الحساب بنجاح",
      });
      
      onSaved();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التغييرات",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">معلومات الحساب</h1>
        <p className="text-muted-foreground">إدارة معلومات الحساب وتفاصيل الاتصال</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>البيانات الأساسية</CardTitle>
            <CardDescription>
              قم بتحديث معلومات الحساب الأساسية مثل الاسم والبريد الإلكتروني ورقم الهاتف.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المتجر</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <User className="w-4 h-4" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pr-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pr-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">نوع المتجر</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                >
                  <option value="RETAIL">محل تجاري</option>
                  <option value="RESTAURANT">مطعم / كافيه</option>
                  <option value="SERVICE">خدمات</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="governorate">المحافظة</Label>
                <Input id="governorate" name="governorate" value={formData.governorate} onChange={handleChange} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <Phone className="w-4 h-4" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pr-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-start pt-3 pr-3 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="pr-10"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">وصف المتجر</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="أدخل وصفاً لمتجرك"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t px-6 py-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default Account;
