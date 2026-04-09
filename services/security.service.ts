const backendOnly = (): never => {
  throw new Error('SecurityService is backend-only. Use backend/security/security.service.ts');
};

/**
 * Security Service - Handles all security operations
 */

export class SecurityService {
  /**
   * Hash password with strong salt
   */
  static async hashPassword(password: string): Promise<string> {
    void password;
    return backendOnly();
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    void password;
    void hash;
    return backendOnly();
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    void password;
    return backendOnly();
  }

  /**
   * Generate JWT token with short expiry
   */
  static generateToken(payload: any): string {
    void payload;
    return backendOnly();
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): any {
    void token;
    return backendOnly();
  }

  /**
   * Generate refresh token (longer expiry)
   */
  static generateRefreshToken(payload: any): string {
    void payload;
    return backendOnly();
  }

  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    void input;
    return backendOnly();
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    void email;
    return backendOnly();
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    void length;
    return backendOnly();
  }
}

export default SecurityService;
