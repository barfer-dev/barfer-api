import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderRevendedor } from '../../schemas/order-revendedor.schema';
import { CreateOrderRevendedorDto } from './dto/create-order-revendedor.dto';

@Injectable()
export class OrdersRevendedoresService {
  constructor(
    @InjectModel(OrderRevendedor.name)
    private readonly orderRevendedorModel: Model<OrderRevendedor>,
  ) { }

  async create(createOrderRevendedorDto: CreateOrderRevendedorDto): Promise<OrderRevendedor> {
    try {
      const newOrder = new this.orderRevendedorModel(createOrderRevendedorDto);
      const saved = await newOrder.save();
      return saved;
    } catch (error) {
      console.error('ERROR AL GUARDAR CONTACTO EN DB:', error);
      throw error;
    }
  }

  async findAll(): Promise<OrderRevendedor[]> {
    return this.orderRevendedorModel.find().sort({ createdAt: -1 }).exec();
  }
}
