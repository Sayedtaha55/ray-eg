import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewProps {
  shop: any;
}

const Overview: React.FC<OverviewProps> = ({ shop }) => {
  const stats = [
    {
      title: 'حالة الحساب',
      value: shop?.isActive ? 'نشط' : 'غير نشط',
      icon: shop?.isActive ? CheckCircle : AlertTriangle,
      color: shop?.isActive ? 'text-green-500' : 'text-yellow-500',
      description: shop?.isActive ? 'حسابك نشط وجاهز للاستخدام' : 'حسابك غير نشط، يرجى مراجعة الإعدادات',
    },
    {
      title: 'حالة الدفع',
      value: 'مدفوع',
      icon: CheckCircle,
      color: 'text-green-500',
      description: 'الاشتراك ساري حتى 31/12/2023',
    },
    {
      title: 'المستحقات القادمة',
      value: '0.00 ر.س',
      icon: Clock,
      color: 'text-blue-500',
      description: 'لا توجد مدفوعات معلقة',
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
