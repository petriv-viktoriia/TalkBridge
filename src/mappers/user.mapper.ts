import { User } from 'src/entities/user.entity';
import { UserDto } from 'src/dtos/users/user.dto';

export class UserMapper {
    static toDto(user: User): UserDto {
        const userDto = new UserDto();
        userDto.id = user.id;
        userDto.email = user.email;
        userDto.isActive = user.isActive;
        userDto.lastLogin = user.lastLogin;
        userDto.createdAt = user.createdAt;
        userDto.updatedAt = user.updatedAt;
        userDto.role = user.role;
        return userDto;
    }

    static toDtoList(users: User[]): UserDto[] {
        return users.map(user => this.toDto(user));
    }
}