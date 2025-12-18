import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestDto } from 'src/dtos/interests/interest.dto';
import { AssignInterestDto } from 'src/dtos/interests/assign.interest.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

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

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: InterestDto) {
    return this.interestsService.update(+id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.interestsService.delete(+id);
  }

  @Put('assign/:profileId')
  assignInterestsToUser(@Param('profileId') profileId: string, @Body() dto: AssignInterestDto) {
    return this.interestsService.assignInterestsToProfile(+profileId, dto.interestIds);
  }

  @Delete('remove/:profileId/:interestId')
  removeInterest(@Param('profileId') profileId: string, @Param('interestId') interestId: string,) {
  return this.interestsService.removeInterestFromProfile(+profileId, +interestId);
  }
}
