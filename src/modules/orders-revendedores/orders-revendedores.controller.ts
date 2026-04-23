import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersRevendedoresService } from './orders-revendedores.service';
import { CreateOrderRevendedorDto } from './dto/create-order-revendedor.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from '../../common/enums/roles.enum';

@Controller('orders-revendedores')
export class OrdersRevendedoresController {
  constructor(private readonly ordersRevendedoresService: OrdersRevendedoresService) { }

  @Post()
  @Auth(Roles.User)
  create(@Body() createOrderRevendedorDto: CreateOrderRevendedorDto) {
    return this.ordersRevendedoresService.create(createOrderRevendedorDto);
  }

  @Get()
  @Auth(Roles.Admin)
  findAll() {
    return this.ordersRevendedoresService.findAll();
  }
}
