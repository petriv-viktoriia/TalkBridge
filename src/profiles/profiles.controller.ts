import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfileDto } from 'src/dtos/profiles/profile.dto';
import { AssignLanguagesDto } from 'src/dtos/languages/assign.languages.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/entities/user.entity';
import { RolesGuard } from 'src/auth/role.guard';
import { AssignInterestDto } from 'src/dtos/interests/assign.interest.dto';

@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  getMyProfile(@CurrentUser('id') userId: number) {
    return this.profilesService.findByUserId(userId);
  }

  @Put('me')
  updateMyProfile(@CurrentUser('id') userId: number, @Body() dto: ProfileDto) {
    return this.profilesService.updateByUserId(userId, dto);
  }

  @Delete('me')
  deleteMyProfile(@CurrentUser('id') userId: number) {
    return this.profilesService.deleteByUserId(userId);
  }


  @Put('me/languages')
  assignLanguages(@CurrentUser('id') userId: number, @Body() dto: AssignLanguagesDto,) {
    return this.profilesService.assignLanguagesByUserId(userId, dto);
  }

  @Delete('me/languages')
  unassignLanguages(@CurrentUser('id') userId: number, @Body() dto: AssignLanguagesDto,) {
    return this.profilesService.unassignLanguagesByUserId(userId, dto);
  }

  @Put('me/interests')
  assignInterests(@CurrentUser('id') userId: number, @Body() dto: AssignInterestDto,) {
    return this.profilesService.assignInterestsByUserId(userId, dto);
  }

  @Delete('me/interests')
  unassignInterests(@CurrentUser('id') userId: number, @Body() dto: AssignInterestDto) {
    return this.profilesService.removeInterestByUserId(userId, dto);
  }

  @Post()
  create(@Body() dto: ProfileDto): Promise<ProfileDto> {
    return this.profilesService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: ProfileDto): Promise<ProfileDto> {
    return this.profilesService.update(+id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProfileDto> {
    return this.profilesService.findOne(+id);
  }

  @Get()
  findAll( @Query('minAge') minAge?: string, @Query('maxAge') maxAge?: string): Promise<ProfileDto[]> {
    return this.profilesService.findAll(minAge ? parseInt(minAge, 10) : undefined, maxAge ? parseInt(maxAge, 10) : undefined);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.profilesService.delete(+id);
  }
}
