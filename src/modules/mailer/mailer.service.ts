import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Order } from '../../schemas/order.schema';
import { formatPrice } from '../../common/utils/formatPrice';

@Injectable()
export class MailerService {
  constructor(private readonly configService: ConfigService) {}

  async sendMail(to: string, subject: string, text?: string, html?: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('EMAIL_FROM'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions: any = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to,
      subject,
    };

    if (text) mailOptions.text = text;
    if (html) mailOptions.html = html;

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error sending email');
    }
  }

  async sendPasswordResetEmail(userEmail: string, resetPasswordToken: string) {
    const subject = 'Reestablecer contraseña';
    const text = `Hola, has solicitado restablecer tu contraseña. Para hacerlo, haz click en el siguiente enlace: ${this.configService.get<string>('FRONTEND_BASE_URL')}/autenticacion/cambiar-contrasena/restablecer/${resetPasswordToken}`;

    await this.sendMail(userEmail, subject, text);
  }

  async sendOrderConfirmationEmail(userEmail: string, order: Order) {
    const subject = 'Confirmación de Pedido';
    const deliveryDate = order.deliveryDate || 'Fecha no especificada';

    const quantityTotal = order.items.reduce(
      (prev, acc) => acc.options[0].quantity + prev,
      0,
    );

    const productsHtml = order.items
      .map((product) => {
        const subTotal =
          product.options[0]?.price * product.options[0]?.quantity;
        const cashDiscount =
          order.paymentMethod === 'cash'
            ? (product.options[0]?.price * product.options[0]?.quantity * 10) /
              100
            : 0;
        const totalDiscount = (product.discountApplied || 0) + cashDiscount;
        const discountedPrice = subTotal - totalDiscount;

        return `
        <div style="background-color: #f7fafc; border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; gap: 16px;">
          <img src="${product.images[0]}" alt="Product" style="width: 70px; height: 70px; object-fit: cover; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
          <div style="flex: 1;">
            <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #2d3748;">${product.name}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #718096;">${product.options[0]?.name} · ${product.options[0]?.description}</p>
            <div style="display: inline-block; background-color: #e6fffa; color: #047857; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
              Cantidad: ${product.options[0]?.quantity}
            </div>
          </div>
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
            ${totalDiscount > 0 ? `
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #a0aec0; text-decoration: line-through;">${formatPrice(subTotal)}</p>
              <p style="margin: 0; font-size: 18px; font-weight: 700; color: #e53e3e;">${formatPrice(discountedPrice)}</p>
            ` : `
              <p style="margin: 0; font-size: 18px; font-weight: 700; color: #2d3748;">${formatPrice(subTotal)}</p>
            `}
          </div>
        </div>
      `;
      })
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #fff; border-radius: 16px; padding: 32px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="src/assets/logo.png" alt="Brand Logo" style="width: 90px; height: auto; border-radius: 999px; margin-bottom: 16px;" />
            <h1 style="font-size: 32px; font-weight: 700; color: #2d3748; margin: 0 0 8px 0;">¡Gracias por tu compra!</h1>
            <p style="font-size: 16px; color: #718096; margin: 0;">Tu pedido ha sido confirmado exitosamente</p>
          </div>

          <div style="background-color: #edf2f7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #718096;">Total del pedido</p>
                <p style="margin: 0; font-size: 28px; font-weight: 700; color: #2d3748;">${formatPrice(order.total)}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #718096;">Productos</p>
                <p style="margin: 0; font-size: 28px; font-weight: 700; color: #4299e1;">${quantityTotal}</p>
              </div>
            </div>
          </div>

          <h2 style="font-size: 18px; font-weight: 600; color: #2d3748; margin: 0 0 16px 0;">Productos en tu pedido</h2>
          
          ${productsHtml}
        </div>

        <div style="background-color: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h2 style="font-size: 18px; font-weight: 600; color: #2d3748; margin: 0 0 20px 0;">Detalles de envío</h2>
          <div style="display: grid; gap: 16px;">
            <div style="display: flex; align-items: start; gap: 12px;">
              <div style="width: 40px; height: 40px; background-color: #ebf8ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="font-size: 20px;">📅</span>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #718096;">Fecha de entrega</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #2d3748;">${deliveryDate}</p>
              </div>
            </div>
            <div style="display: flex; align-items: start; gap: 12px;">
              <div style="width: 40px; height: 40px; background-color: #fef5e7; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="font-size: 20px;">📍</span>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #718096;">Dirección</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #2d3748;">${order.address?.address}</p>
              </div>
            </div>
            <div style="display: flex; align-items: start; gap: 12px;">
              <div style="width: 40px; height: 40px; background-color: #f0fdf4; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="font-size: 20px;">📱</span>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #718096;">Teléfono</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #2d3748;">${order.address?.phone}</p>
              </div>
            </div>
            <div style="display: flex; align-items: start; gap: 12px;">
              <div style="width: 40px; height: 40px; background-color: #fce7f3; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="font-size: 20px;">💳</span>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #718096;">Método de pago</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #2d3748;">${order.paymentMethod === 'cash' ? 'A pagar en efectivo' : 'Pago con Mercado Pago'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    await this.sendMail(userEmail, subject, undefined, html);
  }
}
