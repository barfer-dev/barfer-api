import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AddressDto } from '../../address/dto/address.dto';
import { UserDto } from '../../users/dto/user.dto';
import { ProductDto } from '../../products/dto/product.dto';
import { DeliveryAreaDto } from '../../delivery-areas/dto/delivery-area.dto';

export class CreateOrderRevendedorDto {
  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsArray()
  @IsNotEmpty()
  items: ProductDto[];

  @IsOptional()
  @IsNumber()
  subTotal?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsString()
  couponApplied?: string;

  @IsNotEmpty()
  address: AddressDto;

  @IsOptional()
  user?: UserDto;

  @IsNotEmpty()
  deliveryArea: DeliveryAreaDto;
}
