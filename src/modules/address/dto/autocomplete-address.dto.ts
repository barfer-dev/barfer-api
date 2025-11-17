import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AutocompleteAddressDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsString()
  @IsOptional()
  city?: string;
}

