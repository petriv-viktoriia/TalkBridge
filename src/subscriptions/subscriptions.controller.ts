import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post(':profileId')
  subscribe(@CurrentUser('id') userId: number, @Param('profileId', ParseIntPipe) profileId: number,) {
    return this.subscriptionsService.subscribe(userId, profileId);
  }

  @Delete(':profileId')
  unsubscribe(@CurrentUser('id') userId: number, @Param('profileId', ParseIntPipe) profileId: number,) {
    return this.subscriptionsService.unsubscribe(userId, profileId);
  }

  @Post(':subscriptionId/reject')
  rejectSubscription(@CurrentUser('id') userId: number, @Param('subscriptionId', ParseIntPipe) subscriptionId: number,) {
    return this.subscriptionsService.rejectSubscription(userId, subscriptionId);
  }

  @Get('following')
  getMySubscriptions(@CurrentUser('id') userId: number) {
    return this.subscriptionsService.getMySubscriptions(userId);
  }

  @Get('followers')
  getMyFollowers(@CurrentUser('id') userId: number) {
    return this.subscriptionsService.getMyFollowers(userId);
  }

  @Get('matches')
  getMyMatches(@CurrentUser('id') userId: number) {
    return this.subscriptionsService.getMyMatches(userId);
  }

  @Get('stats')
  getStats(@CurrentUser('id') userId: number) {
    return this.subscriptionsService.getSubscriptionStats(userId);
  }

  @Get('check-match/:profileId')
  checkMatch(@CurrentUser('id') userId: number, @Param('profileId', ParseIntPipe) profileId: number,) {
    return this.subscriptionsService.checkMatch(userId, profileId);
  }
}