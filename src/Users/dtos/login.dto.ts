import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(250)
  @IsNotEmpty()
  email: string;

  @IsString()
  @MaxLength(6)
  @IsNotEmpty()
  password: string;
}
