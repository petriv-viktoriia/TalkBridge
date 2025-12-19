import { IsInt, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(1, { message: 'Score must be at least 1' })
  @Max(5, { message: 'Score must not exceed 5' })
  score: number;
}