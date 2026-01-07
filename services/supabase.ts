
import { createClient } from '@supabase/supabase-js';

// ملاحظة: في بيئة الإنتاج يتم جلب هذه القيم من متغيرات البيئة
// سيتم استخدام قيم افتراضية هنا، ويجب استبدالها بقيم مشروعك من لوحة تحكم Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
