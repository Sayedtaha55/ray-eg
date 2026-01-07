
import { createClient } from '@supabase/supabase-js';

/**
 * إعدادات الربط مع Supabase
 * يتم جلب القيم من ملف .env في جذر المشروع
 */

const supabaseUrl = process.env.SUPABASE_URL || 'https://lsuewzeyfqmoqxflllmb.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdWV3emV5ZnFtb3F4ZmxsbG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjkwMjYsImV4cCI6MjA4MzM0NTAyNn0.vab-HI1aOvJxs_FJrnjxDbluFtucgiCn7qmDWzlVOzw';

// التحقق من وجود المفاتيح وتنبيه المبرمج في المتصفح بشكل احترافي
if (!supabaseUrl || supabaseUrl.includes('your-project-url') || !supabaseAnonKey) {
  console.warn(
    '%c [Supabase Configuration Required] %c\nيرجى وضع رابط المشروع ومفتاح الـ Anon في ملف .env لكي تعمل قاعدة البيانات.\nيمكنك العثور عليها في: Settings -> API',
    'background: #ff0055; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;',
    'color: #ff0055; font-weight: bold;'
  );
}

// إنشاء العميل - نستخدم قيم افتراضية مؤقتة لمنع توقف التطبيق (Runtime Crash)
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
