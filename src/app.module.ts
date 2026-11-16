import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { FallbackModule } from './modules/fallback/fallback.module';
import { HealthController } from './modules/health/controllers/health.controller';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    AuthModule,
    PaymentModule,
    FallbackModule,
  ],
  providers: [],
})
export class AppModule {}
