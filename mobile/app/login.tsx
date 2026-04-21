import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { Ionicons } from '@expo/vector-icons';
import brandLogo from '@/assets/images/brand-logo.png';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useAppPreferences();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('auth.loginFailed'));
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert(t('auth.loginFailed'), err?.response?.data?.message || err?.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        {/* Brand */}
        <View style={styles.brandArea}>
          <Image source={brandLogo} style={styles.brandLogo} resizeMode="contain" />
          <Text style={styles.brand}>من مكانك للأعمال</Text>
          <Text style={styles.subtitle}>{t('auth.welcomeTitle')} {t('auth.welcomeTitleHighlight')}</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.emailLabel')}
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.passwordLabel')}
              placeholderTextColor="#94A3B8"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.loginButton')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  brandArea: {
    alignItems: 'center',
    marginBottom: 36,
  },
  brandLogo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  brand: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 0,
  },
  button: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 15, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
});
