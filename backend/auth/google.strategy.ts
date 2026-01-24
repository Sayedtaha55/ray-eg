import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    const clientID = String(configService.get<string>('GOOGLE_CLIENT_ID') || '').trim();
    const clientSecret = String(configService.get<string>('GOOGLE_CLIENT_SECRET') || '').trim();
    const callbackURL = String(
      configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:4000/api/v1/auth/google/callback',
    ).trim();

    console.log(
      `[GoogleStrategy] clientID_len=${clientID.length} secret_set=${clientSecret.length > 0} callbackURL=${callbackURL}`,
    );

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    } as any);
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any, done: any) {
    return done(null, profile);
  }
}
