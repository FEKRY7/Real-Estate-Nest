import { IsNotEmpty, IsOptional, IsString, Length, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
    
    @IsString()
    @Length(8, 150)
    @IsOptional()
    username?: string;

    @IsString()
    @Length(8, 150)
    @IsOptional()
    phone?: string;
}