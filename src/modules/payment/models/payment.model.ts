export type OAuthTokenResponse = {
  access_token: string;
  expires_in: number;
  live_mode: boolean;
  token_type: string;
};

type OrderPayer = {
  email: string;
  first_name?: string;
  identification?: { number: string; type: string };
  last_name?: string;
  phone?: { area_code: string; number: string };
};

type OrderItem = {
  description?: string;
  quantity: number;
  title: string;
  total_amount?: string;
  unit_measure?: string;
  unit_price: string;
};

export type OrderCreateBody = {
  capture_mode?: string;
  config?: {
    online?: {
      auto_return?: string;
      failure_url?: string;
      pending_url?: string;
      success_url?: string;
    };
    payment_method?: {
      max_installments?: number;
      not_allowed_ids?: string[];
      not_allowed_types?: string[];
    };
  };
  description?: string;
  expiration_time?: string;
  external_reference: string;
  items: OrderItem[];
  payer: OrderPayer;
  processing_mode: 'manual';
  total_amount: string;
  type: 'online';
};

export type OrderResponse = {
  capture_mode: string;
  checkout_url: string;
  client_token: string;
  country_code: string;
  created_date: string;
  currency: string;
  description?: string;
  expiration_time: string;
  external_reference: string;
  id: string;
  last_updated_date: string;
  processing_mode: string;
  status: string;
  status_detail: string;
  total_amount: string;
  total_paid_amount: string;
  type: string;
  user_id: string;
};
