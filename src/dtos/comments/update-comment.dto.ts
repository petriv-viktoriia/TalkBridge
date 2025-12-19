import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Content must not be empty' })
  @MaxLength(1000, { message: 'Content must not exceed 1000 characters' })
  content: string;
}
