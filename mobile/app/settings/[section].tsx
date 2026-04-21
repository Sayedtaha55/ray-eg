import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, ScrollView, View, Text, TextInput,
  TouchableOpacity, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import httpClient from '@/services/httpClient';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { ApiService } from '@/services/api';
import { getEnabledModulesSet } from '@/utils/merchantDashboard';
import { ENV } from '@/constants/env';

const CORE_IDS = ['overview', 'products', 'promotions', 'builder', 'settings'] as const;
const OPTIONAL_IDS = ['gallery', 'reservations', 'invoice', 'pos', 'sales', 'customers', 'reports'] as const;
type ModuleId = (typeof CORE_IDS)[number] | (typeof OPTIONAL_IDS)[number];

const SECTIONS = [
  { id: 'overview', labelKey: 'settings.overview', fallback: 'Overview', icon: 'home-outline' },
  { id: 'account', labelKey: 'settings.account', fallback: 'Account', icon: 'person-outline' },
  { id: 'security', labelKey: 'settings.security', fallback: 'Security', icon: 'shield-outline' },
  { id: 'store', labelKey: 'settings.storeSettings', fallback: 'Store Settings', icon: 'storefront-outline' },
  { id: 'modules', labelKey: 'settings.modules', fallback: 'Modules', icon: 'extensions-outline' },
  { id: 'payments', labelKey: 'settings.payments', fallback: 'Payments', icon: 'card-outline' },
  { id: 'receipt_theme', labelKey: 'settings.receiptTheme', fallback: 'Receipt Theme', icon: 'receipt-outline' },
  { id: 'notifications', labelKey: 'settings.notifications', fallback: 'Notifications', icon: 'notifications-outline' },
  { id: 'language', labelKey: 'common.language', fallback: 'Language', icon: 'language-outline' },
];

export default function SettingsSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const { shop, refreshShop } = useAuth();
  const { language, setLanguage, t } = useAppPreferences();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const initialEnabled = useCallback(() => {
    const set = getEnabledModulesSet(shop);
    return new Set<string>(Array.from(set).map(String));
  }, [shop]);
  const [enabledModules, setEnabledModules] = useState<Set<string>>(() => initialEnabled());
  useEffect(() => { setEnabledModules(initialEnabled()); }, [initialEnabled]);

  const currentSection = section || 'overview';

  const handleSave = async (payload: Record<string, any>) => {
    if (!shop?.id) return;
    setSaving(true);
    try {
      await httpClient.patch(`/shops/${shop.id}`, payload);
      await refreshShop();
      Alert.alert(t('common.success'), t('settings.saved'));
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.response?.data?.message || t('settings.saveFailed'));
    } finally { setSaving(false); }
  };

  const formatEGP = (v: unknown) => {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return t('settings.notAvailable');
    return `EGP ${Math.round(n).toLocaleString()}`;
  };

  /* ─── Overview ─── */
  const renderOverview = () => {
    const status = String(shop?.status || '').toLowerCase();
    const isApproved = status === 'approved';
    const isPending = status === 'pending';
    const isRejected = status === 'rejected';
    const hasPayment = Boolean(String(shop?.paymentConfig?.merchantId || '').trim()) && Boolean(String(shop?.paymentConfig?.publicKey || '').trim());
    const nextDue = shop?.nextDueAmount ?? shop?.next_due_amount ?? 0;

    const stats = [
      { title: t('settings.accountStatus'), value: isApproved ? t('settings.active') : isPending ? t('settings.underReview') : isRejected ? t('settings.rejected') : t('settings.unknown'), color: isApproved ? '#22C55E' : isPending ? '#3B82F6' : isRejected ? '#EF4444' : '#94A3B8', icon: isApproved ? 'checkmark-circle' : isPending ? 'time' : isRejected ? 'alert-circle' : 'information-circle', desc: isApproved ? t('settings.approvedDesc') : isPending ? t('settings.pendingDesc') : isRejected ? t('settings.rejectedDesc') : t('settings.unknownDesc') },
      { title: t('settings.paymentStatus'), value: hasPayment ? t('settings.enabled') : t('settings.notEnabled'), color: hasPayment ? '#22C55E' : '#EAB308', icon: hasPayment ? 'checkmark-circle' : 'alert-circle', desc: hasPayment ? t('settings.paymentLinked') : t('settings.paymentNotLinked') },
      { title: t('settings.upcomingDues'), value: formatEGP(nextDue), color: '#3B82F6', icon: 'time', desc: Number(nextDue) > 0 ? t('settings.amountDue') : t('settings.noPendingPayments') },
    ];
    const actions = [
      { title: t('settings.updateAccountInfo'), desc: t('settings.updateAccountInfoDesc'), icon: 'information-circle' as const, color: '#3B82F6', target: 'account' },
      { title: t('settings.changePasswordAction'), desc: t('settings.changePasswordDesc'), icon: 'alert-circle' as const, color: '#EAB308', target: 'security' },
    ];

    return (
      <View style={s.sectionContent}>
        <Text style={s.sectionTitle}>{t('settings.overviewDashboard')}</Text>
        <Text style={s.sectionSubtitle}>{t('settings.overviewDashboardDesc')}</Text>
        {stats.map((st, i) => (
          <View key={i} style={s.statCard}>
            <View style={s.statHeader}>
              <Text style={s.statTitle}>{st.title}</Text>
              <Ionicons name={st.icon as any} size={20} color={st.color} />
            </View>
            <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
            <Text style={s.statDesc}>{st.desc}</Text>
          </View>
        ))}
        <Text style={s.subHeading}>{t('settings.quickActions')}</Text>
        {actions.map((a, i) => (
          <TouchableOpacity key={i} style={s.actionCard} onPress={() => router.replace(`/settings/${a.target}`)}>
            <View style={s.actionLeft}>
              <Ionicons name={a.icon} size={20} color={a.color} />
              <View><Text style={s.actionTitle}>{a.title}</Text><Text style={s.actionDesc}>{a.desc}</Text></View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#64748B" />
          </TouchableOpacity>
        ))}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.defaultLanguage')}</Text>
          <View style={s.langRow}>
            <TouchableOpacity style={[s.langBtn, language === 'en' && s.langBtnActive]} onPress={() => setLanguage('en')}>
              <Text style={[s.langBtnText, language === 'en' && s.langBtnTextActive]}>{t('settings.english')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.langBtn, language === 'ar' && s.langBtnActive]} onPress={() => setLanguage('ar')}>
              <Text style={[s.langBtnText, language === 'ar' && s.langBtnTextActive]}>{t('settings.arabic')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={s.subHeading}>{t('settings.recentActivity')}</Text>
        <View style={s.card}><Text style={s.placeholder}>{t('settings.noRecentActivity')}</Text></View>
      </View>
    );
  };

  /* ─── Account ─── */
  const renderAccount = () => {
    const [name, setName] = useState(shop?.name || '');
    const [email, setEmail] = useState(shop?.email || '');
    const [gov, setGov] = useState(shop?.governorate || '');
    const [city, setCity] = useState(shop?.city || '');
    const [phone, setPhone] = useState(shop?.phone || '');
    const [addr, setAddr] = useState(shop?.addressDetailed || shop?.address_detailed || '');
    const [desc, setDesc] = useState(shop?.description || '');
    const [delConfirm, setDelConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);

    const save = async () => {
      setSaving(true);
      try { await ApiService.updateMyShop({ name, email, governorate: gov, city, phone, addressDetailed: addr, description: desc }); await refreshShop(); Alert.alert(t('settings.accountSaved'), t('settings.accountUpdated')); }
      catch { Alert.alert(t('common.error'), t('settings.saveChangesFailed')); }
      finally { setSaving(false); }
    };
    const deactivate = async () => {
      const kw = t('settings.deleteKeyword');
      if (String(delConfirm).trim() !== kw) { Alert.alert(t('settings.confirmRequired'), t('settings.typeKeywordToConfirm', { keyword: kw })); return; }
      setDeleting(true);
      try { await ApiService.deactivateMyAccount(); Alert.alert(t('settings.accountDeleted'), t('settings.accountDisabled')); }
      catch { Alert.alert(t('common.error'), t('settings.deleteAccountFailed')); }
      finally { setDeleting(false); }
    };

    return (
      <View style={s.sectionContent}>
        <Text style={s.sectionTitle}>{t('settings.accountTitle')}</Text>
        <Text style={s.sectionSubtitle}>{t('settings.accountSubtitle')}</Text>
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.basicInfo')}</Text>
          <Text style={s.cardDesc}>{t('settings.basicInfoDesc')}</Text>
          <Fld label={t('settings.shopName')} value={name} onChange={setName} icon="person-outline" />
          <Fld label={t('settings.email')} value={email} onChange={setEmail} icon="mail-outline" kb="email-address" />
          <Fld label={t('settings.governorate')} value={gov} onChange={setGov} />
          <Fld label={t('settings.city')} value={city} onChange={setCity} />
          <Fld label={t('settings.phone')} value={phone} onChange={setPhone} icon="call-outline" kb="phone-pad" />
          <Fld label={t('settings.accountAddress')} value={addr} onChange={setAddr} icon="location-outline" />
          <Fld label={t('settings.description')} value={desc} onChange={setDesc} multiline ph={t('settings.descriptionPlaceholder')} />
          <Btn title={saving ? t('common.loading') : t('common.save')} onPress={save} disabled={saving} />
        </View>
        <View style={[s.card, { borderColor: '#7F1D1D44' }]}>
          <Text style={[s.cardTitle, { color: '#EF4444' }]}>{t('settings.deleteAccount')}</Text>
          <Text style={s.cardDesc}>{t('settings.deleteAccountDesc')}</Text>
          <Fld label={t('settings.typeDeleteToConfirm', { keyword: t('settings.deleteKeyword') })} value={delConfirm} onChange={setDelConfirm} />
          <TouchableOpacity style={s.delBtn} onPress={deactivate} disabled={deleting}>
            <Text style={s.delBtnText}>{deleting ? t('settings.deleting') : t('settings.deleteAccount')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ─── Security ─── */
  const renderSecurity = () => {
    const [curPw, setCurPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [cfmPw, setCfmPw] = useState('');
    const [showCur, setShowCur] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showCfm, setShowCfm] = useState(false);
    const [tfa, setTfa] = useState(false);
    const [tfaSetup, setTfaSetup] = useState(false);
    const [tfaCode, setTfaCode] = useState('');

    const doChangePw = async () => {
      if (!curPw) { Alert.alert(t('common.error'), t('settings.currentPasswordRequired')); return; }
      if (!newPw || newPw.length < 8) { Alert.alert(t('common.error'), t('settings.newPasswordMinLength')); return; }
      if (newPw !== cfmPw) { Alert.alert(t('common.error'), t('settings.passwordsDoNotMatch')); return; }
      setSaving(true);
      try { await ApiService.changePassword({ currentPassword: curPw, newPassword: newPw }); Alert.alert(t('common.success'), t('settings.passwordChangedSuccess')); setCurPw(''); setNewPw(''); setCfmPw(''); }
      catch { Alert.alert(t('common.error'), t('settings.saveSecurityFailed')); }
      finally { setSaving(false); }
    };
    const doVerifyTfa = async () => {
      if (!tfaCode) { Alert.alert(t('common.error'), t('settings.enterVerificationCode')); return; }
      setSaving(true);
      try { setTfa(true); setTfaSetup(false); setTfaCode(''); Alert.alert(t('settings.activated'), t('settings.twoFactorActivated')); }
      catch { Alert.alert(t('common.error'), t('settings.saveSecurityFailed')); }
      finally { setSaving(false); }
    };

    return (
      <View style={s.sectionContent}>
        <Text style={s.sectionTitle}>{t('settings.securityTitle')}</Text>
        <Text style={s.sectionSubtitle}>{t('settings.securitySubtitle')}</Text>
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.securityChangePassword')}</Text>
          <Text style={s.cardDesc}>{t('settings.securityChangePasswordDesc')}</Text>
          <Fld label={t('settings.currentPasswordLabel')} value={curPw} onChange={setCurPw} secure={!showCur} icon={showCur ? 'eye-off-outline' : 'eye-outline'} onIcon={() => setShowCur(!showCur)} />
          <Fld label={t('settings.newPasswordLabel')} value={newPw} onChange={setNewPw} secure={!showNew} hint={t('settings.minLength8')} icon={showNew ? 'eye-off-outline' : 'eye-outline'} onIcon={() => setShowNew(!showNew)} />
          <Fld label={t('settings.confirmNewPassword')} value={cfmPw} onChange={setCfmPw} secure={!showCfm} icon={showCfm ? 'eye-off-outline' : 'eye-outline'} onIcon={() => setShowCfm(!showCfm)} />
          <Btn title={saving ? t('common.loading') : t('settings.securityChangePassword')} onPress={doChangePw} disabled={saving} />
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.twoFactorAuth')}</Text>
          <Text style={s.cardDesc}>{t('settings.twoFactorAuthDesc')}</Text>
          <Text style={s.cardDesc}>{tfa ? t('settings.twoFactorEnabledDesc') : t('settings.twoFactorDisabledDesc')}</Text>
          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>{tfa ? t('settings.enabled2') : t('settings.disabled')}</Text>
            <Switch value={tfa} onValueChange={v => { if (v) setTfaSetup(true); else setTfa(false); }} trackColor={{ false: '#334155', true: '#22C55E' }} thumbColor={tfa ? '#fff' : '#94A3B8'} />
          </View>
          {tfaSetup && (
            <View style={s.tfaSetup}>
              <Text style={s.cardDesc}>{t('settings.scanQrStep')}</Text>
              <Text style={s.cardDesc}>{t('settings.enterCodeStep')}</Text>
              <Fld label={t('settings.enterVerificationCode')} value={tfaCode} onChange={setTfaCode} kb="number-pad" />
              <Btn title={saving ? t('common.loading') : t('settings.setupTwoFactor')} onPress={doVerifyTfa} disabled={saving} />
            </View>
          )}
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.recentSecurityActivity')}</Text>
          <Text style={s.cardDesc}>{t('settings.recentSecurityActivityDesc')}</Text>
          <View style={s.activityItem}>
            <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
            <View style={s.activityText}>
              <Text style={s.activityTitle}>{t('settings.successfulLogin')}</Text>
              <Text style={s.activitySub}>{t('settings.loginFromChrome')} · {t('settings.twoMinutesAgo')}</Text>
            </View>
          </View>
          <Text style={s.placeholder}>{t('settings.noMoreActivity')}</Text>
        </View>
      </View>
    );
  };

  /* ─── Store ─── */
  const renderStore = () => {
    const [wa, setWa] = useState(String((shop as any)?.layoutConfig?.whatsapp || shop?.whatsapp || ''));
    const [customDomain, setCustomDomain] = useState(String((shop as any)?.layoutConfig?.customDomain || ''));
    const [openingHours, setOpeningHours] = useState(String(shop?.openingHours || (shop as any)?.opening_hours || ''));
    const [displayAddress, setDisplayAddress] = useState(String(shop?.displayAddress || (shop as any)?.display_address || ''));
    const [mapLabel, setMapLabel] = useState(String(shop?.mapLabel || (shop as any)?.map_label || ''));
    const [isActive, setIsActive] = useState<boolean>(Boolean(shop?.isActive));
    const [publicDisabled, setPublicDisabled] = useState<boolean>(Boolean((shop as any)?.publicDisabled ?? (shop as any)?.public_disabled));
    const [deliveryDisabled, setDeliveryDisabled] = useState<boolean>(Boolean((shop as any)?.deliveryDisabled ?? (shop as any)?.delivery_disabled));
    const [toggling, setToggling] = useState(false);

    const toggleShopActive = async () => {
      setToggling(true);
      const next = !isActive;
      try { await ApiService.updateMyShop({ isActive: next }); setIsActive(next); await refreshShop(); Alert.alert(t('common.success'), next ? t('settings.shopOpened') : t('settings.shopClosed')); }
      catch { Alert.alert(t('common.error'), t('settings.saveFailed')); }
      finally { setToggling(false); }
    };
    const togglePublic = async () => {
      setToggling(true);
      const next = !publicDisabled;
      try { await ApiService.updateMyShop({ publicDisabled: next }); setPublicDisabled(next); await refreshShop(); Alert.alert(t('common.success'), next ? t('settings.publicPageDisabled') : t('settings.publicPageEnabled')); }
      catch { Alert.alert(t('common.error'), t('settings.saveFailed')); }
      finally { setToggling(false); }
    };
    const toggleDelivery = async () => {
      setToggling(true);
      const next = !deliveryDisabled;
      try { await ApiService.updateMyShop({ deliveryDisabled: next }); setDeliveryDisabled(next); await refreshShop(); Alert.alert(t('common.success'), next ? t('settings.deliveryDisabled') : t('settings.deliveryEnabled')); }
      catch { Alert.alert(t('common.error'), t('settings.saveFailed')); }
      finally { setToggling(false); }
    };
    const saveStore = async () => {
      setSaving(true);
      try {
        await ApiService.updateMyShop({
          whatsapp: wa, customDomain, openingHours,
          displayAddress: displayAddress || null, mapLabel: mapLabel || null,
        });
        await refreshShop(); Alert.alert(t('common.success'), t('settings.storeSettingsSaved'));
      }
      catch { Alert.alert(t('common.error'), t('settings.saveFailed')); }
      finally { setSaving(false); }
    };

    return (
      <View style={s.sectionContent}>
        <Text style={s.sectionTitle}>{t('settings.storeTitle')}</Text>
        <Text style={s.sectionSubtitle}>{t('settings.storeSubtitle')}</Text>
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.shopStatus')}</Text>
          <Text style={s.cardDesc}>{isActive ? t('settings.shopOpenDesc') : t('settings.shopClosedDesc')}</Text>
          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>{isActive ? t('settings.openStatus') : t('settings.closedStatus')}</Text>
            <Switch value={isActive} onValueChange={toggleShopActive} disabled={toggling} trackColor={{ false: '#334155', true: '#22C55E' }} thumbColor={isActive ? '#fff' : '#94A3B8'} />
          </View>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.publicPageAndMap')}</Text>
          <Text style={s.cardDesc}>{publicDisabled ? t('settings.publicPageDisabledDesc') : t('settings.publicPageEnabledDesc')}</Text>
          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>{publicDisabled ? t('settings.disabled') : t('settings.enabled')}</Text>
            <Switch value={!publicDisabled} onValueChange={togglePublic} disabled={toggling} trackColor={{ false: '#334155', true: '#22C55E' }} thumbColor={!publicDisabled ? '#fff' : '#94A3B8'} />
          </View>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.delivery')}</Text>
          <Text style={s.cardDesc}>{deliveryDisabled ? t('settings.deliveryDisabledDesc') : t('settings.deliveryEnabledDesc')}</Text>
          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>{deliveryDisabled ? t('settings.disabled') : t('settings.enabled')}</Text>
            <Switch value={!deliveryDisabled} onValueChange={toggleDelivery} disabled={toggling} trackColor={{ false: '#334155', true: '#22C55E' }} thumbColor={!deliveryDisabled ? '#fff' : '#94A3B8'} />
          </View>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.contact')}</Text>
          <Text style={s.cardDesc}>{t('settings.contactDesc')}</Text>
          <Fld label={t('settings.whatsapp')} value={wa} onChange={setWa} icon="logo-whatsapp" kb="phone-pad" ph="+2010..." />
          <Fld label={t('settings.customDomain')} value={customDomain} onChange={setCustomDomain} icon="globe-outline" ph="shop.example.com" />
          <Fld label={t('settings.openingHours')} value={openingHours} onChange={setOpeningHours} icon="time-outline" ph="10:00 - 22:00" />
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.storeAddressLabel')}</Text>
          <Text style={s.cardDesc}>{t('settings.addressDesc')}</Text>
          <Fld label={t('settings.shortAddress')} value={displayAddress} onChange={setDisplayAddress} icon="location-outline" ph={t('settings.cairoPlaceholder')} />
          <Fld label={t('settings.mapLocationName')} value={mapLabel} onChange={setMapLabel} ph={t('settings.shopNamePlaceholder')} />
          <Btn title={saving ? t('common.loading') : t('common.save')} onPress={saveStore} disabled={saving} />
        </View>
      </View>
    );
  };

  /* ─── Modules ─── */
  const MODULE_LABELS: Record<string, string> = {
    overview: t('settings.moduleOverview'), products: t('settings.moduleProducts'),
    promotions: t('settings.modulePromotions'), builder: t('settings.moduleBuilder'),
    settings: t('settings.moduleSettings'), gallery: t('settings.moduleGallery'),
    reservations: t('settings.moduleReservations'), invoice: t('settings.moduleInvoice'),
    pos: t('settings.modulePos'), sales: t('settings.moduleSales'),
    customers: t('settings.moduleCustomers'), reports: t('settings.moduleReports'),
  };
  const toggleOptional = (id: ModuleId) => {
    if (CORE_IDS.includes(id as any)) return;
    setEnabledModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); if (id === 'sales') { next.delete('customers'); next.delete('reports'); } return next; }
      if ((id === 'customers' || id === 'reports') && !next.has('sales')) { Alert.alert(t('common.error'), t('settings.customersRequiresSales')); return prev; }
      next.add(id); return next;
    });
  };
  const saveModules = async () => {
    setSaving(true);
    try { const list = Array.from(new Set([...Array.from(enabledModules), ...CORE_IDS.map(String)])).sort(); await ApiService.updateMyShop({ layoutConfig: { enabledModules: list } }); await refreshShop(); Alert.alert(t('common.success'), t('settings.modulesSaved')); }
    catch (err: any) { Alert.alert(t('common.error'), err?.response?.data?.message || t('settings.saveFailed')); }
    finally { setSaving(false); }
  };
  const renderModules = () => (
    <View style={s.sectionContent}>
      <Text style={s.sectionTitle}>{t('settings.modulesUpgrade')}</Text>
      <Text style={s.sectionSubtitle}>{t('settings.modulesUpgradeDesc')}</Text>
      <View style={s.card}>
        <Text style={s.cardTitle}>{t('settings.coreModules')}</Text>
        <Text style={s.cardDesc}>{t('settings.coreModulesDesc')}</Text>
        {CORE_IDS.map(id => (
          <View key={id} style={s.moduleRow}>
            <Text style={s.moduleLabel}>{MODULE_LABELS[id] || id}</Text>
            <View style={[s.moduleBadge, { backgroundColor: '#0F172A' }]}><Text style={s.moduleBadgeText}>{t('settings.core')}</Text></View>
          </View>
        ))}
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>{t('settings.optionalModules')}</Text>
        <Text style={s.cardDesc}>{t('settings.optionalModulesDesc')}</Text>
        {OPTIONAL_IDS.map(id => {
          const on = enabledModules.has(id);
          const dis = (id === 'customers' || id === 'reports') && !enabledModules.has('sales');
          return (
            <TouchableOpacity key={id} style={[s.moduleToggle, on && s.moduleToggleActive, dis && { opacity: 0.5 }]} onPress={() => !dis && toggleOptional(id)} disabled={saving}>
              <Text style={s.moduleToggleLabel}>{MODULE_LABELS[id] || id}</Text>
              <View style={[s.checkbox, on && s.checkboxOn]} />
            </TouchableOpacity>
          );
        })}
        <Btn title={saving ? t('common.loading') : t('settings.saveModules')} onPress={saveModules} disabled={saving} />
      </View>
    </View>
  );

  /* ─── Payments ─── */
  const renderPayments = () => {
    const [merchantId, setMerchantId] = useState(String(shop?.paymentConfig?.merchantId || ''));
    const [publicKey, setPublicKey] = useState(String(shop?.paymentConfig?.publicKey || ''));

    const savePayments = async () => {
      setSaving(true);
      try { await ApiService.updateMyShop({ paymentConfig: { merchantId: String(merchantId || ''), publicKey: String(publicKey || '') } }); await refreshShop(); Alert.alert(t('common.success'), t('settings.paymentSettingsUpdated')); }
      catch { Alert.alert(t('common.error'), t('settings.saveFailed')); }
      finally { setSaving(false); }
    };

    return (
      <View style={s.sectionContent}>
        <Text style={s.sectionTitle}>{t('settings.paymentsTitle')}</Text>
        <Text style={s.sectionSubtitle}>{t('settings.paymentsSubtitle')}</Text>
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.paymentGatewayDetails')}</Text>
          <Text style={s.cardDesc}>{t('settings.paymentGatewayDetailsDesc')}</Text>
          <Fld label={t('settings.merchantId')} value={merchantId} onChange={setMerchantId} icon="key-outline" />
          <Fld label={t('settings.publicKey')} value={publicKey} onChange={setPublicKey} icon="key-outline" />
          <Btn title={saving ? t('common.loading') : t('common.save')} onPress={savePayments} disabled={saving} />
        </View>
      </View>
    );
  };

  /* ─── Receipt Theme ─── */
  const renderReceiptTheme = () => {
    const layout = (shop as any)?.layoutConfig && typeof (shop as any).layoutConfig === 'object' ? (shop as any).layoutConfig : undefined;
    const theme = layout?.receiptTheme && typeof layout.receiptTheme === 'object' ? layout.receiptTheme : undefined;

    const [rcptShopName, setRcptShopName] = useState(String(theme?.shopName || shop?.name || ''));
    const [rcptPhone, setRcptPhone] = useState(String(theme?.phone || shop?.phone || ''));
    const [rcptCity, setRcptCity] = useState(String(theme?.city || shop?.city || ''));
    const [rcptAddress, setRcptAddress] = useState(String(theme?.address || shop?.addressDetailed || (shop as any)?.address_detailed || ''));
    const [rcptFooterNote, setRcptFooterNote] = useState(String(theme?.footerNote || ''));
    const [rcptVatRate, setRcptVatRate] = useState(String(theme?.vatRatePercent ?? 0));

    const saveReceipt = async () => {
      setSaving(true);
      try {
        await ApiService.updateMyShop({
          receiptTheme: {
            shopName: rcptShopName,
            phone: rcptPhone,
            city: rcptCity,
            address: rcptAddress,
            footerNote: rcptFooterNote,
            vatRatePercent: Number(rcptVatRate) || 0,
          },
        });
        await refreshShop();
        Alert.alert(t('common.success'), t('settings.receiptThemeSaved'));
      }
      catch { Alert.alert(t('common.error'), t('settings.receiptThemeSaveFailed')); }
      finally { setSaving(false); }
    };

    return (
      <View style={s.sectionContent}>
        <Text style={s.sectionTitle}>{t('settings.receiptThemeTitle')}</Text>
        <Text style={s.sectionSubtitle}>{t('settings.receiptThemeDesc')}</Text>
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.receiptThemeTitle')}</Text>
          <Text style={s.cardDesc}>{t('settings.receiptThemeDesc')}</Text>
          <Fld label={t('settings.receiptShopName')} value={rcptShopName} onChange={setRcptShopName} icon="storefront-outline" />
          <Fld label={t('settings.receiptPhone')} value={rcptPhone} onChange={setRcptPhone} icon="call-outline" kb="phone-pad" />
          <Fld label={t('settings.receiptCity')} value={rcptCity} onChange={setRcptCity} ph={t('settings.receiptCityPlaceholder')} />
          <Fld label={t('settings.vatRatePercent')} value={rcptVatRate} onChange={setRcptVatRate} kb="number-pad" />
          <Fld label={t('settings.receiptAddress')} value={rcptAddress} onChange={setRcptAddress} icon="location-outline" />
          <Fld label={t('settings.receiptFooterNote')} value={rcptFooterNote} onChange={setRcptFooterNote} ph={t('settings.receiptFooterNotePlaceholder')} />
          <Btn title={saving ? t('common.loading') : t('common.save')} onPress={saveReceipt} disabled={saving} />
        </View>
      </View>
    );
  };

  /* ─── Notifications ─── */
  const renderNotifications = () => {
    const layout = (shop as any)?.layoutConfig && typeof (shop as any).layoutConfig === 'object' ? (shop as any).layoutConfig : undefined;
    const serverSoundId = String(layout?.notificationSoundId || '').trim() || 'default';
    const [selectedSound, setSelectedSound] = useState(serverSoundId);
    const [sounds, setSounds] = useState<Array<{ id: string; name: string; url?: string }>>([
      { id: 'default', name: t('settings.soundDefault') },
      { id: 'chime', name: t('settings.soundChime') },
      { id: 'bell', name: t('settings.soundBell') },
      { id: 'alert', name: t('settings.soundAlert') },
      { id: 'none', name: t('settings.soundNone') },
    ]);

    useEffect(() => {
      setSelectedSound(serverSoundId);
    }, [serverSoundId]);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const url = `${ENV.API_BASE_URL}/sounds/manifest.json`;
          const res = await fetch(url, { cache: 'no-cache' } as any);
          if (!res.ok) return;
          const data = await res.json();
          const list = Array.isArray(data) ? data : Array.isArray((data as any)?.sounds) ? (data as any).sounds : [];
          const normalized = (list || [])
            .map((s: any) => ({
              id: String(s?.id || ''),
              name: String(s?.name || ''),
              url: String(
                s?.url ||
                  (s?.file
                    ? `${ENV.API_BASE_URL}/sounds/${String(s.file).replace(/^\/+/, '')}`
                    : '') ||
                  '',
              ),
            }))
            .filter((s: any) => s.id);
          if (cancelled) return;
          if (normalized.length > 0) setSounds(normalized);
        } catch {
          // keep fallback
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []);

    const saveSound = async () => {
      setSaving(true);
      try {
        await ApiService.updateMyShop({ notificationSoundId: String(selectedSound || '').trim() || 'default' });
        await refreshShop();
        Alert.alert(t('common.success'), t('settings.saved'));
      } catch {
        Alert.alert(t('common.error'), t('settings.saveFailed'));
      } finally {
        setSaving(false);
      }
    };

    return (
      <View style={s.sectionContent}>
        <Text style={s.sectionTitle}>{t('settings.notificationsTitle')}</Text>
        <Text style={s.sectionSubtitle}>{t('settings.notificationSounds')}</Text>
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('settings.notificationSounds')}</Text>
          <Text style={s.cardDesc}>{t('settings.chooseSound')}</Text>
          {sounds.map(snd => (
            <TouchableOpacity key={snd.id} style={[s.moduleToggle, selectedSound === snd.id && s.moduleToggleActive]} onPress={() => setSelectedSound(snd.id)}>
              <Text style={s.moduleToggleLabel}>{String(snd.name || snd.id)}</Text>
              <View style={[s.checkbox, selectedSound === snd.id && s.checkboxOn]} />
            </TouchableOpacity>
          ))}
          <Btn title={saving ? t('common.loading') : t('common.save')} onPress={saveSound} disabled={saving} />
        </View>
      </View>
    );
  };

  /* ─── Language ─── */
  const renderLanguage = () => (
    <View style={s.sectionContent}>
      <Text style={s.sectionTitle}>{t('settings.languageTitle')}</Text>
      <Text style={s.sectionSubtitle}>{t('settings.languageDescription')}</Text>
      <View style={s.card}>
        <Text style={s.cardTitle}>{t('settings.languageTitle')}</Text>
        <Text style={s.cardDesc}>{t('settings.languageDescription')}</Text>
        <View style={s.langRow}>
          <TouchableOpacity style={[s.langBtn, language === 'en' && s.langBtnActive]} onPress={() => setLanguage('en')}>
            <Text style={[s.langBtnText, language === 'en' && s.langBtnTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.langBtn, language === 'ar' && s.langBtnActive]} onPress={() => setLanguage('ar')}>
            <Text style={[s.langBtnText, language === 'ar' && s.langBtnTextActive]}>العربية</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'overview': return renderOverview();
      case 'account': return renderAccount();
      case 'security': return renderSecurity();
      case 'store': return renderStore();
      case 'modules': return renderModules();
      case 'payments': return renderPayments();
      case 'receipt_theme': return renderReceiptTheme();
      case 'notifications': return renderNotifications();
      case 'language': return renderLanguage();
      default: return renderOverview();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t(SECTIONS.find(x => x.id === currentSection)?.labelKey || 'settings.title', { defaultValue: SECTIONS.find(x => x.id === currentSection)?.fallback || 'Settings' }) }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.sectionNav}>
          {SECTIONS.map(sec => (
            <TouchableOpacity key={sec.id} style={[s.sectionTab, currentSection === sec.id && s.sectionTabActive]} onPress={() => router.replace(`/settings/${sec.id}`)}>
              <Ionicons name={sec.icon as any} size={16} color={currentSection === sec.id ? '#00E5FF' : '#94A3B8'} />
              <Text style={[s.sectionTabText, currentSection === sec.id && s.sectionTabTextActive]}>{t(sec.labelKey, { defaultValue: sec.fallback })}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {renderContent()}
      </ScrollView>
    </>
  );
}

/* ─── FormField ─── */
function Fld({ label, value, onChange, multiline, kb, icon, secure, hint, onIcon, ph }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; kb?: any; icon?: string; secure?: boolean;
  hint?: string; onIcon?: () => void; ph?: string;
}) {
  return (
    <View style={s.fldWrap}>
      <Text style={s.fldLabel}>{label}</Text>
      {hint && <Text style={s.fldHint}>{hint}</Text>}
      <View style={s.fldInputWrap}>
        <TextInput
          style={[s.fldInput, multiline && s.fldInputMulti]}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          keyboardType={kb}
          secureTextEntry={secure}
          placeholder={ph}
          placeholderTextColor="#475569"
        />
        {icon && (
          <TouchableOpacity style={s.fldIcon} onPress={onIcon} disabled={!onIcon}>
            <Ionicons name={icon as any} size={18} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* ─── Save Button ─── */
function Btn({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity style={[s.saveBtn, disabled && { opacity: 0.5 }]} onPress={onPress} disabled={disabled}>
      <Text style={s.saveBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

/* ─── Styles ─── */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 40 },
  sectionNav: { marginBottom: 16, marginHorizontal: -4 },
  sectionTab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  sectionTabActive: { borderColor: '#00E5FF', backgroundColor: '#E0F7FF' },
  sectionTabText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  sectionTabTextActive: { color: '#00E5FF' },
  sectionContent: { gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, lineHeight: 20 },
  subHeading: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 8, marginBottom: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  cardDesc: { fontSize: 13, fontWeight: '600', color: '#475569', lineHeight: 18 },
  placeholder: { fontSize: 14, fontWeight: '600', color: '#64748B', lineHeight: 22 },
  statCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statTitle: { fontSize: 13, fontWeight: '700', color: '#475569' },
  statValue: { fontSize: 18, fontWeight: '900' },
  statDesc: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  actionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  actionDesc: { fontSize: 12, fontWeight: '600', color: '#475569' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  langRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  langBtn: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FFFFFF' },
  langBtnActive: { borderColor: '#00E5FF', backgroundColor: '#E0F7FF' },
  langBtnText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  langBtnTextActive: { color: '#00E5FF' },
  fldWrap: { gap: 4 },
  fldLabel: { fontSize: 12, fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5 },
  fldHint: { fontSize: 11, fontWeight: '600', color: '#475569' },
  fldInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingRight: 10 },
  fldInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#0F172A' },
  fldInputMulti: { minHeight: 80, textAlignVertical: 'top' },
  fldIcon: { padding: 4 },
  saveBtn: { backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4, borderWidth: 1, borderColor: '#0F172A' },
  saveBtnText: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  delBtn: { backgroundColor: '#7F1D1D', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  delBtnText: { fontSize: 15, fontWeight: '900', color: '#FCA5A5' },
  tfaSetup: { gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  activityText: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  activitySub: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  moduleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  moduleLabel: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  moduleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  moduleBadgeText: { fontSize: 10, fontWeight: '900', color: '#0F172A' },
  moduleToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', marginBottom: 10 },
  moduleToggleActive: { borderColor: '#00E5FF', backgroundColor: '#E0F7FF' },
  moduleToggleLabel: { fontSize: 12, fontWeight: '900', color: '#0F172A' },
  checkbox: { width: 22, height: 22, borderRadius: 8, borderWidth: 2, borderColor: '#CBD5E1', backgroundColor: 'transparent' },
  checkboxOn: { borderColor: '#00E5FF', backgroundColor: '#00E5FF' },
});
