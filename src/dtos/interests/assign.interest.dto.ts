import { ArrayNotEmpty, IsArray, IsInt } from "class-validator";

export class AssignInterestDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  interestIds: number[];
}