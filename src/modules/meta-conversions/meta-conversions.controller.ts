import { Controller, Post, Body, Req } from '@nestjs/common';
import { MetaConversionsService } from './meta-conversions.service';
import { Request } from 'express';
import { AddToCartDto, ViewContentDto, PurchaseDto } from './dto/meta-conversion.dto';

@Controller('meta-conversions')
export class MetaConversionsController {
  constructor(
    private readonly metaConversionsService: MetaConversionsService,
  ) {}

  /**
   * Endpoint para trackear AddToCart con todos los campos de matching
   * Los datos de usuario (userData) ya vienen hasheados desde el frontend
   */
  @Post('add-to-cart')
  async addToCart(@Body() body: AddToCartDto, @Req() req: Request) {
    // Fallback: obtener IP y User Agent del request si no vienen en el body
    const ip = body.client_ip_address || (req.headers['x-forwarded-for'] as string) || req.connection.remoteAddress;
    const userAgent = body.client_user_agent || req.headers['user-agent'];

    return this.metaConversionsService.trackAddToCart(
      body.productId,
      body.value,
      body.email,
      ip as string,
      userAgent,
      body.contentIds,
      body.contents,
      body.numItems,
      body.contentCategory,
      body.eventId,
      // ⭐ NUEVOS CAMPOS
      body.fbc,
      body.fbp,
      body.client_ip_address,
      body.client_user_agent,
      body.event_source_url,
      body.userData,
    );
  }

  /**
   * Endpoint para trackear ViewContent con todos los campos de matching
   * Los datos de usuario (userData) ya vienen hasheados desde el frontend
   */
  @Post('view-content')
  async viewContent(@Body() body: ViewContentDto, @Req() req: Request) {
    // Fallback: obtener IP y User Agent del request si no vienen en el body
    const ip = body.client_ip_address || (req.headers['x-forwarded-for'] as string) || req.connection.remoteAddress;
    const userAgent = body.client_user_agent || req.headers['user-agent'];

    return this.metaConversionsService.trackViewContent(
      body.productId,
      body.value,
      body.currency,
      body.email,
      ip as string,
      userAgent,
      body.contentIds,
      body.contents,
      body.numItems,
      body.contentCategory,
      body.eventId,
      // ⭐ NUEVOS CAMPOS
      body.fbc,
      body.fbp,
      body.client_ip_address,
      body.client_user_agent,
      body.event_source_url,
      body.userData,
    );
  }

  /**
   * Endpoint para trackear Purchase con todos los campos de matching
   * Los datos de usuario (userData) ya vienen hasheados desde el frontend
   */
  @Post('purchase')
  async purchase(@Body() body: PurchaseDto, @Req() req: Request) {
    // Fallback: obtener IP y User Agent del request si no vienen en el body
    const ip = body.client_ip_address || (req.headers['x-forwarded-for'] as string) || req.connection.remoteAddress;
    const userAgent = body.client_user_agent || req.headers['user-agent'];

    // Usar transactionId como event_id para deduplicación
    const eventId = body.eventId || body.transactionId || `purchase_${body.orderId || Date.now()}`;

    return this.metaConversionsService.trackPurchase(
      eventId,
      body.value,
      ip as string,
      userAgent,
      body.email,
      body.contentIds,
      body.contents,
      body.numItems,
      body.orderId,
      // ⭐ NUEVOS CAMPOS
      body.fbc,
      body.fbp,
      body.client_ip_address,
      body.client_user_agent,
      body.event_source_url,
      body.userData,
    );
  }
}
