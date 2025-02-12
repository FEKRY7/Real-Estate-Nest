import { IsEmail, IsNotEmpty, MaxLength, IsString, IsNumberString } from 'class-validator';

export class ConfirmDto {
    @IsEmail()
    @MaxLength(250)
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(10)
    otp: string;  // Add OTP field here
}
