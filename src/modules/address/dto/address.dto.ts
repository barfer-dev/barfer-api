import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddressDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  reference: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  zipCode: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  floorNumber: string;

  @IsOptional()
  @IsString()
  departmentNumber: string;

  // New field: betweenStreets
  @IsOptional()
  @IsString()
  betweenStreets: string;
}
