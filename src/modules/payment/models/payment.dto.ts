export class PaymentResponseDto {
  orderId: string;
  serviceOrderId: number;
  checkoutUrl: string;
  status: string;
  totalAmount: string;
}
