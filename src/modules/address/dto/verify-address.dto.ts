import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyAddressDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  city?: string;
}

