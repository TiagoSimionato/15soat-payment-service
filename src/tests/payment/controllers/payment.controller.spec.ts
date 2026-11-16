import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from '../../../modules/payment/controllers/payment.controller';
import { CreatePaymentDto } from '../../../modules/payment/models/create-payment';
import { PaymentResponseDto } from '../../../modules/payment/models/payment.dto';
import { PaymentService } from '../../../modules/payment/services/payment.service';

describe('paymentController', () => {
  let controller: PaymentController;

  const mockPaymentService = {
    createPayment: jest.fn<(dto: CreatePaymentDto) => Promise<PaymentResponseDto>>(),
    getPaymentStatus: jest.fn<(serviceOrderId: number) => Promise<PaymentResponseDto>>(),
    handleWebhook: jest.fn<(body: any) => Promise<{ received: boolean }>>(),
  };

  const mockPaymentDto: CreatePaymentDto = {
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

  const mockPaymentResponse: PaymentResponseDto = {
    checkoutUrl: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=TEST',
    orderId: 'ORDTST01KS5AJ6',
    serviceOrderId: 42,
    status: 'created',
    totalAmount: '1500.00',
  };

  const mockStatusResponse = {
    createdAt: '2026-11-16T10:00:00.000-03:00',
    externalReference: 'so-42',
    lastUpdatedAt: '2026-11-16T12:00:00.000-03:00',
    orderId: 'ORDTST01KS5AJ6',
    serviceOrderId: 42,
    status: 'processed',
    statusDetail: 'accredited',
    totalAmount: '1500.00',
    totalPaidAmount: '1500.00',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create a payment and return the response', async () => {
      mockPaymentService.createPayment.mockResolvedValue(mockPaymentResponse);

      const result = await controller.createPayment(mockPaymentDto);

      expect(mockPaymentService.createPayment).toHaveBeenCalledWith(mockPaymentDto);
      expect(mockPaymentService.createPayment).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPaymentResponse);
    });

    it('should accept different service order IDs', async () => {
      mockPaymentService.createPayment.mockResolvedValue({ ...mockPaymentResponse, serviceOrderId: 99 });

      const result = await controller.createPayment({ ...mockPaymentDto, serviceOrderId: 99 });

      expect(mockPaymentService.createPayment).toHaveBeenCalledWith({ ...mockPaymentDto, serviceOrderId: 99 });
      expect(result.serviceOrderId).toBe(99);
    });

    it('should propagate errors from service', async () => {
      mockPaymentService.createPayment.mockRejectedValue(new Error('MP API error'));

      await expect(controller.createPayment(mockPaymentDto)).rejects.toThrow('MP API error');
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status', async () => {
      mockPaymentService.getPaymentStatus.mockResolvedValue(mockStatusResponse as any);

      const result = await controller.getPaymentStatus(42);

      expect(mockPaymentService.getPaymentStatus).toHaveBeenCalledWith(42);
      expect(result).toEqual(mockStatusResponse);
    });

    it('should accept different service order IDs', async () => {
      mockPaymentService.getPaymentStatus.mockResolvedValue({ ...mockStatusResponse, serviceOrderId: 99 } as any);

      await controller.getPaymentStatus(99);

      expect(mockPaymentService.getPaymentStatus).toHaveBeenCalledWith(99);
    });
  });

  describe('handleWebhook', () => {
    it('should handle webhook and return received: true', async () => {
      mockPaymentService.handleWebhook.mockResolvedValue({ received: true });

      const body = { data: { action: 'payment.updated', id: 'ORDTST01KS5AJ6' }, type: 'order' };
      const result = await controller.handleWebhook(body);

      expect(mockPaymentService.handleWebhook).toHaveBeenCalledWith(body);
      expect(result).toEqual({ received: true });
    });

    it('should handle non-order webhooks', async () => {
      mockPaymentService.handleWebhook.mockResolvedValue({ received: true });

      const body = { data: { id: '12345' }, type: 'payment' };
      const result = await controller.handleWebhook(body);

      expect(mockPaymentService.handleWebhook).toHaveBeenCalledWith(body);
      expect(result).toEqual({ received: true });
    });
  });

  describe('Controller instantiation', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(controller.createPayment).toBeDefined();
      expect(controller.getPaymentStatus).toBeDefined();
      expect(controller.handleWebhook).toBeDefined();
    });
  });
});
