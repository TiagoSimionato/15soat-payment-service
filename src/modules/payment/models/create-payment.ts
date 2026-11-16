import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export class PayerDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF must be 11 digits' })
  @Matches(/^\d{14}$/, { message: 'CNPJ must be 14 digits' })
  document: string;

  @IsIn(['CPF', 'CNPJ'])
  documentType: 'CNPJ' | 'CPF';
}

export class VehicleDto {
  @IsString()
  model: string;

  @IsString()
  plate: string;
}

export class CreatePaymentDto {
  @IsInt()
  serviceOrderId: number;

  @IsNumber()
  @Min(0)
  cost: number;

  @ValidateNested()
  @Type(() => PayerDto)
  payer: PayerDto;

  @ValidateNested()
  @Type(() => VehicleDto)
  vehicle: VehicleDto;

  @IsOptional()
  @IsString()
  description?: string;
}
