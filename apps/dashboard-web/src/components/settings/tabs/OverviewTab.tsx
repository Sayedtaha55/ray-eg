'use client';

import React from 'react';
import {
  CheckCircle, Clock, AlertTriangle, Info, CreditCard,
  CalendarCheck, ShoppingCart, Store, Printer, Shield,
  Share2, Bell, ChevronLeft, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui';
import { useRouter, useSearchParams } from 'next/navigation';

interface OverviewTabProps {
  shop: any;
  onSelectTab?: (tab: string) => void;
}

export default function OverviewTab({ shop, onSelectTab }: OverviewTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigateToTab = (tab: string) => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('tab', tab);
      router.push(`/dashboard/settings?${params.toString()}`);
    }
  };

  const status = String(shop?.status || '').toLowerCase();
  const isApproved = status === 'approved' || status === 'active';
  const isPending = status === 'pending';
  const isRejected = status === 'rejected';
  const hasPaymentConfig = Boolean(String(shop?.paymentConfig?.merchantId || '').trim()) && Boolean(String(shop?.paymentConfig?.publicKey || '').trim());

  const stats = [
    {
      title: 'حالة الحساب والمتجر',
      value: isApproved ? 'نشط ومعتمد' : isPending ? 'قيد المراجعة' : isRejected ? 'مرفوض' : 'نشط',
      icon: isApproved ? CheckCircle : isPending ? Clock : isRejected ? AlertTriangle : Info,
      color: isApproved ? 'text-emerald-500' : isPending ? 'text-blue-500' : isRejected ? 'text-red-500' : 'text-slate-400',
      description: isApproved ? 'حسابك معتمد ويعمل بكامل صلاحياته' : isPending ? 'حسابك قيد المراجعة' : 'حالة الحساب نشطة',
    },
    {
      title: 'بوابة الدفع الإلكتروني',
      value: hasPaymentConfig ? 'مفعّلة' : 'غير مربوطة بعد',
      icon: hasPaymentConfig ? CheckCircle : AlertTriangle,
      color: hasPaymentConfig ? 'text-emerald-500' : 'text-amber-500',
      description: hasPaymentConfig ? 'البوابة جاهزة لاستقبال المدفوعات' : 'اربط بوابتك لاستقبال البطاقات والمحافظ',
    },
    {
      title: 'نظام الحجوزات والمبيعات',
      value: 'مدمج وموحّد',
      icon: CalendarCheck,
      color: 'text-indigo-500',
      description: 'كافة إعدادات الطلبات والمواعيد متصلة مركزيًا',
    },
  ];

  const settingsHubCards = [
    {
      id: 'store',
      title: 'بيانات النشاط والمتجر',
      description: 'اسم النشاط، العنوان، اللوجو، وأرقام التواصل والخريطة',
      icon: <Store className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      id: 'booking_settings',
      title: 'إعدادات الحجوزات والمواعيد',
      description: 'ساعات العمل، مدة المواعيد، العربون، والتأكيد والإلغاء',
      icon: <CalendarCheck className="w-5 h-5 text-pink-600" />,
      bg: 'bg-pink-50',
    },
    {
      id: 'orders_settings',
      title: 'إعدادات الطلبات والمبيعات',
      description: 'الحد الأدنى للطلب، التوصيل، الشحن المجاني وسياسة الاسترجاع',
      icon: <ShoppingCart className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
    },
    {
      id: 'pos_settings',
      title: 'إعدادات الكاشير ونقاط البيع',
      description: 'طابعة الفواتير، مقاس الورق، مسح الباركود، وأمان الكاشير',
      icon: <Printer className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50',
    },
    {
      id: 'payments',
      title: 'طرق وبوابات الدفع',
      description: 'البطاقات البنكية، فودافون كاش، الدفع عند الاستلام، والعمولات',
      icon: <CreditCard className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50',
    },
    {
      id: 'security',
      title: 'الأمان وحساب الدخول',
      description: 'كلمة المرور، الجلسات النشطة، وصلاحيات المسؤولين',
      icon: <Shield className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50',
    },
    {
      id: 'notifications',
      title: 'إعدادات الإشعارات',
      description: 'تنبيهات الطلبات والمواعيد والرسائل الفورية',
      icon: <Bell className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50',
    },
    {
      id: 'social_media',
      title: 'روابط السوشيال ميديا',
      description: 'فيسبوك، إنستغرام، تيك توك، وقنوات التواصل للمتجر',
      icon: <Share2 className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50',
    },
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">مركز الإعدادات الموحد</h1>
        <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
          إدارة شاملة لبيانات متجرك، الحجوزات، الطلبات التجارية، ونقاط البيع من مكان واحد
        </p>
      </div>

      {/* الحالة السريعة */}
      <div className="grid gap-3.5 md:grid-cols-3">
        {stats.map((stat, index) => (
          <div key={index} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{stat.title}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-lg font-black text-slate-900">{stat.value}</div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* أقسام الإعدادات السريعة */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-extrabold text-slate-900">أقسام الإعدادات التخصصية</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {settingsHubCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => handleNavigateToTab(card.id)}
              className="group p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all text-right flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                  <ChevronLeft size={16} className="text-slate-300 group-hover:text-slate-700 transition-colors" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">
                    {card.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
