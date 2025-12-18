import { IsInt, IsOptional, IsString } from 'class-validator';

export class ProfileDto {
  @IsInt()
  @IsOptional()
  id?: number;

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

  @IsOptional()
  languages?: { id: number; name: string; level: string; type: string }[];
}
