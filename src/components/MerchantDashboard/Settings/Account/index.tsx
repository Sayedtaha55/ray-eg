import React, { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api.service';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountProps {
  shop: any;
  onSaved: () => void;
  adminShopId?: string;
}

const Account: React.FC<AccountProps> = ({ shop, onSaved, adminShopId }) => {
  const { toast } = useToast();
  const [, setIsSaving] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
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

  const baselineRef = React.useRef(formData);
  const formRef = React.useRef(formData);
  React.useEffect(() => {
    formRef.current = formData;
  }, [formData]);

  const emitAccountChanges = (count: number) => {
    try {
      window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'account', count } }));
    } catch {
    }
  };

  React.useEffect(() => {
    const initial = {
      name: shop?.name || '',
      governorate: shop?.governorate || '',
      city: shop?.city || '',
      category: shop?.category || 'RETAIL',
      email: shop?.email || '',
      phone: shop?.phone || '',
      address: shop?.addressDetailed || shop?.address_detailed || '',
      description: shop?.description || '',
    };
    baselineRef.current = initial;
    setFormData(initial);
    emitAccountChanges(0);
  }, [shop?.name, shop?.governorate, shop?.city, shop?.category, shop?.email, shop?.phone, shop?.addressDetailed, shop?.address_detailed, shop?.description]);

  React.useEffect(() => {
    const base = baselineRef.current;
    const next = formData;
    const count =
      (String(next.name) !== String(base.name) ? 1 : 0) +
      (String(next.governorate) !== String(base.governorate) ? 1 : 0) +
      (String(next.city) !== String(base.city) ? 1 : 0) +
      (String(next.category) !== String(base.category) ? 1 : 0) +
      (String(next.email) !== String(base.email) ? 1 : 0) +
      (String(next.phone) !== String(base.phone) ? 1 : 0) +
      (String(next.address) !== String(base.address) ? 1 : 0) +
      (String(next.description) !== String(base.description) ? 1 : 0);
    emitAccountChanges(count);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveAccount = useCallback(async () => {
    setIsSaving(true);
    
    try {
      const current = formRef.current;
      await ApiService.updateMyShop({
        ...(adminShopId ? { shopId: adminShopId } : {}),
        name: current.name,
        governorate: current.governorate,
        city: current.city,
        category: current.category,
        email: current.email,
        phone: current.phone,
        addressDetailed: current.address,
        description: current.description,
      });
      
      toast({
        title: "تم الحفظ",
        description: "تم تحديث معلومات الحساب بنجاح",
      });
      
      baselineRef.current = { ...current };
      emitAccountChanges(0);
      onSaved();
      return true;
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التغييرات",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [adminShopId, onSaved, toast]);

  React.useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent('merchant-settings-register-save-handler', {
          detail: { sectionId: 'account', handler: saveAccount },
        }),
      );
    } catch {
    }
  }, [saveAccount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const deactivateAccount = async () => {
    if (adminShopId) {
      toast({
        title: 'غير متاح',
        description: 'لا يمكن حذف الحساب أثناء وضع الإدارة/الانتحال',
        variant: 'destructive',
      });
      return;
    }

    if (isDeleting) return;

    const expected = 'حذف';
    if (String(deleteConfirmText || '').trim() !== expected) {
      toast({
        title: 'تأكيد مطلوب',
        description: `اكتب كلمة "${expected}" للتأكيد`,
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      await ApiService.deactivateMyAccount();
      try {
        localStorage.removeItem('ray_user');
        localStorage.removeItem('ray_token');
        window.dispatchEvent(new Event('auth-change'));
      } catch {
      }

      toast({
        title: 'تم حذف الحساب',
        description: 'تم تعطيل حسابك بنجاح',
      });

      try {
        window.location.href = '/login';
      } catch {
      }
    } catch (error: any) {
      const msg = error?.message ? String(error.message) : 'حدث خطأ أثناء حذف الحساب';
      toast({
        title: 'خطأ',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
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
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600">حذف الحساب</CardTitle>
            <CardDescription>
              سيتم تعطيل الحساب والمتجر. هذا الإجراء لا يمكن التراجع عنه بسهولة.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">لتأكيد الحذف اكتب: حذف</Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                disabled={isDeleting}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={deactivateAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'جاري الحذف...' : 'حذف الحساب'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Account;
