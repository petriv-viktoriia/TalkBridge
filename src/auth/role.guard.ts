import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // отримуємо обов'язкові ролі
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) return false;

    // отримуємо роль користувача з бази
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return false;

    // якщо ролі не задано, дозволяємо доступ лише авторизованому користувачу
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // якщо ролі задано, перевіряємо
    return requiredRoles.includes(user.role);
  }
}
