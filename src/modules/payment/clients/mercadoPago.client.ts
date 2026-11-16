import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient } from '../../../common/utils/http.client';
import { OAuthTokenResponse, OrderCreateBody, OrderResponse } from '../models/payment.model';

@Injectable()
export class MercadoPagoClient extends HttpClient {
  protected readonly serviceUrl = 'https://api.mercadopago.com';

  protected async getBearerToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiry - 30_000) {
      return this.cachedToken;
    }

    this.logger.debug('Fetching new access token from Mercado Pago OAuth');

    const response = await firstValueFrom(
      this.httpService.post<OAuthTokenResponse>(
        'https://api.mercadopago.com/oauth/token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
        },
        { headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const { access_token, expires_in } = response.data;
    this.cachedToken = access_token;
    this.tokenExpiry = Date.now() + expires_in * 1000;

    this.logger.debug(`Token acquired, expires in ${expires_in}s`);
    return access_token;
  }

  async createOrder(body: OrderCreateBody, idempotencyKey?: string) {
    const res = await this.post<OrderResponse>('/v1/orders', body, {
      headers: {
        'X-Idempotency-Key': idempotencyKey ?? uuidv4(),
      },
    });
    return res.data;
  }

  async getOrder(orderId: string) {
    const res = await this.get<OrderResponse>(`/v1/orders/${orderId}`);
    return res.data;
  }

  async cancelOrder(orderId: string, idempotencyKey?: string) {
    const res = await this.post<OrderResponse>(`/v1/orders/${orderId}/cancel`, {}, {
      headers: {
        'X-Idempotency-Key': idempotencyKey ?? uuidv4(),
      },
    });
    return res.data;
  }

  async searchOrders(params: {
    date_from?: string;
    date_to?: string;
    external_reference?: string;
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    const res = await this.get<OrderResponse[]>('/v1/orders', { params });
    return res.data;
  }
}
