import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * User data ya hasheado desde el frontend
 * NO hay que hashear nuevamente en el backend
 */
export class MetaUserDataDto {
  @IsOptional()
  @IsString()
  em?: string; // Email hasheado (SHA-256)

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fn?: string[]; // First name hasheado (SHA-256) - array para múltiples variantes

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ln?: string[]; // Last name hasheado (SHA-256) - array para múltiples variantes

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ph?: string[]; // Phone hasheado (SHA-256) - array para múltiples variantes
}

export class ContentDto {
  @IsString()
  id: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  item_price?: number;
}

export class BaseMetaConversionDto {
  @IsString()
  productId: string;

  @IsNumber()
  value: number;

  @IsString()
  currency: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentDto)
  contents?: ContentDto[];

  @IsOptional()
  @IsNumber()
  numItems?: number;

  @IsOptional()
  @IsString()
  contentCategory?: string;

  @IsOptional()
  @IsString()
  eventId?: string;

  // ⭐ NUEVOS CAMPOS - Facebook Click ID
  @IsOptional()
  @IsString()
  fbc?: string;

  // ⭐ NUEVOS CAMPOS - Facebook Browser ID
  @IsOptional()
  @IsString()
  fbp?: string;

  // ⭐ NUEVOS CAMPOS - IP del cliente (no del servidor)
  @IsOptional()
  @IsString()
  client_ip_address?: string;

  // ⭐ NUEVOS CAMPOS - User Agent del cliente
  @IsOptional()
  @IsString()
  client_user_agent?: string;

  // ⭐ NUEVOS CAMPOS - URL de origen del evento
  @IsOptional()
  @IsString()
  event_source_url?: string;

  // ⭐ NUEVOS CAMPOS - Datos del usuario ya hasheados
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MetaUserDataDto)
  userData?: MetaUserDataDto;
}

export class AddToCartDto extends BaseMetaConversionDto {}

export class ViewContentDto extends BaseMetaConversionDto {}

export class PurchaseDto extends BaseMetaConversionDto {
  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
