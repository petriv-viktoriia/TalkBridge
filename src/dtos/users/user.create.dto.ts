import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class UserCreateDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Matches(/\S/, { message: 'Email cannot contain only spaces' })
  email: string;
}