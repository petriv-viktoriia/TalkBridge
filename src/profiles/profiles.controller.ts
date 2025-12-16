import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfileDto } from 'src/dtos/profiles/profile.dto';

@Controller('profiles')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) {}

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
}
