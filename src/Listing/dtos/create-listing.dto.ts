import {
  IsString,
  IsNotEmpty,
  Length,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { CategoryType, PurposeType } from 'src/untils/enums';

export class CreateListingDto {
  @IsString()
  @Length(1, 150)
  @IsNotEmpty()
  title: string;

  @IsString()
  @Length(1, 250)
  @IsNotEmpty()
  description: string;

  @IsString()
  @Length(1, 250)
  @IsNotEmpty()
  address: string;

  @IsEnum(CategoryType)
  @IsNotEmpty()
  category: CategoryType;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  bathrooms: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  bedrooms: number;

  @IsBoolean()
  @IsOptional()
  furnished?: boolean;

  @IsBoolean()
  @IsOptional()
  parking?: boolean;

  @IsEnum(PurposeType)
  @IsNotEmpty()
  purpose: PurposeType;
}
