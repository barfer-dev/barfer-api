import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponSchema, Coupon } from '../../schemas/coupon.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Address, AddressSchema } from '../../schemas/address.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { PaginationModule } from '../pagination/pagination.module';
import { ProductsModule } from '../products/products.module';
import { OptionsModule } from '../options/options.module';
import { CouponEligibilityService } from './services/coupon-eligibility.service';

@Module({
  controllers: [CouponsController],
  providers: [CouponsService, CouponEligibilityService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Coupon.name,
        schema: CouponSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Address.name,
        schema: AddressSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    PaginationModule,
    ProductsModule,
    OptionsModule,
  ],
  exports: [CouponsService],
})
export class CouponsModule {}
