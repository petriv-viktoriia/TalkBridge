import { Type } from "class-transformer";
import { IsArray, IsInt } from "class-validator";

export class AssignLanguagesDto {
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  languageIds: number[];
}