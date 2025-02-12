import { IsString, IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional() // Make name optional, just in case we don't update it
  name?: string;
}
 