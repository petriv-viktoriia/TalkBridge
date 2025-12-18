import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestDto } from 'src/dtos/interests/interest.dto';
import { AssignInterestDto } from 'src/dtos/interests/assign.interest.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/entities/user.entity';
import { RolesGuard } from 'src/auth/role.guard';

@UseGuards(JwtAuthGuard)
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() dto: InterestDto) {
    return this.interestsService.create(dto);
  }

  @Get()
  findAll() {
    return this.interestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interestsService.findOne(+id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: InterestDto) {
    return this.interestsService.update(+id, dto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.interestsService.delete(+id);
  }
}
