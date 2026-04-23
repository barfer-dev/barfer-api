import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersRevendedoresService } from './orders-revendedores.service';
import { OrdersRevendedoresController } from './orders-revendedores.controller';
import { OrderRevendedor, OrderRevendedorSchema } from '../../schemas/order-revendedor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderRevendedor.name, schema: OrderRevendedorSchema },
    ]),
  ],
  controllers: [OrdersRevendedoresController],
  providers: [OrdersRevendedoresService],
  exports: [OrdersRevendedoresService],
})
export class OrdersRevendedoresModule {}
