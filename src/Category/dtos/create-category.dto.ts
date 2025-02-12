import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 250) // Ensures the length is between 1 and 250
  @IsNotEmpty()
  name: string;  // Use string type instead of number
}
