import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MercadoPagoClient } from './clients/mercadoPago.client';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';

@Module({
  controllers: [PaymentController],
  imports: [HttpModule],
  providers: [PaymentService, MercadoPagoClient],
})
export class PaymentModule {}
