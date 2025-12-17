import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfileDto } from 'src/dtos/profiles/profile.dto';
import { AssignLanguagesDto } from 'src/dtos/languages/assign.languages.dto';

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

  @Put(':id/languages')
  assignLanguages(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignLanguagesDto,) {
    return this.profilesService.assignLanguages(id, dto);
  }

  @Delete(':id/languages')
  unassignLanguages(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignLanguagesDto,) {
    return this.profilesService.unassignLanguages(id, dto);
  }
}
