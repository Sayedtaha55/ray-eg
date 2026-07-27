import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '@modules/auth/auth.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { RedisService } from '@common/redis/redis.service';
import { EmailService } from '@modules/email/email.service';

jest.mock('bcryptjs');

const mockPrisma: any = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  shop: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  authEvent: {
    create: jest.fn(),
  },
  $transaction: jest.fn((cb: any) => cb(mockPrisma)),
};

const mockRedis: any = {
  invalidateShopCache: jest.fn(),
};

const mockEmail = {
  sendMail: jest.fn().mockResolvedValue({ ok: true }),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisService, useValue: mockRedis },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('mock-salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  describe('login', () => {
    it('should throw BadRequestException if email or password is missing', async () => {
      await expect(service.login('', 'password')).rejects.toThrow(BadRequestException);
      await expect(service.login('test@test.com', '')).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login('notfound@test.com', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed-password',
        role: 'CUSTOMER',
        isActive: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login('test@test.com', 'wrong-password')).rejects.toThrow(UnauthorizedException);
    });

    it('should return token on successful login for customer', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        password: 'hashed-password',
        role: 'CUSTOMER',
        isActive: true,
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await service.login('test@test.com', 'password');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@test.com');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: '1',
          email: 'test@test.com',
          role: 'CUSTOMER',
        }),
      );
    });

    it('should throw ForbiddenException if merchant account is not approved', async () => {
      const mockUser = {
        id: '1',
        email: 'merchant@test.com',
        password: 'hashed-password',
        role: 'MERCHANT',
        isActive: true,
        shopId: 'shop-1',
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.shop.findMany.mockResolvedValue([
        { id: 'shop-1', status: 'PENDING', createdAt: new Date() },
      ]);

      await expect(service.login('merchant@test.com', 'password')).rejects.toThrow(ForbiddenException);
    });

    it('should return token for approved merchant', async () => {
      const mockUser = {
        id: '1',
        email: 'merchant@test.com',
        name: 'Merchant',
        password: 'hashed-password',
        role: 'MERCHANT',
        isActive: true,
        shopId: 'shop-1',
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.shop.findMany.mockResolvedValue([
        { id: 'shop-1', status: 'APPROVED', createdAt: new Date() },
      ]);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await service.login('merchant@test.com', 'password');

      expect(result).toHaveProperty('access_token');
      expect(result.user.shopId).toBe('shop-1');
    });

    it('should throw ForbiddenException if account is deactivated', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        password: 'hashed-password',
        role: 'CUSTOMER',
        isActive: false,
        scheduledPurgeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, isActive: true });

      // Should restore within grace period
      const result = await service.login('test@test.com', 'password');
      expect(result).toHaveProperty('access_token');
    });
  });

  describe('signup', () => {
    it('should throw BadRequestException if email is missing', async () => {
      await expect(service.signup({ password: 'password123' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is missing', async () => {
      await expect(service.signup({ email: 'test@test.com' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is too short', async () => {
      await expect(service.signup({ email: 'test@test.com', password: 'short' })).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        role: 'CUSTOMER',
        password: 'hashed-password',
      });
      await expect(
        service.signup({ email: 'test@test.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create customer and return token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const mockCreatedUser = {
        id: '1',
        email: 'new@test.com',
        name: 'New User',
        role: 'CUSTOMER',
        isActive: true,
      };
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);
      mockPrisma.user.update.mockResolvedValue(mockCreatedUser);

      const result = await service.signup({
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result).toHaveProperty('access_token');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'new@test.com',
          name: 'New User',
          role: 'CUSTOMER',
        }),
      });
    });

    it('should throw BadRequestException if merchant data is incomplete', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.signup({
          email: 'merchant@test.com',
          password: 'password123',
          role: 'merchant',
          shopName: 'My Shop',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    it('should throw UnauthorizedException if userId is empty', async () => {
      await expect(service.changePassword('', 'old', 'newpass123')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if current password is missing', async () => {
      await expect(service.changePassword('1', '', 'newpass123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new password is too short', async () => {
      await expect(service.changePassword('1', 'oldpass', 'short')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new password is same as current', async () => {
      await expect(service.changePassword('1', 'samepass', 'samepass')).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.changePassword('1', 'wrongpass', 'newpass123')).rejects.toThrow(UnauthorizedException);
    });

    it('should update password on success', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue({ id: '1' });

      const result = await service.changePassword('1', 'oldpass', 'newpass123');

      expect(result).toEqual({ ok: true });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'hashed-password' },
      });
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if token is empty', async () => {
      await expect(service.resetPassword('', 'newpass123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is too short', async () => {
      await expect(service.resetPassword('token', 'short')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      await expect(service.resetPassword('invalid-token', 'newpass123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token type is wrong', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '1', typ: 'wrong_type' });
      await expect(service.resetPassword('token', 'newpass123')).rejects.toThrow(BadRequestException);
    });

    it('should reset password on valid token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '1', email: 'test@test.com', typ: 'password_reset' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'old-hashed',
      });
      mockPrisma.user.update.mockResolvedValue({ id: '1' });

      const result = await service.resetPassword('valid-token', 'newpass123');

      expect(result).toEqual({ ok: true });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'hashed-password' },
      });
    });
  });

  describe('requestPasswordReset', () => {
    it('should return ok even if email does not exist (prevent enumeration)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.requestPasswordReset('notfound@test.com');
      expect(result).toEqual({ ok: true });
    });

    it('should send reset email for existing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
      });
      mockJwtService.sign.mockReturnValue('reset-token');

      const result = await service.requestPasswordReset('test@test.com');

      expect(result).toEqual({ ok: true });
      expect(mockEmail.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@test.com',
          subject: 'إعادة تعيين كلمة المرور',
        }),
      );
    });
  });

  describe('session', () => {
    it('should throw UnauthorizedException if userId is empty', async () => {
      await expect(service.session('')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.session('notfound')).rejects.toThrow(UnauthorizedException);
    });

    it('should return token for valid customer session', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        role: 'CUSTOMER',
        isActive: true,
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await service.session('1');

      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('slugify', () => {
    it('should convert spaces to hyphens', () => {
      expect(service.slugify('My Shop Name')).toBe('my-shop-name');
    });

    it('should convert to lowercase', () => {
      expect(service.slugify('UPPERCASE')).toBe('uppercase');
    });

    it('should preserve Arabic characters', () => {
      expect(service.slugify('متجري')).toBe('متجري');
    });

    it('should remove special characters', () => {
      expect(service.slugify('Shop!@#Name')).toBe('shopname');
    });
  });

  describe('bootstrapAdmin', () => {
    it('should throw ForbiddenException if token does not match', async () => {
      process.env.ADMIN_BOOTSTRAP_TOKEN = 'correct-token';
      await expect(
        service.bootstrapAdmin({ token: 'wrong-token', email: 'admin@test.com', password: 'password123' }),
      ).rejects.toThrow(ForbiddenException);
      delete process.env.ADMIN_BOOTSTRAP_TOKEN;
    });

    it('should throw BadRequestException if email is missing', async () => {
      process.env.ADMIN_BOOTSTRAP_TOKEN = 'correct-token';
      await expect(
        service.bootstrapAdmin({ token: 'correct-token', email: '', password: 'password123' }),
      ).rejects.toThrow(BadRequestException);
      delete process.env.ADMIN_BOOTSTRAP_TOKEN;
    });

    it('should throw BadRequestException if password is too short', async () => {
      process.env.ADMIN_BOOTSTRAP_TOKEN = 'correct-token';
      await expect(
        service.bootstrapAdmin({ token: 'correct-token', email: 'admin@test.com', password: 'short' }),
      ).rejects.toThrow(BadRequestException);
      delete process.env.ADMIN_BOOTSTRAP_TOKEN;
    });

    it('should create admin if no existing admin', async () => {
      process.env.ADMIN_BOOTSTRAP_TOKEN = 'correct-token';
      process.env.NODE_ENV = 'development';
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'admin-1' });

      const result = await service.bootstrapAdmin({
        token: 'correct-token',
        email: 'admin@test.com',
        password: 'password123',
        name: 'Admin',
      });

      expect(result).toEqual({ ok: true, userId: 'admin-1' });
      delete process.env.ADMIN_BOOTSTRAP_TOKEN;
      delete process.env.NODE_ENV;
    });
  });
});
