import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MercadoPagoClient } from '../../../modules/payment/clients/mercadoPago.client';
import { Payment } from '../../../modules/payment/entities/payment.entity';
import { CreatePaymentDto } from '../../../modules/payment/models/create-payment';
import { PaymentService } from '../../../modules/payment/services/payment.service';

describe('paymentService', () => {
  let service: PaymentService;
  let mercadoPago: jest.Mocked<MercadoPagoClient>;
  let paymentRepo: jest.Mocked<Pick<import('typeorm').Repository<Payment>, 'findOneBy' | 'save'>>;

  const mockMpOrder = {
    capture_mode: 'automatic_async',
    checkout_url: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=TEST',
    client_token: 'TEST-CLIENT-TOKEN',
    country_code: 'BR',
    created_date: '2026-11-16T10:00:00.000-03:00',
    currency: 'BRL',
    expiration_time: 'P1D',
    external_reference: 'so-42',
    id: 'ORDTST01KS5AJ6',
    last_updated_date: '2026-11-16T10:00:00.000-03:00',
    processing_mode: 'manual',
    status: 'created',
    status_detail: 'created',
    total_amount: '1500.00',
    total_paid_amount: '0.00',
    type: 'online',
    user_id: '12345678',
  };

  const createPaymentDto: CreatePaymentDto = {
    cost: 1500.0,
    payer: {
      document: '12345678901',
      documentType: 'CPF',
      email: 'joao@email.com',
      name: 'João Silva',
    },
    serviceOrderId: 42,
    vehicle: {
      model: 'Fiat Uno',
      plate: 'ABC1D23',
    },
  };

  const mockPaymentEntity: Payment = {
    orderId: 'ORDTST01KS5AJ6',
    serviceOrderId: 42,
  };

  beforeEach(async () => {
    paymentRepo = {
      findOneBy: jest.fn(),
      save: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: MercadoPagoClient, useValue: { cancelOrder: jest.fn(), createOrder: jest.fn(), getOrder: jest.fn() } },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    mercadoPago = module.get<MercadoPagoClient>(MercadoPagoClient) as jest.Mocked<MercadoPagoClient>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createPayment', () => {
    it('should create a payment and return checkout URL', async () => {
      mercadoPago.createOrder.mockResolvedValue(mockMpOrder as any);
      paymentRepo.save.mockResolvedValue(mockPaymentEntity);

      const result = await service.createPayment(createPaymentDto);

      expect(result).toEqual({
        checkoutUrl: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=TEST',
        orderId: 'ORDTST01KS5AJ6',
        serviceOrderId: 42,
        status: 'created',
        totalAmount: '1500.00',
      });
      expect(mercadoPago.createOrder).toHaveBeenCalledTimes(1);
      expect(paymentRepo.save).toHaveBeenCalledWith({
        orderId: 'ORDTST01KS5AJ6',
        serviceOrderId: 42,
      });
    });

    it('should pass correct body to createOrder', async () => {
      mercadoPago.createOrder.mockResolvedValue(mockMpOrder as any);
      paymentRepo.save.mockResolvedValue(mockPaymentEntity);

      await service.createPayment(createPaymentDto);

      expect(mercadoPago.createOrder).toHaveBeenCalledWith({
        capture_mode: 'automatic_async',
        config: {
          online: {
            auto_return: 'approved',
            failure_url: expect.stringContaining('/payment/failure'),
            pending_url: expect.stringContaining('/payment/pending'),
            success_url: expect.stringContaining('/payment/success'),
          },
        },
        description: 'Ordem de serviço #42',
        expiration_time: 'P1D',
        external_reference: 'so-42',
        items: [
          {
            description: 'Fiat Uno - ABC1D23',
            quantity: 1,
            title: 'Ordem de serviço #42',
            total_amount: '1500.00',
            unit_measure: 'unit',
            unit_price: '1500.00',
          },
        ],
        payer: {
          email: 'joao@email.com',
          first_name: 'João',
          identification: { number: '12345678901', type: 'CPF' },
          last_name: 'Silva',
        },
        processing_mode: 'manual',
        total_amount: '1500.00',
        type: 'online',
      });
    });

    it('should use custom description when provided', async () => {
      mercadoPago.createOrder.mockResolvedValue(mockMpOrder as any);
      paymentRepo.save.mockResolvedValue(mockPaymentEntity);

      await service.createPayment({ ...createPaymentDto, description: 'Manutenção do motor' });

      expect(mercadoPago.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Manutenção do motor' }),
      );
    });

    it('should handle name with single word (no last name)', async () => {
      mercadoPago.createOrder.mockResolvedValue(mockMpOrder as any);
      paymentRepo.save.mockResolvedValue(mockPaymentEntity);

      await service.createPayment({ ...createPaymentDto, payer: { ...createPaymentDto.payer, name: 'Cher' } });

      expect(mercadoPago.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          payer: expect.objectContaining({ first_name: 'Cher', last_name: undefined }),
        }),
      );
    });

    it('should handle CNPJ document type', async () => {
      mercadoPago.createOrder.mockResolvedValue(mockMpOrder as any);
      paymentRepo.save.mockResolvedValue(mockPaymentEntity);

      await service.createPayment({
        ...createPaymentDto,
        payer: { ...createPaymentDto.payer, document: '12345678000195', documentType: 'CNPJ' },
      });

      expect(mercadoPago.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          payer: expect.objectContaining({
            identification: { number: '12345678000195', type: 'CNPJ' },
          }),
        }),
      );
    });

    it('should propagate errors from MercadoPagoClient', async () => {
      mercadoPago.createOrder.mockRejectedValue(new Error('MP API error'));

      await expect(service.createPayment(createPaymentDto)).rejects.toThrow('MP API error');
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status', async () => {
      paymentRepo.findOneBy.mockResolvedValue(mockPaymentEntity);
      mercadoPago.getOrder.mockResolvedValue({ ...mockMpOrder, status: 'processed', status_detail: 'accredited' } as any);

      const result = await service.getPaymentStatus(42);

      expect(paymentRepo.findOneBy).toHaveBeenCalledWith({ serviceOrderId: 42 });
      expect(mercadoPago.getOrder).toHaveBeenCalledWith('ORDTST01KS5AJ6');
      expect(result).toEqual({
        createdAt: '2026-11-16T10:00:00.000-03:00',
        externalReference: 'so-42',
        lastUpdatedAt: '2026-11-16T10:00:00.000-03:00',
        orderId: 'ORDTST01KS5AJ6',
        serviceOrderId: 42,
        status: 'processed',
        statusDetail: 'accredited',
        totalAmount: '1500.00',
        totalPaidAmount: '0.00',
      });
    });

    it('should throw NotFoundException when payment not found in DB', async () => {
      paymentRepo.findOneBy.mockResolvedValue(null);

      await expect(service.getPaymentStatus(99)).rejects.toThrow(NotFoundException);
      expect(mercadoPago.getOrder).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when MP order is null', async () => {
      paymentRepo.findOneBy.mockResolvedValue(mockPaymentEntity);
      mercadoPago.getOrder.mockResolvedValue(null as any);

      await expect(service.getPaymentStatus(42)).rejects.toThrow(NotFoundException);
    });
  });

  describe('handleWebhook', () => {
    it('should process order webhook and return received: true', async () => {
      mercadoPago.getOrder.mockResolvedValue({ ...mockMpOrder, status: 'processed' } as any);

      const result = await service.handleWebhook({
        data: { action: 'payment.updated', id: 'ORDTST01KS5AJ6' },
        type: 'order',
      });

      expect(result).toEqual({ received: true });
      expect(mercadoPago.getOrder).toHaveBeenCalledWith('ORDTST01KS5AJ6');
    });

    it('should ignore non-order webhooks', async () => {
      const result = await service.handleWebhook({
        data: { id: '12345' },
        type: 'payment',
      });

      expect(result).toEqual({ received: true });
      expect(mercadoPago.getOrder).not.toHaveBeenCalled();
    });
  });
});
