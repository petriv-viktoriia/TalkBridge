import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateRatingDto {
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Score must be at least 1' })
  @Max(5, { message: 'Score must not exceed 5' })
  score?: number;
}