import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfileDto } from 'src/dtos/profiles/profile.dto';
import { AssignLanguagesDto } from 'src/dtos/languages/assign.languages.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

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

  @Post()
  create(@Body() dto: ProfileDto): Promise<ProfileDto> {
    return this.profilesService.create(dto);
  }

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

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.profilesService.delete(+id);
  }

  @Put('me/languages')
  assignLanguages(@CurrentUser('id') userId: number, @Body() dto: AssignLanguagesDto,) {
    return this.profilesService.assignLanguagesByUserId(userId, dto);
  }

  @Delete('me/languages')
  unassignLanguages(@CurrentUser('id') userId: number, @Body() dto: AssignLanguagesDto,) {
    return this.profilesService.unassignLanguagesByUserId(userId, dto);
  }
}
