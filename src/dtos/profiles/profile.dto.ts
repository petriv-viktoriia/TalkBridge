import { IsInt, IsOptional, IsString } from 'class-validator';

export class ProfileDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsInt({ message: 'userId must be a number' })
  @IsOptional()
  userId?: number;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsInt({ message: 'age must be a number' })
  @IsOptional()
  age?: number;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;

  @IsOptional()
  interests?: { id: number; name: string }[];
}
