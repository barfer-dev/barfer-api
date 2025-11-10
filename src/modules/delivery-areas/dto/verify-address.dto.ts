import { IsString } from 'class-validator';

export class VerifyAddressDto {
  @IsString()
  address: string;
}
