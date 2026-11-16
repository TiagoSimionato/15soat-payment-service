import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreatePaymentDto } from '../models/create-payment';
import { PaymentResponseDto } from '../models/payment.dto';
import { PaymentService } from '../services/payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body() dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentService.createPayment(dto);
  }

  @Get(':serviceOrderId')
  async getPaymentStatus(@Param('serviceOrderId', ParseIntPipe) serviceOrderId: number) {
    return this.paymentService.getPaymentStatus(serviceOrderId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any) {
    return this.paymentService.handleWebhook(body);
  }
}
