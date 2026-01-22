import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewProps {
  shop: any;
}

const Overview: React.FC<OverviewProps> = ({ shop }) => {
  const formatEGP = (value: unknown) => {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return 'غير متاح';
    try {
      return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `ج.م ${Math.round(n).toLocaleString('ar-EG')}`;
    }
  };

  const status = String(shop?.status || '').toLowerCase();
  const isApproved = status === 'approved';
  const isPending = status === 'pending';
  const isRejected = status === 'rejected';
  const hasPaymentConfig = Boolean(String(shop?.paymentConfig?.merchantId || '').trim()) && Boolean(String(shop?.paymentConfig?.publicKey || '').trim());
  const paidUntilRaw = shop?.paidUntil ?? shop?.paid_until ?? shop?.subscriptionPaidUntil ?? shop?.subscription_paid_until;
  const paidUntilDate = paidUntilRaw ? new Date(paidUntilRaw) : null;
  const paidUntilText = paidUntilDate && !Number.isNaN(paidUntilDate.getTime())
    ? paidUntilDate.toLocaleDateString('ar-EG')
    : '';
  const nextDueAmount = shop?.nextDueAmount ?? shop?.next_due_amount ?? shop?.billing?.nextDueAmount ?? shop?.billing?.next_due_amount;

  const stats = [
    {
      title: 'حالة الحساب',
      value: isApproved ? 'نشط' : isPending ? 'قيد المراجعة' : isRejected ? 'مرفوض' : 'غير معروف',
      icon: isApproved ? CheckCircle : isPending ? Clock : isRejected ? AlertTriangle : Info,
      color: isApproved ? 'text-green-500' : isPending ? 'text-blue-500' : isRejected ? 'text-red-500' : 'text-slate-400',
      description: isApproved
        ? 'متجرك معتمد وجاهز لاستقبال الطلبات'
        : isPending
          ? 'متجرك قيد المراجعة حالياً'
          : isRejected
            ? 'تم رفض المتجر، راجع بيانات المتجر'
            : 'لم يتم تحديد حالة المتجر',
    },
    {
      title: 'حالة الدفع',
      value: hasPaymentConfig ? 'مفعّلة' : 'غير مفعّلة',
      icon: hasPaymentConfig ? CheckCircle : AlertTriangle,
      color: hasPaymentConfig ? 'text-green-500' : 'text-yellow-500',
      description: hasPaymentConfig
        ? (paidUntilText ? `الاشتراك/الدفع ساري حتى ${paidUntilText}` : 'تم ربط بيانات الدفع بنجاح')
        : 'لم يتم ربط بيانات الدفع بعد',
    },
    {
      title: 'المستحقات القادمة',
      value: formatEGP(nextDueAmount ?? 0),
      icon: Clock,
      color: 'text-blue-500',
      description: Number(nextDueAmount) > 0 ? 'يوجد مبلغ مستحق قادم' : 'لا توجد مدفوعات معلقة',
    },
  ];

  const quickActions = [
    {
      title: 'تحديث معلومات الحساب',
      description: 'قم بتحديث معلوماتك الشخصية وبيانات الاتصال',
      icon: <Info className="w-5 h-5 text-blue-500" />,
      onClick: () => {},
    },
    {
      title: 'تغيير كلمة المرور',
      description: 'قم بتحديث كلمة المرور الخاصة بك',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      onClick: () => {},
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على إعدادات متجرك</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4">
        <h2 className="text-lg font-semibold">إجراءات سريعة</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={action.onClick}
            >
              <CardHeader className="flex flex-row items-center space-x-4 space-x-reverse pb-2">
                {action.icon}
                <div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="text-sm">{action.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">النشاط الأخير</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground text-sm">
              لا توجد أنشطة حديثة
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
