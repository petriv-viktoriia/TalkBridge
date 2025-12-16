import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { UserCreateDto } from 'src/dtos/users/user.create.dto';
import { UserUpdateDto } from 'src/dtos/users/user.update.dto';
import { UserDto } from 'src/dtos/users/user.dto';
import { UserMapper } from 'src/mappers/user.mapper';


const SORT_FIELDS = ['id', 'email', 'createdAt', 'updatedAt'] as const;
type SortField = typeof SORT_FIELDS[number];
type SortOrder = 'ASC' | 'DESC';

@Injectable()
export class UsersService {
        constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async findAll(page = 1, limit = 10, sortField: SortField = 'createdAt', sortOrder: SortOrder = 'DESC'): Promise<{ data: UserDto[]; total: number; page: number; limit: number }> {

        const [data, total] = await this.usersRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { [sortField]: sortOrder },
        });

        return { data: UserMapper.toDtoList(data), total, page, limit };
    }

    async create(createUserDto: UserCreateDto): Promise<UserDto> {
      const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
      if (existingUser) {
        throw new BadRequestException(`User with email ${createUserDto.email} already exists`);
      }

      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);
      return UserMapper.toDto(savedUser);
    }

    async update(id: number, dto: UserUpdateDto): Promise<UserDto> {
      await this.usersRepository.update(id, dto);

      const updatedUser = await this.usersRepository.findOne({ where: { id } });

      if (!updatedUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return UserMapper.toDto(updatedUser);
    }

    async delete(id: number): Promise<void> {
      if (!id) throw new BadRequestException('User id must be provided');

      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException(`User with id ${id} not found`);

      await this.usersRepository.delete(id);
    }
}
