'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label, Input } from '../ui';
import { useToast } from '../ToastProvider';
import { apiRequest } from '@/lib/auth';

interface PaymentsTabProps {
  shop: any;
  onSaved: () => void;
}

export default function PaymentsTab({ shop, onSaved }: PaymentsTabProps) {
  const { toast } = useToast();
  const [, setSaving] = useState(false);
  const [merchantId, setMerchantId] = useState(String(shop?.paymentConfig?.merchantId || ''));
  const [publicKey, setPublicKey] = useState(String(shop?.paymentConfig?.publicKey || ''));
  const baselineRef = useRef({ merchantId: String(shop?.paymentConfig?.merchantId || ''), publicKey: String(shop?.paymentConfig?.publicKey || '') });

  useEffect(() => {
    baselineRef.current = { merchantId: String(shop?.paymentConfig?.merchantId || ''), publicKey: String(shop?.paymentConfig?.publicKey || '') };
    setMerchantId(String(shop?.paymentConfig?.merchantId || ''));
    setPublicKey(String(shop?.paymentConfig?.publicKey || ''));
    try { window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'payments', count: 0 } })); } catch {}
  }, [shop?.paymentConfig?.merchantId, shop?.paymentConfig?.publicKey]);

  useEffect(() => {
    const base = baselineRef.current;
    const count = (String(merchantId) !== String(base.merchantId) ? 1 : 0) + (String(publicKey) !== String(base.publicKey) ? 1 : 0);
    try { window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'payments', count } })); } catch {}
  }, [merchantId, publicKey]);

  const savePayments = useCallback(async () => {
    setSaving(true);
    try {
      await apiRequest('/shops/me', {
        method: 'PATCH',
        body: JSON.stringify({ paymentConfig: { merchantId: String(merchantId || ''), publicKey: String(publicKey || '') } }),
      });
      toast({ title: 'تم الحفظ', description: 'تم تحديث إعدادات الدفع' });
      baselineRef.current = { merchantId, publicKey };
      try { window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'payments', count: 0 } })); } catch {}
      onSaved();
      return true;
    } catch {
      toast({ title: 'خطأ', description: 'فشل حفظ إعدادات الدفع', variant: 'destructive' });
      return false;
    } finally {
      setSaving(false);
    }
  }, [shop?.id, merchantId, publicKey, toast, onSaved]);

  useEffect(() => {
    try { window.dispatchEvent(new CustomEvent('merchant-settings-register-save-handler', { detail: { sectionId: 'payments', handler: savePayments } })); } catch {}
  }, [savePayments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">المدفوعات</h1>
        <p className="text-slate-500 text-sm mt-1">إعداد بوابة الدفع الإلكتروني</p>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل بوابة الدفع</CardTitle>
            <CardDescription>أدخل بيانات بوابة الدفع الخاصة بك</CardDescription>
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
}
