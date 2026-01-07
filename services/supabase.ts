
import { createClient } from '@supabase/supabase-js';

// ملاحظة للمطور: قم بوضع القيم الحقيقية من لوحة تحكم Supabase في إعدادات البيئة (Secrets) الخاصة بالمنصة
const getEnvVar = (name: string): string => {
  if (typeof window !== 'undefined' && (window as any).process?.env?.[name]) {
    return (window as any).process.env[name];
  }
  return '';
};

// القيم الافتراضية هنا هي "مكان محجوز" - سيتم استبدالها تلقائياً عند وضع المفاتيح في منصة النشر
const supabaseUrl = getEnvVar('SUPABASE_URL') || 'https://your-project-url.supabase.co';
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY') || 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
