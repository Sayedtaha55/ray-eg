import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

const getJwtSecret = () => {
  const secret = String(process.env.JWT_SECRET || '').trim();
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return secret;
};

export class SecurityService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('يجب أن تحتوي على حرف صغير واحد على الأقل');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('يجب أن تحتوي على رقم واحد على الأقل');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('يجب أن تحتوي على رمز خاص واحد على الأقل');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static generateToken(payload: any): string {
    const options: SignOptions = {
      expiresIn: '15m',
    };
    return jwt.sign(payload, getJwtSecret(), options);
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, getJwtSecret());
    } catch (error) {
      throw new Error('Token غير صالح أو منتهي الصلاحية');
    }
  }

  static generateRefreshToken(payload: any): string {
    const options: SignOptions = {
      expiresIn: '7d',
    };
    return jwt.sign(payload, getJwtSecret(), options);
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 1000);
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase());
  }

  static generateSecureRandom(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export default SecurityService;
