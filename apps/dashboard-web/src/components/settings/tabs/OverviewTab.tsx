'use client';

import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Info, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui';
import { useRouter, useSearchParams } from 'next/navigation';

interface OverviewTabProps {
  shop: any;
}

export default function OverviewTab({ shop }: OverviewTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigateToTab = (tab: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', tab);
    router.push(`/dashboard/settings?${params.toString()}`);
  };

  const isBookingActivity = (() => {
    const category = String(shop?.category || '').toUpperCase();
    return category === 'SERVICE' || category === 'BOOKING';
  })();

  const status = String(shop?.status || '').toLowerCase();
  const isApproved = status === 'approved';
  const isPending = status === 'pending';
  const isRejected = status === 'rejected';
  const hasPaymentConfig = Boolean(String(shop?.paymentConfig?.merchantId || '').trim()) && Boolean(String(shop?.paymentConfig?.publicKey || '').trim());

  const stats = [
    {
      title: 'حالة الحساب',
      value: isApproved ? 'نشط' : isPending ? 'قيد المراجعة' : isRejected ? 'مرفوض' : 'غير معروف',
      icon: isApproved ? CheckCircle : isPending ? Clock : isRejected ? AlertTriangle : Info,
      color: isApproved ? 'text-green-500' : isPending ? 'text-blue-500' : isRejected ? 'text-red-500' : 'text-slate-400',
      description: isApproved ? 'تم اعتماد حسابك ويعمل بكامل طاقته' : isPending ? 'حسابك قيد المراجعة من الإدارة' : isRejected ? 'تم رفض حسابك، يرجى التواصل مع الدعم' : 'حالة الحساب غير معروفة',
    },
    {
      title: 'حالة الدفع',
      value: hasPaymentConfig ? 'مفعّل' : 'غير مفعّل',
      icon: hasPaymentConfig ? CheckCircle : AlertTriangle,
      color: hasPaymentConfig ? 'text-green-500' : 'text-yellow-500',
      description: hasPaymentConfig ? 'بوابة الدفع مربوطة وجاهزة' : 'بوابة الدفع غير مربوطة بعد',
    },
    {
      title: 'المدفوعات القادمة',
      value: '—',
      icon: Clock,
      color: 'text-blue-500',
      description: 'لا توجد مدفوعات معلقة حالياً',
    },
  ];

  const quickActions = [
    {
      title: 'تحديث بيانات الحساب',
      description: 'تعديل الاسم، البريد، الهاتف والعنوان',
      icon: <Info className="w-5 h-5 text-blue-500" />,
      onClick: () => handleNavigateToTab('account'),
    },
    {
      title: 'تغيير كلمة المرور',
      description: 'تحديث كلمة المرور وإعدادات الأمان',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      onClick: () => handleNavigateToTab('security'),
    },
    ...(isBookingActivity ? [
      {
        title: 'إعدادات الحجوزات والجدول الزمني',
        description: 'تحديد مواعيد العمل وفترات المواعيد وتأكيد الحجوزات',
        icon: <Clock className="w-5 h-5 text-cyan-500" />,
        onClick: () => handleNavigateToTab('booking_settings'),
      },
      {
        title: 'طرق الدفع والفوترة',
        description: 'ربط بوابات الدفع واستقبال الأموال إلكترونياً',
        icon: <CreditCard className="w-5 h-5 text-emerald-500" />,
        onClick: () => handleNavigateToTab('payments'),
      },
    ] : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
        <p className="text-slate-500 text-sm mt-1">نظرة عامة على حالة حسابك وإعداداتك</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4">
        <h2 className="text-lg font-semibold text-slate-900">إجراءات سريعة</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={action.onClick}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                {action.icon}
                <div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">{action.description}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-400 text-sm py-4">لا يوجد نشاط حديث</div>
        </CardContent>
      </Card>
    </div>
  );
}
