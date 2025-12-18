import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleUser(profile: any, accessToken: string, refreshToken?: string) {
    const email = profile._json.email;
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.accessToken = accessToken;
    if (refreshToken) user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await this.userRepo.save(user);

    const jwt = this.jwtService.sign({ sub: user.id, email: user.email });
    return { access_token: jwt, user };
  }

  async validateJwt(payload: any) {
    return this.userRepo.findOne({ where: { id: payload.sub } });
  }
}
