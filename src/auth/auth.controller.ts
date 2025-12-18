// auth.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport перенаправляє на Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req) {
    // Тут Passport вже встановив req.user
    const user = req.user;

    // Генеруємо JWT для фронтенду
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { access_token: token, user };
  }
}
