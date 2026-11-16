import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MercadoPagoClient } from '../clients/mercadoPago.client';
import { CreatePaymentDto } from '../models/create-payment';
import { PaymentResponseDto } from '../models/payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly mercadoPago: MercadoPagoClient,
  ) {}

  async createPayment(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const amount = dto.cost.toFixed(2);
    const firstName = dto.payer.name.split(' ')[0];
    const lastName = dto.payer.name.split(' ').slice(1).join(' ') || undefined;

    const mpOrder = await this.mercadoPago.createOrder({
      capture_mode: 'automatic_async',
      config: {
        online: {
          auto_return: 'approved',
          failure_url: `${process.env.FRONTEND_URL}/payment/failure`,
          pending_url: `${process.env.FRONTEND_URL}/payment/pending`,
          success_url: `${process.env.FRONTEND_URL}/payment/success`,
        },
      },
      description: dto.description ?? `Ordem de serviço #${dto.serviceOrderId}`,
      expiration_time: 'P1D',
      external_reference: `so-${dto.serviceOrderId}`,
      items: [
        {
          description: `${dto.vehicle.model} - ${dto.vehicle.plate}`,
          quantity: 1,
          title: `Ordem de serviço #${dto.serviceOrderId}`,
          total_amount: amount,
          unit_measure: 'unit',
          unit_price: amount,
        },
      ],
      payer: {
        email: dto.payer.email,
        first_name: firstName,
        identification: {
          number: dto.payer.document,
          type: dto.payer.documentType,
        },
        last_name: lastName,
      },
      processing_mode: 'manual',
      total_amount: amount,
      type: 'online',
    });

    this.logger.log(`Payment created for service order ${dto.serviceOrderId}: ${mpOrder.id}`);

    return {
      checkoutUrl: mpOrder.checkout_url,
      orderId: mpOrder.id,
      serviceOrderId: dto.serviceOrderId,
      status: mpOrder.status,
      totalAmount: mpOrder.total_amount,
    };
  }

  async getPaymentStatus(orderId: string) {
    const mpOrder = await this.mercadoPago.getOrder(orderId);

    if (!mpOrder) {
      throw new NotFoundException('Payment not found');
    }

    return {
      createdAt: mpOrder.created_date,
      externalReference: mpOrder.external_reference,
      lastUpdatedAt: mpOrder.last_updated_date,
      orderId: mpOrder.id,
      status: mpOrder.status,
      statusDetail: mpOrder.status_detail,
      totalAmount: mpOrder.total_amount,
      totalPaidAmount: mpOrder.total_paid_amount,
    };
  }

  async handleWebhook(body: any) {
    const { data, type } = body;

    if (type === 'order') {
      const orderId = data.id;
      this.logger.log(`Webhook received for order ${orderId}, action: ${data.action}`);

      const mpOrder = await this.mercadoPago.getOrder(orderId);
      const serviceOrderId = mpOrder.external_reference?.replace('so-', '');

      this.logger.log(`Order ${orderId} (service order ${serviceOrderId}) status: ${mpOrder.status}`);
    }

    return { received: true };
  }
}
