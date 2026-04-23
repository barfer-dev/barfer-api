import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AddressDto } from '../modules/address/dto/address.dto';
import { UserDto } from '../modules/users/dto/user.dto';
import { ProductDto } from '../modules/products/dto/product.dto';
import { DeliveryAreaDto } from '../modules/delivery-areas/dto/delivery-area.dto';

@Schema({
  timestamps: true,
  collection: 'orders_revendedores',
})
export class OrderRevendedor {
  @Prop({
    required: true,
  })
  total: number;

  @Prop({
    required: true,
  })
  items: ProductDto[];

  @Prop({
    required: false,
  })
  subTotal?: number;

  @Prop({
    required: false,
  })
  discount?: number;

  @Prop({
    required: false,
  })
  couponApplied?: string;

  @Prop({
    required: true,
  })
  address: AddressDto;

  @Prop({
    required: false,
  })
  user?: UserDto;

  @Prop({
    required: true,
  })
  deliveryArea: DeliveryAreaDto;
}

export const OrderRevendedorSchema = SchemaFactory.createForClass(OrderRevendedor);
