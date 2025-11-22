import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import 'moment/locale/es';
import { formatPrice } from '../../common/utils/formatPrice';
import { GoogleAuthService } from './google-auth.service';

@Injectable()
export class GoogleSheetsService {
  private sheets: any;

  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService,
  ) {
    this.initializeGoogleSheets();
  }

  async initializeGoogleSheets() {
    this.sheets = await this.googleAuthService.getAuthClient();
  }

  async addOrderToSheet(order: any): Promise<void> {
    const spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID');
    const range = 'hoja!A1';

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const existingValues = response.data.values;
    const [deliveryDate, time] = order.deliveryDate.split(' de ');

    const STATUS = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Entregado',
      canceled: 'Cancelado',
    };

    const PAYMENT_METHOD = {
      cash: 'Efectivo',
      'mercado-pago': 'MercadoPago',
    };

    const values =
      existingValues && existingValues.length > 0
        ? this.getOrderValues(order, deliveryDate, time, STATUS, PAYMENT_METHOD)
        : this.getHeaderValues(
            order,
            deliveryDate,
            time,
            STATUS,
            PAYMENT_METHOD,
          );

    const resource = { values };
    const newRange = `hoja!A${existingValues ? existingValues.length + 1 : 1}`;

    await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: newRange,
      valueInputOption: 'RAW',
      requestBody: resource,
    });
  }

  async updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
    const spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID');
    const range = 'hoja!A2:Z'; // Comienza en A2 para evitar la fila de encabezado

    // Obtener todos los valores del rango
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    // Buscar la fila correspondiente al orderId
    const rowIndex = rows.findIndex((row) => row[0] === orderId);

    if (rowIndex === -1) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    // Actualizar el estado de la orden
    const statusColumnIndex = 15; // La columna de "Estado" es la columna 15, así que su índice es 14
    rows[rowIndex][statusColumnIndex] = newStatus;

    // +2 porque A1 es encabezado y +1 porque la fila empieza desde 1 en la hoja
    const updatedRange = `hoja!A${rowIndex + 2}:Z${rowIndex + 2}`;
    const resource = {
      values: [rows[rowIndex]],
    };

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updatedRange,
      valueInputOption: 'RAW',
      requestBody: resource,
    });
  }

  async verifyDataInSheet(): Promise<any[]> {
    const spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID');
    const range = 'hoja!A1:Z';

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values;
  }

  async addProductToSheet(product: any): Promise<void> {
    try {
      const spreadsheetId = this.configService.get<string>('GOOGLE_PRODUCT_SHEET_ID');
      const range = 'Sheet1!A1:Z';

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const existingValues = response.data.values;

      // Verificar si el producto ya existe en el sheet
      const productId = product.id || product._id;
      if (existingValues && existingValues.length > 1) { // Si hay más de 1 fila, hay productos
        const exists = existingValues.slice(1).some((row: any[]) => row[0] === productId);
        if (exists) {
          return;
        }
      }

      const values = existingValues && existingValues.length > 0
        ? this.getProductValues(product)
        : this.getProductHeaderValues(product);

      const resource = { values };
      const newRange = `Sheet1!A${existingValues ? existingValues.length + 1 : 1}`;

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: newRange,
        valueInputOption: 'RAW',
        requestBody: resource,
      });
    } catch (error) {
      console.error('Error al agregar producto al sheet:', error);
      throw error;
    }
  }

  private getOrderValues(
    order: any,
    deliveryDate: string,
    time: string,
    STATUS: any,
    PAYMENT_METHOD: any,
  ) {
    const products = order.items
      .map(
        (item: any) =>
          `${item.name} - ${item.options[0]?.name} - ${item.options[0]?.quantity}`,
      )
      .join('\n');

    let address = order.address.address;

    if (order.address.city) {
      address += `, ${order.address.city}`;
    }

    return [
      [
        order._id,
        moment(order.createdAt).locale('es').format('DD/MM'),
        deliveryDate,
        `${time}`,
        `${order.user.name} ${order.user.lastName}`,
        `${order.address.floorNumber ? 'Sí' : 'No'}`,
        address,
        `${order.address.reference !== undefined ? order.address.reference : ' '}`,
        `${
          order.address.floorNumber !== undefined &&
          order.address.floorNumber !== 'null' &&
          order.address.floorNumber !== null
            ? order.address.floorNumber
            : ' '
        }`,
        `${
          order.address.departmentNumber !== undefined &&
          order.address.departmentNumber !== 'null' &&
          order.address.departmentNumber !== null
            ? order.address.departmentNumber
            : ' '
        }`,
        `${order.user.phoneNumber || order.address.phone || ' '}`,
        order.user.email,
        products,
        formatPrice(order.total),
        PAYMENT_METHOD[order.paymentMethod],
        STATUS[order.status],
        order.notes !== undefined && order.notes.trim() !== ''
          ? order.notes
          : ' ',
        `${
          order.address.betweenStreets !== undefined &&
          order.address.betweenStreets.trim() !== ''
            ? `Entre calles: ${order.address.betweenStreets}`
            : ' '
        }`,
      ],
    ];
  }

  private getHeaderValues(
    order: any,
    deliveryDate: string,
    time: string,
    STATUS: any,
    PAYMENT_METHOD: any,
  ) {
    return [
      [
        'ID de pedido',
        'Fecha de pedido',
        'Fecha de entrega',
        'Horario de entrega',
        'Cliente',
        'Es departamento?',
        'Dirección',
        'Nota de dirección',
        'Piso',
        'Departamento',
        'Teléfono',
        'Email',
        'Productos',
        'Total',
        'Medio de Pago',
        'Estado',
        'Nota del pedido',
        'Entre calles',
      ],
      ...this.getOrderValues(order, deliveryDate, time, STATUS, PAYMENT_METHOD),
    ];
  }

  private formatProductForMerchant(product: any) {
    const firstOption = product.options && product.options.length > 0 ? product.options[0] : null;

    return {
      id: product.id || product._id,
      title: product.name,
      description: product.description || '',
      availability: (product.stock && product.stock > 0) || (firstOption && firstOption.stock > 0) ? 'in_stock' : 'out_of_stock',
      'availability date': '',
      'expiration date': '',
      link: product.link || `https://www.barferalimento.com/product/${product.id || product._id}`,
      'mobile link': '',
      'image link': product.images && product.images.length > 0 ? product.images[0] : '',
      price: firstOption ? `${firstOption.price} ARS` : (product.price ? `${product.price} ARS` : '0 ARS'),
      'sale price': product.offerPrice ? `${product.offerPrice} ARS` : '',
      'sale price effective date': '',
      'identifier exists': 'no',
      gtin: '',
      mpn: '',
      brand: product.category?.name || 'Barfer',
      'product highlight': '',
      'product detail': '',
      'additional image link': product.images && product.images.length > 1 ? product.images.slice(1).join(', ') : '',
      condition: 'new',
      adult: 'no',
      color: '',
      size: firstOption ? firstOption.name : '',
      'size type': '',
      'size system': '',
      gender: '',
      material: '',
      pattern: '',
      'age group': product.category?.name?.toLowerCase().includes('gato') ? 'adult' : 'adult',
      multipack: '',
      'is bundle': 'no',
      'unit pricing measure': firstOption ? `${firstOption.description?.split(' ')[0]} kg` : '',
      'unit pricing base measure': '',
      'energy efficiency class': '',
      'min energy efficiency class': '',
      'max energy efficiency class': '',
      'item group id': product.id || product._id,
      'sell on google quantity': firstOption ? firstOption.stock : (product.stock || 0),
    };
  }

  private getProductValues(product: any) {
    const formatted = this.formatProductForMerchant(product);
    return [Object.values(formatted)];
  }

  private getProductHeaderValues(product: any) {
    const formatted = this.formatProductForMerchant(product);
    return [
      Object.keys(formatted),
      Object.values(formatted),
    ];
  }
}
