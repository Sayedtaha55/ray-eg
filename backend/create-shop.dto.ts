import { IsString, IsOptional, IsEmail, MinLength, MaxLength, IsEnum } from 'class-validator';

export enum ShopCategory {
  RETAIL = 'RETAIL',
  RESTAURANT = 'RESTAURANT',
  SERVICE = 'SERVICE',
  ELECTRONICS = 'ELECTRONICS',
  FASHION = 'FASHION',
  FOOD = 'FOOD',
  HEALTH = 'HEALTH',
  OTHER = 'OTHER',
}

export class CreateShopDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @IsEnum(ShopCategory)
  category: ShopCategory;

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  @IsOptional()
  address?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  @IsOptional()
  addressDetailed?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  governorate: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  @IsOptional()
  openingHours?: string;
}
