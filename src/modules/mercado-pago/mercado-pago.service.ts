import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { MpOrderDto } from './dto/order-mp.dto';

@Injectable()
export class MercadoPagoService {
  private accessToken: string;

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
  }

  async create(createMercadoPagoDto: MpOrderDto) {
    const url = this.configService.get<string>('MP_BASE_URL');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };

    if (!this.accessToken) {
      console.error('[MP] MP_ACCESS_TOKEN is not configured');
    }
    console.log('[MP] Creating preference at:', url);
    console.log('[MP] notification_url:', createMercadoPagoDto.notification_url);

    try {
      const response = await axios.post(url, createMercadoPagoDto, { headers });
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.error(
        'Error creating Mercado Pago order — HTTP status:',
        status,
        '| data:',
        JSON.stringify(data),
        '| message:',
        error.message,
      );
      throw new HttpException(
        'Failed to create Mercado Pago order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPayment(paymentId: string) {
    const url = `${this.configService.get<string>('MP_PAYMENT_URL')}/${paymentId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.error(
        'Error getting Mercado Pago payment — HTTP status:',
        status,
        '| data:',
        JSON.stringify(data),
        '| message:',
        error.message,
      );
      throw new HttpException(
        'Failed to get Mercado Pago payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
