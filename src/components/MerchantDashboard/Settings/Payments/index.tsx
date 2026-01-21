import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface PaymentsProps {
  shop: any;
  onSaved: () => void;
}

const Payments: React.FC<PaymentsProps> = ({ shop, onSaved }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [merchantId, setMerchantId] = useState(String(shop?.paymentConfig?.merchantId || ''));
  const [publicKey, setPublicKey] = useState(String(shop?.paymentConfig?.publicKey || ''));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      toast({ title: 'تم الحفظ', description: 'تم تحديث إعدادات المدفوعات بنجاح' });
      onSaved();
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء حفظ التغييرات', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
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
          <CardFooter className="flex justify-end border-t px-6 py-4">
            <Button type="submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default Payments;
