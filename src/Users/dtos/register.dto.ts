import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class RegisterDto {
    
    @IsString()
    @Length(8, 150)
    @IsNotEmpty()
    username: string;

    @IsEmail()
    @MaxLength(250)
    @IsNotEmpty()
    email: string;
    
    @IsString()
    @MaxLength(6)
    @IsNotEmpty()
    password: string;

    @IsString()
    @Length(8, 150)
    @IsNotEmpty()
    phone:string
}