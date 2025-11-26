import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { WeekDay } from '../../../schemas/delivery-area.schema';

export class SearchAreaRequestDto {
  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lon?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsEnum(WeekDay)
  currentDay: WeekDay;
} 