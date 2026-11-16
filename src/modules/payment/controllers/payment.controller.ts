import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CreatePaymentDto } from '../models/create-payment';
import { PaymentResponseDto } from '../models/payment.dto';
import { PaymentService } from '../services/payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentService.createPayment(dto);
  }

  @Get(':orderId')
  async getStatus(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentStatus(orderId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() body: any) {
    return this.paymentService.handleWebhook(body);
  }
}
