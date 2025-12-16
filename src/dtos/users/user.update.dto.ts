import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  lastLogin?: Date;
}
