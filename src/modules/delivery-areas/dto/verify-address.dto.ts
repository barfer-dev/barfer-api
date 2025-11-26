import { IsOptional, IsString } from 'class-validator';

export class VerifyAddressDto {
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  placeId?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  city?: string;
}
