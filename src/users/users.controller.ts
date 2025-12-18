import { Body, Controller, Delete, Get, Param, Post, Query, Put, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserCreateDto } from 'src/dtos/users/user.create.dto';
import { UserUpdateDto } from 'src/dtos/users/user.update.dto';
import { UserDto } from 'src/dtos/users/user.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: UserCreateDto): Promise<UserDto> {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UserUpdateDto): Promise<UserDto> {
    return this.usersService.update(parseInt(id, 10), updateUserDto);
  }

  @Get()
  async getUsers(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sortField') sortField: string,
    @Query('sortOrder') sortOrder: string,
  ) {
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const sortFieldParsed = sortField as any;
    const sortOrderParsed = sortOrder as any;

    return this.usersService.findAll(pageNumber, limitNumber, sortFieldParsed, sortOrderParsed);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.delete(parseInt(id, 10));
    return { message: `User with id ${id} has been deleted` };
  }

  @Get('me')
  getMe(@Req() req) {
    return this.usersService.findById(req.user.id);
  }

  // Оновити власний профіль
  @Put('me')
  updateMe(@Req() req, @Body() updateUserDto: UserUpdateDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  // Видалити власний акаунт
  @Delete('me')
  deleteMe(@Req() req) {
    return this.usersService.delete(req.user.id);
  }
}
