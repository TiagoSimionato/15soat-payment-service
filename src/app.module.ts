import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceConfigs } from './configs/dataSourceConfigs';
import { AuthModule } from './modules/auth/auth.module';
import { FallbackModule } from './modules/fallback/fallback.module';
import { HealthController } from './modules/health/health/health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRoot({
      ...dataSourceConfigs,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/**/migrations/*{.ts,.js}'],
    }),
    AuthModule,
    FallbackModule,
  ],
  providers: [],
})
export class AppModule {}
