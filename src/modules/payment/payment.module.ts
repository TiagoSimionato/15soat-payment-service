import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoPagoClient } from './clients/mercadoPago.client';
import { PaymentController } from './controllers/payment.controller';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './services/payment.service';

@Module({
  controllers: [PaymentController],
  imports: [TypeOrmModule.forFeature([Payment]), HttpModule],
  providers: [PaymentService, MercadoPagoClient],
})
export class PaymentModule {}
