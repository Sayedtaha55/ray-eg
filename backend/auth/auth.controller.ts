import { Body, Controller, Post, Res } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

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
  phone?: string;

  @IsOptional()
  @IsIn(['customer', 'merchant', 'CUSTOMER', 'MERCHANT'])
  role?: string;

  @IsOptional()
  @IsString()
  shopName?: string;

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
  shopPhone?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;

  @IsOptional()
  @IsString()
  addressDetailed?: string;

  @IsOptional()
  @IsString()
  shopDescription?: string;
}

class LoginDto {
  @IsString()
  email!: string;

  @IsString()
  password!: string;
}

@Controller('api/v1/auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

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

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signup(dto);
    if (result?.access_token) {
      this.setAuthCookie(res, String(result.access_token));
    }
    return result;
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto.email, dto.password);
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
}
