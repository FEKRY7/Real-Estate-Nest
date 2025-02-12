import {
  IsString,
  IsOptional,
  Length,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { CategoryType, PurposeType } from 'src/untils/enums';

export class UpdateListingDto {
  @IsString()
  @Length(1, 150)
  @IsOptional()
  title?: string;

  @IsString()
  @Length(1, 250)
  @IsOptional()
  description?: string;

  @IsString()
  @Length(1, 250)
  @IsOptional()
  address?: string;

  @IsEnum(CategoryType)
  @IsOptional()
  category?: CategoryType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @Max(100) // Assuming discount is percentage-based
  @IsOptional()
  discount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  bathrooms?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  bedrooms?: number;

  @IsBoolean()
  @IsOptional()
  furnished?: boolean;

  @IsBoolean()
  @IsOptional()
  parking?: boolean;

  @IsEnum(PurposeType)
  @IsOptional()
  purpose?: PurposeType;
}
