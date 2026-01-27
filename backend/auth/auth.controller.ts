import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  storePhone?: string;

  @IsOptional()
  @IsString()
  workingHours?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;

  @IsOptional()
  @IsString()
  addressDetailed?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  shopDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  storeType?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  governorate?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  shopEmail?: string;

  @IsOptional()
  @IsString()
  storeEmail?: string;

  @IsOptional()
  @IsIn(['customer', 'merchant', 'CUSTOMER', 'MERCHANT'])
  role?: string;
}

class LoginDto {
  @IsString()
  email!: string;

  @IsString()
  password!: string;
}

class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

class BootstrapAdminDto {
  @IsString()
  token!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

@Controller('api/v1/auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  private parseGoogleState(req: any) {
    const raw = String(req?.query?.state || '').trim();
    if (!raw) return {} as any;
    try {
      const decoded = Buffer.from(raw, 'base64url').toString('utf8');
      const parsed = JSON.parse(decoded);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {} as any;
    }
  }

  private normalizeReturnTo(returnTo: string | undefined) {
    const rt = String(returnTo || '').trim();
    if (!rt) return undefined;
    if (!rt.startsWith('/')) return undefined;
    if (rt.startsWith('//')) return undefined;
    return rt;
  }

  private getCookieOptions() {
    const env = String(process.env.NODE_ENV || '').toLowerCase();
    const isProd = env === 'production';
    const domainRaw = String(process.env.COOKIE_DOMAIN || '').trim();
    const domain = domainRaw || undefined;

    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      ...(domain ? { domain } : {}),
    } as any;
  }

  private setAuthCookie(res: Response, accessToken: string) {
    res.cookie('ray_session', accessToken, this.getCookieOptions());
  }

  private clearAuthCookie(res: Response) {
    res.clearCookie('ray_session', this.getCookieOptions());
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Request() req: any, @Res() res: Response) {
    const result = await this.authService.loginWithGoogleProfile(req.user);
    if (result?.access_token) {
      this.setAuthCookie(res, String(result.access_token));
    }

    const state = this.parseGoogleState(req);
    const returnTo = this.normalizeReturnTo(state?.returnTo);
    const followShopId = String(state?.followShopId || '').trim() || undefined;

    const appUrl = String(process.env.FRONTEND_APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173').trim();
    const base = appUrl.replace(/\/$/, '');
    const qs = new URLSearchParams();
    if (returnTo) qs.set('returnTo', returnTo);
    if (followShopId) qs.set('followShopId', followShopId);

    const redirectUrl = `${base}/auth/google/callback${qs.toString() ? `?${qs.toString()}` : ''}`;
    return res.redirect(302, redirectUrl);
  }

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signup(dto);
    const accessToken = (result as any)?.access_token;
    if (accessToken) {
      this.setAuthCookie(res, String(accessToken));
    }
    return result;
  }

  @Post('bootstrap-admin')
  async bootstrapAdmin(@Body() dto: BootstrapAdminDto) {
    return this.authService.bootstrapAdmin({
      token: String(dto?.token || ''),
      email: String(dto?.email || ''),
      password: String(dto?.password || ''),
      name: dto?.name,
    });
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto.email, dto.password);
    if (result?.access_token) {
      this.setAuthCookie(res, String(result.access_token));
    }
    return result;
  }

  @Post('dev-merchant-login')
  async devMerchantLogin(@Res({ passthrough: true }) res: Response) {
    const result = await this.authService.devMerchantLogin();
    if (result?.access_token) {
      this.setAuthCookie(res, String(result.access_token));
    }
    return result;
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  async session(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    const userId = String(req?.user?.id || '').trim();
    const result = await this.authService.session(userId);
    if (result?.access_token) {
      this.setAuthCookie(res, String(result.access_token));
    }
    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookie(res);
    return { ok: true };
  }

  @Post('password/forgot')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('password/reset')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('password/change')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    const userId = String(req?.user?.id || '').trim();
    return this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
  }
}
