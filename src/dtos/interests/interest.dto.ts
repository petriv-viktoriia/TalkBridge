import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class InterestDto {
  @IsString()
  @IsNotEmpty({ message: 'Interest name should not be empty' })
  @IsOptional()
  name?: string;
}