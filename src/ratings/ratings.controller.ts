import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from 'src/dtos/ratings/create-rating.dto';
import { UpdateRatingDto } from 'src/dtos/ratings/update-rating.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post('profile/:profileId')
  rateProfile(
    @CurrentUser('id') userId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() dto: CreateRatingDto,
  ) {
    return this.ratingsService.rateProfile(userId, profileId, dto);
  }

  @Put('profile/:profileId')
  updateRating(
    @CurrentUser('id') userId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() dto: UpdateRatingDto,
  ) {
    return this.ratingsService.updateRating(userId, profileId, dto);
  }

  @Delete('profile/:profileId')
  deleteRating(
    @CurrentUser('id') userId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    return this.ratingsService.deleteRating(userId, profileId);
  }

  @Get('my-ratings')
  getMyRatings(@CurrentUser('id') userId: number) {
    return this.ratingsService.getMyRatings(userId);
  }

  @Get('my-rating/:profileId')
  getMyRatingForProfile(
    @CurrentUser('id') userId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    return this.ratingsService.getMyRatingForProfile(userId, profileId);
  }

  @Get('profile/:profileId')
  getProfileRatings(@Param('profileId', ParseIntPipe) profileId: number) {
    return this.ratingsService.getProfileRatings(profileId);
  }

  @Get('profile/:profileId/average')
  getProfileAverageRating(@Param('profileId', ParseIntPipe) profileId: number) {
    return this.ratingsService.getProfileAverageRating(profileId);
  }

  @Get('can-rate/:profileId')
  canRateProfile(
    @CurrentUser('id') userId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    return this.ratingsService.canRateProfile(userId, profileId);
  }
}
