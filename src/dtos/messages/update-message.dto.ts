import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(2000, { message: 'Message must not exceed 2000 characters' })
  content: string;
}
