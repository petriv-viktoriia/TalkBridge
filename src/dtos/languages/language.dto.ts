import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Transform } from 'class-transformer';
import { LanguageLevel, LanguageType } from "src/entities/language.entity";

export class LanguageDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()  
  name: string;

  @IsEnum(LanguageLevel)
  level: LanguageLevel;

  @IsEnum(LanguageType)
  type: LanguageType;
}