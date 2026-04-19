import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api.service';
import { Lock, Shield, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';

interface SecurityProps {
  shop: any;
  onSaved: () => void;
}

const Security: React.FC<SecurityProps> = ({ shop, onSaved }) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            title: t('securitySettings.error'),
            description: t('securitySettings.currentPasswordRequired'),
            variant: 'destructive',
          });
          return false;
        }
        if (!newPassword || newPassword.length < 8) {
          toast({
            title: t('securitySettings.error'),
            description: t('securitySettings.newPasswordMinLength'),
            variant: 'destructive',
          });
          return false;
        }
        if (newPassword !== confirmPassword) {
          toast({
            title: t('securitySettings.error'),
            description: t('securitySettings.passwordsDoNotMatch'),
            variant: 'destructive',
          });
          return false;
        }

        await ApiService.changePassword({ currentPassword, newPassword });
        toast({ title: t('securitySettings.updated'), description: t('securitySettings.passwordChanged') });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      if (showTwoFactorSetup) {
        if (!twoFactorCode) {
          toast({ title: t('securitySettings.error'), description: t('securitySettings.enterVerificationCode'), variant: 'destructive' });
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTwoFactorEnabled(true);
        setShowTwoFactorSetup(false);
        setTwoFactorCode('');
        toast({ title: t('securitySettings.activated'), description: t('securitySettings.twoFactorActivated') });
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
      toast({ title: t('securitySettings.error'), description: t('securitySettings.saveSecurityFailed'), variant: 'destructive' });
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
        <h1 className="text-2xl font-bold">{t('securitySettings.title')}</h1>
        <p className="text-muted-foreground">{t('securitySettings.subtitle')}</p>
      </div>

      {/* Change Password */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t('securitySettings.changePassword')}</CardTitle>
          <CardDescription>
            {t('securitySettings.changePasswordDesc')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t('securitySettings.currentPassword')}</Label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10 pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('securitySettings.newPassword')}</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 pl-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{t('securitySettings.minLength8')}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('securitySettings.confirmNewPassword')}</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 pl-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t('securitySettings.twoFactorAuth')}</CardTitle>
          <CardDescription>
            {t('securitySettings.twoFactorAuthDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="font-medium">{t('securitySettings.twoFactorAuth')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled 
                  ? t('securitySettings.twoFactorEnabledDesc') 
                  : t('securitySettings.twoFactorDisabledDesc')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {twoFactorEnabled ? t('securitySettings.enabled') : t('securitySettings.disabled')}
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
              <h4 className="font-medium mb-3">{t('securitySettings.setupTwoFactor')}</h4>
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
                      {t('securitySettings.scanQrStep')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('securitySettings.enterCodeStep')}
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
          <CardTitle>{t('securitySettings.recentActivity')}</CardTitle>
          <CardDescription>
            {t('securitySettings.recentActivityDesc')}
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
                  <p className="font-medium">{t('securitySettings.successfulLogin')}</p>
                  <span className="text-xs text-muted-foreground">{t('securitySettings.twoMinutesAgo')}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('securitySettings.loginFromChrome')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  192.168.1.1 - {t('securitySettings.riyadhSaudi')}
                </p>
              </div>
            </div>
            
            <div className="text-center py-4 text-sm text-muted-foreground">
              {t('securitySettings.noMoreActivity')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Security;
