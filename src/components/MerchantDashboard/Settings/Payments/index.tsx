import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api.service';

interface PaymentsProps {
  shop: any;
  onSaved: () => void;
  adminShopId?: string;
}

const Payments: React.FC<PaymentsProps> = ({ shop, onSaved, adminShopId }) => {
  const { toast } = useToast();
  const [, setSaving] = useState(false);
  const [merchantId, setMerchantId] = useState(String(shop?.paymentConfig?.merchantId || ''));
  const [publicKey, setPublicKey] = useState(String(shop?.paymentConfig?.publicKey || ''));

  const baselineRef = React.useRef({ merchantId: String(shop?.paymentConfig?.merchantId || ''), publicKey: String(shop?.paymentConfig?.publicKey || '') });

  React.useEffect(() => {
    baselineRef.current = { merchantId: String(shop?.paymentConfig?.merchantId || ''), publicKey: String(shop?.paymentConfig?.publicKey || '') };
    setMerchantId(String(shop?.paymentConfig?.merchantId || ''));
    setPublicKey(String(shop?.paymentConfig?.publicKey || ''));
    try {
      window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'payments', count: 0 } }));
    } catch {
    }
  }, [shop?.paymentConfig?.merchantId, shop?.paymentConfig?.publicKey]);

  React.useEffect(() => {
    const base = baselineRef.current;
    const count = (String(merchantId) !== String(base.merchantId) ? 1 : 0) + (String(publicKey) !== String(base.publicKey) ? 1 : 0);
    try {
      window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'payments', count } }));
    } catch {
    }
  }, [merchantId, publicKey]);

  const savePayments = useCallback(async () => {
    setSaving(true);
    try {
      await ApiService.updateMyShop({
        ...(adminShopId ? { shopId: adminShopId } : {}),
        paymentConfig: {
          merchantId: String(merchantId || ''),
          publicKey: String(publicKey || ''),
        },
      });
      toast({ title: 'تم الحفظ', description: 'تم تحديث إعدادات المدفوعات بنجاح' });
      baselineRef.current = { merchantId, publicKey };
      try {
        window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'payments', count: 0 } }));
      } catch {
      }
      onSaved();
      return true;
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء حفظ التغييرات', variant: 'destructive' });
      return false;
    } finally {
      setSaving(false);
    }
  }, [adminShopId, merchantId, publicKey, toast, onSaved]);

  React.useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent('merchant-settings-register-save-handler', { detail: { sectionId: 'payments', handler: savePayments } }));
    } catch {
    }
  }, [savePayments]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">المدفوعات</h1>
        <p className="text-muted-foreground">إعداد بوابة الدفع وبيانات التاجر</p>
      </div>

      <form onSubmit={onSubmit}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>بيانات بوابة الدفع</CardTitle>
            <CardDescription>أضف مفاتيح بوابة الدفع الخاصة بك.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="merchantId">Merchant ID</Label>
              <Input id="merchantId" value={merchantId} onChange={(e) => setMerchantId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicKey">Public Key</Label>
              <Input id="publicKey" value={publicKey} onChange={(e) => setPublicKey(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Payments;
