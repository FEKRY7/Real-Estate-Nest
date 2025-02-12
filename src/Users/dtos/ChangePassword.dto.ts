import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChangePasswordDto {
    
    
    @IsString()
    @MaxLength(6)
    @IsNotEmpty()
    oldPassword: string;

    @IsString()
    @MaxLength(6)
    @IsNotEmpty()
    newPassword: string;
}