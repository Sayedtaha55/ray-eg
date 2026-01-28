import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api.service';
import { Lock, Shield, CheckCircle2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface SecurityProps {
  shop: any;
  onSaved: () => void;
}

const Security: React.FC<SecurityProps> = ({ shop, onSaved }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const baselineRef = useRef({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    showTwoFactorSetup: false,
    twoFactorCode: '',
  });

  useEffect(() => {
    baselineRef.current = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: false,
      showTwoFactorSetup: false,
      twoFactorCode: '',
    };
    try {
      window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'security', count: 0 } }));
    } catch {
    }
  }, [shop?.id]);

  useEffect(() => {
    const base = baselineRef.current;
    const count =
      (String(currentPassword) !== String(base.currentPassword) ? 1 : 0) +
      (String(newPassword) !== String(base.newPassword) ? 1 : 0) +
      (String(confirmPassword) !== String(base.confirmPassword) ? 1 : 0) +
      (Boolean(twoFactorEnabled) !== Boolean(base.twoFactorEnabled) ? 1 : 0) +
      (Boolean(showTwoFactorSetup) !== Boolean(base.showTwoFactorSetup) ? 1 : 0) +
      (String(twoFactorCode) !== String(base.twoFactorCode) ? 1 : 0);
    try {
      window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'security', count } }));
    } catch {
    }
  }, [currentPassword, newPassword, confirmPassword, twoFactorEnabled, showTwoFactorSetup, twoFactorCode]);

  const saveSecurity = React.useCallback(async () => {
    const passwordTouched = Boolean(String(currentPassword || '') || String(newPassword || '') || String(confirmPassword || ''));
    const twoFactorTouched = Boolean(showTwoFactorSetup || String(twoFactorCode || '') || twoFactorEnabled);

    if (!passwordTouched && !twoFactorTouched) return true;

    if (isSaving) return false;
    setIsSaving(true);

    try {
      if (passwordTouched) {
        if (!currentPassword) {
          toast({
            title: 'خطأ',
            description: 'كلمة المرور الحالية مطلوبة',
            variant: 'destructive',
          });
          return false;
        }
        if (!newPassword || newPassword.length < 8) {
          toast({
            title: 'خطأ',
            description: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل',
            variant: 'destructive',
          });
          return false;
        }
        if (newPassword !== confirmPassword) {
          toast({
            title: 'خطأ',
            description: 'كلمة المرور الجديدة وتأكيدها غير متطابقين',
            variant: 'destructive',
          });
          return false;
        }

        await ApiService.changePassword({ currentPassword, newPassword });
        toast({ title: 'تم التحديث', description: 'تم تغيير كلمة المرور بنجاح' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      if (showTwoFactorSetup) {
        if (!twoFactorCode) {
          toast({ title: 'خطأ', description: 'الرجاء إدخال رمز التحقق', variant: 'destructive' });
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTwoFactorEnabled(true);
        setShowTwoFactorSetup(false);
        setTwoFactorCode('');
        toast({ title: 'تم التفعيل', description: 'تم تفعيل المصادقة الثنائية بنجاح' });
      }

      baselineRef.current = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled,
        showTwoFactorSetup: false,
        twoFactorCode: '',
      };
      try {
        window.dispatchEvent(new CustomEvent('merchant-settings-section-changes', { detail: { sectionId: 'security', count: 0 } }));
      } catch {
      }

      onSaved();
      return true;
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء حفظ إعدادات الأمان', variant: 'destructive' });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, toast, onSaved, currentPassword, newPassword, confirmPassword, twoFactorEnabled, showTwoFactorSetup, twoFactorCode]);

  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent('merchant-settings-register-save-handler', { detail: { sectionId: 'security', handler: saveSecurity } }));
    } catch {
    }
  }, [saveSecurity]);

  const handleTwoFactorToggle = async (checked: boolean) => {
    if (checked) {
      setShowTwoFactorSetup(true);
    } else {
      setTwoFactorEnabled(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الأمان</h1>
        <p className="text-muted-foreground">إدارة إعدادات الأمان الخاصة بحسابك</p>
      </div>

      {/* Change Password */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>تغيير كلمة المرور</CardTitle>
          <CardDescription>
            قم بتحديث كلمة المرور الحالية بكلمة مرور جديدة وقوية.
          </CardDescription>
        </CardHeader>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">كلمة المرور الحالية</Label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-muted-foreground">يجب أن تتكون من 8 أحرف على الأقل</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>المصادقة الثنائية</CardTitle>
          <CardDescription>
            قم بتمكين المصادقة الثنائية لتعزيز أمان حسابك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="font-medium">المصادقة الثنائية</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled 
                  ? "المصادقة الثنائية مفعلة على حسابك" 
                  : "قم بتمكين المصادقة الثنائية لتعزيز الأمان"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {twoFactorEnabled ? "مفعل" : "معطل"}
              </span>
              <Switch 
                checked={twoFactorEnabled} 
                onCheckedChange={handleTwoFactorToggle}
                disabled={isSaving}
              />
            </div>
          </div>

          {showTwoFactorSetup && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">إعداد المصادقة الثنائية</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-2 rounded-md border">
                    {/* Placeholder for QR code */}
                    <div className="w-32 h-32 flex items-center justify-center bg-white border border-dashed rounded-md">
                      <span className="text-xs text-muted-foreground">QR Code</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      1. قم بمسح رمز الاستجابة السريعة باستخدام تطبيق المصادقة المفضل لديك مثل Google Authenticator أو Authy.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      2. أدخل رمز التحقق المكون من 6 أرقام من التطبيق.
                    </p>
                    <form onSubmit={(e) => e.preventDefault()} className="pt-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          placeholder="123456"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          className="max-w-[180px]"
                          maxLength={6}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Security Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>النشاط الأمني الأخير</CardTitle>
          <CardDescription>
            مراجعة الأحداث الأمنية الحديثة على حسابك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">تسجيل دخول ناجح</p>
                  <span className="text-xs text-muted-foreground">منذ دقيقتين</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  تم تسجيل الدخول بنجاح من متصفح Chrome على Windows
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ‎192.168.1.1 - الرياض، السعودية
                </p>
              </div>
            </div>
            
            <div className="text-center py-4 text-sm text-muted-foreground">
              لا توجد أنشطة أخرى
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Security;
