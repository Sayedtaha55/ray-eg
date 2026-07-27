export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  score: number;
}

export function validatePasswordPolicy(password: string): PasswordValidationResult {
  const pass = String(password || '');
  const errors: string[] = [];
  const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';

  if (pass.length < 8) {
    errors.push('كلمة المرور يجب ألا تقل عن 8 أحرف');
  }
  if (pass.length > 128) {
    errors.push('كلمة المرور طويلة جداً (الحد الأقصى 128 حرف)');
  }
  if (!/[a-z]/.test(pass)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف صغير على الأقل');
  }
  if (isProd && !/[A-Z]/.test(pass)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف كبير على الأقل');
  }
  if (!/[0-9]/.test(pass)) {
    errors.push('كلمة المرور يجب أن تحتوي على رقم على الأقل');
  }
  if (isProd && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pass)) {
    errors.push('كلمة المرور يجب أن تحتوي على رمز خاص على الأقل (!@#$%^&*)');
  }

  const commonWeak = [
    'password', '12345678', 'password1', 'qwerty123',
    'abc12345', 'iloveyou', 'admin123', 'letmein1',
    'welcome1', 'monkey123', 'passw0rd',
  ];
  const lower = pass.toLowerCase();
  if (commonWeak.includes(lower)) {
    errors.push('كلمة المرور شائعة جداً ويسهل تخمينها');
  }

  let score = 0;
  if (pass.length >= 8) score++;
  if (pass.length >= 12) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^a-zA-Z0-9]/.test(pass)) score++;
  if (!commonWeak.includes(lower)) score++;

  return { valid: errors.length === 0, errors, score };
}
