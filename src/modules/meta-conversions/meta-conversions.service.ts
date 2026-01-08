import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

interface MetaUserData {
  client_ip_address?: string;
  client_user_agent?: string;
  em?: string | string[]; // Email hasheado
  fn?: string[]; // First name hasheado
  ln?: string[]; // Last name hasheado
  ph?: string[]; // Phone hasheado
  fbc?: string; // Facebook Click ID
  fbp?: string; // Facebook Browser ID
}

interface MetaEventParams {
  event_name: string;
  event_time: number;
  action_source: string;
  event_id: string;
  event_source_url?: string;
  custom_data: {
    currency: string;
    value: number;
    content_type: string;
    content_ids?: string[];
    contents?: Array<{ id: string; quantity: number; item_price?: number }>;
    num_items?: number;
    content_category?: string;
    order_id?: string;
  };
  user_data: MetaUserData;
}

@Injectable()
export class MetaConversionsService {
  private readonly logger = new Logger(MetaConversionsService.name);

  constructor(private readonly configService: ConfigService) { }

  private readonly pixelId = '472718221706195';

  private async sendEventToMeta(eventParams: MetaEventParams) {
    try {
      this.logger.log(`Enviando evento ${eventParams.event_name} a Meta Conversions API`);
      this.logger.debug(`Event ID: ${eventParams.event_id}`);

      const accessToken = this.configService.get('META_ACCESS_TOKEN');
      const response = await axios.post(
        `https://graph.facebook.com/v24.0/${this.pixelId}/events?access_token=${accessToken}`,
        {
          data: [eventParams]
        },
        { headers: { 'Content-Type': 'application/json' } },
      );

      this.logger.log(`Evento ${eventParams.event_name} enviado exitosamente`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error enviando evento a Meta API: ${error.message}`);
      if (error.response?.data) {
        this.logger.error('Respuesta de Meta API:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Error enviando evento a Meta API: ${error.message}`);
    }
  }

  /**
   * Construye el objeto user_data con todos los campos de matching disponibles
   * Los datos ya vienen hasheados desde el frontend con SHA-256
   * NO hay que hashearlos nuevamente
   */
  private buildUserData(params: {
    email: string;
    clientIp?: string;
    userAgent?: string;
    fbc?: string;
    fbp?: string;
    userData?: {
      em?: string;
      fn?: string[];
      ln?: string[];
      ph?: string[];
    };
  }): MetaUserData {
    const userData: MetaUserData = {};

    // IP y User Agent del cliente
    if (params.clientIp) {
      userData.client_ip_address = params.clientIp;
    }
    if (params.userAgent) {
      userData.client_user_agent = params.userAgent;
    }

    // Facebook Click ID (fbc) - solo disponible si llegó desde un anuncio
    if (params.fbc) {
      userData.fbc = params.fbc;
    }

    // Facebook Browser ID (fbp) - siempre disponible después de que el pixel se carga
    if (params.fbp) {
      userData.fbp = params.fbp;
    }

    // Email - priorizar el que viene en userData (ya hasheado) o hashear el que viene como string
    if (params.userData?.em) {
      userData.em = params.userData.em;
    } else if (params.email) {
      userData.em = crypto.createHash('sha256').update(params.email.toLowerCase().trim()).digest('hex');
    }

    // First Name - ya viene hasheado desde el frontend
    if (params.userData?.fn && params.userData.fn.length > 0) {
      userData.fn = params.userData.fn;
    }

    // Last Name - ya viene hasheado desde el frontend
    if (params.userData?.ln && params.userData.ln.length > 0) {
      userData.ln = params.userData.ln;
    }

    // Phone - ya viene hasheado desde el frontend
    if (params.userData?.ph && params.userData.ph.length > 0) {
      userData.ph = params.userData.ph;
    }

    return userData;
  }

  /**
   * Trackea el evento AddToCart con todos los campos de matching de usuario
   */
  async trackAddToCart(
    productId: string,
    value: number,
    email: string,
    ip: string,
    userAgent: string,
    contentIds?: string[],
    contents?: Array<{ id: string; quantity: number; item_price?: number }>,
    numItems?: number,
    contentCategory?: string,
    eventId?: string,
    // ⭐ NUEVOS PARÁMETROS
    fbc?: string,
    fbp?: string,
    clientIp?: string,
    clientUserAgent?: string,
    eventSourceUrl?: string,
    userData?: {
      em?: string;
      fn?: string[];
      ln?: string[];
      ph?: string[];
    },
  ) {
    const eventParams: MetaEventParams = {
      event_name: 'AddToCart',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_id: eventId || `add_to_cart_${productId}`,
      event_source_url: eventSourceUrl,
      custom_data: {
        currency: 'ARS',
        value: value,
        content_type: 'product',
        content_ids: contentIds || [productId],
        contents: contents,
        num_items: numItems || 1,
        content_category: contentCategory,
      },
      user_data: this.buildUserData({
        email,
        clientIp: clientIp || ip,
        userAgent: clientUserAgent || userAgent,
        fbc,
        fbp,
        userData,
      }),
    };

    return this.sendEventToMeta(eventParams);
  }

  /**
   * Trackea el evento ViewContent con todos los campos de matching de usuario
   */
  async trackViewContent(
    productId: string,
    value: number,
    currency: string,
    email: string,
    ip: string,
    userAgent: string,
    contentIds?: string[],
    contents?: Array<{ id: string; quantity: number; item_price?: number }>,
    numItems?: number,
    contentCategory?: string,
    eventId?: string,
    // ⭐ NUEVOS PARÁMETROS
    fbc?: string,
    fbp?: string,
    clientIp?: string,
    clientUserAgent?: string,
    eventSourceUrl?: string,
    userData?: {
      em?: string;
      fn?: string[];
      ln?: string[];
      ph?: string[];
    },
  ) {
    const eventParams: MetaEventParams = {
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_id: eventId || `view_content_${productId}`,
      event_source_url: eventSourceUrl,
      custom_data: {
        currency: currency || 'ARS',
        value: value,
        content_type: 'product',
        content_ids: contentIds || [productId],
        contents: contents,
        num_items: numItems || 1,
        content_category: contentCategory,
      },
      user_data: this.buildUserData({
        email,
        clientIp: clientIp || ip,
        userAgent: clientUserAgent || userAgent,
        fbc,
        fbp,
        userData,
      }),
    };

    return this.sendEventToMeta(eventParams);
  }

  /**
   * Trackea el evento Purchase con todos los campos de matching de usuario
   */
  async trackPurchase(
    eventId: string,
    totalValue: number,
    clientIp: string,
    userAgent: string,
    email: string,
    contentIds?: string[],
    contents?: Array<{ id: string; quantity: number; item_price?: number }>,
    numItems?: number,
    orderId?: string,
    // ⭐ NUEVOS PARÁMETROS
    fbc?: string,
    fbp?: string,
    clientIpOverride?: string,
    clientUserAgentOverride?: string,
    eventSourceUrl?: string,
    userData?: {
      em?: string;
      fn?: string[];
      ln?: string[];
      ph?: string[];
    },
  ) {
    const eventParams: MetaEventParams = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_id: eventId || `purchase_${orderId}`,
      event_source_url: eventSourceUrl,
      custom_data: {
        currency: 'ARS',
        value: totalValue,
        content_type: 'product',
        content_ids: contentIds,
        contents: contents,
        num_items: numItems,
        order_id: orderId || eventId,
      },
      user_data: this.buildUserData({
        email,
        clientIp: clientIpOverride || clientIp,
        userAgent: clientUserAgentOverride || userAgent,
        fbc,
        fbp,
        userData,
      }),
    };

    return this.sendEventToMeta(eventParams);
  }
}
