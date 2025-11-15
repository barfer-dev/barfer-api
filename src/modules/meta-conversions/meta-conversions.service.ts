import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class MetaConversionsService {
  constructor(private readonly configService: ConfigService) {}

  private readonly pixelId = '472718221706195';

  private async sendEventToMeta(eventParams: any) {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v13.0/${this.pixelId}/events?access_token=${this.configService.get('META_ACCESS_TOKEN')}`,
        { data: [eventParams] },
        { headers: { 'Content-Type': 'application/json' } },
      );

      return response.data;
    } catch (error) {
      console.error('Error enviando evento a Meta API:', error);
      throw new Error('Error enviando evento a Meta API');
    }
  }

  async trackAddToCart(
    productId: string,
    value: number,
    email: string,
    ip: string,
    userAgent: string,
    // Nuevos parámetros
    contentIds?: string[],
    contents?: Array<{ id: string; quantity: number; item_price?: number }>,
    numItems?: number,
    contentCategory?: string,
    eventId?: string, // Para deduplicación
  ) {
    const eventParams = {
      event_name: 'AddToCart',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_id: eventId || productId, // Usar eventId único si se pasa
      custom_data: {
        currency: 'ARS',
        value: value,
        content_type: 'product',
        content_ids: contentIds || [productId], // Array
        contents: contents, // Detalles
        num_items: numItems || 1,
        content_category: contentCategory,
      },
      user_data: {
        client_ip_address: ip,
        client_user_agent: userAgent,
        em: crypto.createHash('sha256').update(email).digest('hex'),
      },
    };
    return this.sendEventToMeta(eventParams);
  }

  async trackViewContent(
    productId: string,
    value: number,
    currency: string,
    email: string,
    ip: string,
    userAgent: string,
    // Nuevos
    contentIds?: string[],
    contents?: Array<{ id: string; quantity: number; item_price?: number }>,
    numItems?: number,
    contentCategory?: string,
    eventId?: string,
  ) {
    const eventParams = {
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_id: eventId || productId,
      custom_data: {
        currency: currency || 'ARS',
        value: value,
        content_type: 'product',
        content_ids: contentIds || [productId],
        contents: contents,
        num_items: numItems || 1,
        content_category: contentCategory,
      },
      user_data: {
        client_ip_address: ip,
        client_user_agent: userAgent,
        em: crypto.createHash('sha256').update(email).digest('hex'),
      },
    };
    return this.sendEventToMeta(eventParams);
  }

  async trackPurchase(
    eventId: string,
    totalValue: number,
    clientIp: string,
    userAgent: string,
    email: string,
    // Nuevos
    contentIds?: string[],
    contents?: Array<{ id: string; quantity: number; item_price?: number }>,
    numItems?: number,
    orderId?: string,
  ) {
    const eventParams = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_id: eventId,
      custom_data: {
        currency: 'ARS',
        value: totalValue,
        content_type: 'product',
        content_ids: contentIds, // Array de productos comprados
        contents: contents, // Detalles de cada uno
        num_items: numItems,
        order_id: orderId || eventId, // ID de la orden
      },
      user_data: {
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        em: crypto.createHash('sha256').update(email).digest('hex'),
      },
    };

    return this.sendEventToMeta(eventParams);
  }
}
