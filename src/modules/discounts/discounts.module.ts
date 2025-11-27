import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { Discount, DiscountSchema } from '../../schemas/discount.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { AuthModule } from '../auth/auth.module';
import { OptionsModule } from '../options/options.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Discount.name, schema: DiscountSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    AuthModule,
    OptionsModule,
  ],
  controllers: [DiscountsController],
  providers: [DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule {} 