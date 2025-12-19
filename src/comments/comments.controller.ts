import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from 'src/dtos/comments/create-comment.dto';
import { UpdateCommentDto } from 'src/dtos/comments/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':profileId')
  createComment(
    @CurrentUser('id') userId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(userId, profileId, dto);
  }

  @Put(':commentId')
  updateComment(
    @CurrentUser('id') userId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(userId, commentId, dto);
  }

  @Delete(':commentId')
  deleteComment(
    @CurrentUser('id') userId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.commentsService.deleteComment(userId, commentId);
  }

  @Get('profiles/:profileId')
  getProfileComments(@Param('profileId', ParseIntPipe) profileId: number) {
    return this.commentsService.getProfileComments(profileId);
  }

  @Get(':profileId/my-comments')
  getMyCommentsOnProfile(
    @CurrentUser('id') userId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    return this.commentsService.getMyCommentsOnProfile(userId, profileId);
  }

  @Get(':profileId/count')
  getCommentsCount(@Param('profileId', ParseIntPipe) profileId: number) {
    return this.commentsService.getCommentsCount(profileId);
  }

  @Get('my-comments')
  getMyComments(@CurrentUser('id') userId: number) {
    return this.commentsService.getMyComments(userId);
  }

  @Get(':commentId')
  getComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.getComment(commentId);
  }

  @Get('can-comment/:profileId')
  canCommentProfile(
    @CurrentUser('id') userId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    return this.commentsService.canCommentProfile(userId, profileId);
  }
}
