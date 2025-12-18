import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-google-oauth20';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly usersService: UsersService) {
    const options: StrategyOptions = {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!,
      scope: ['email', 'profile'],
    };
    super(options);
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { email } = profile._json;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Оновлюємо токени
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await this.usersService.updateTokens(user);

    return user;
  }
}
