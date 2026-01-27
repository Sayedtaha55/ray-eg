import { IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';

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

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  @IsOptional()
  phone?: string;

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
  @IsOptional()
  governorate?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  city?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  @IsOptional()
  openingHours?: string;
}
