/**
 * BUSINESS_PAYMENT_PLUGIN — Customer-facing payment routing integration
 *
 * PURPOSE: Each business connects their own payment provider
 * for customer-facing payments. System routes payment queries
 * to their configured provider.
 *
 * AUTH METHOD: Business provides their own credentials during onboarding.
 * Stored encrypted per tenant.
 *
 * SUPPORTED PROVIDERS: Lenco, MTN MoMo, Airtel Money, Stripe,
 * Flutterwave, PayChangu, Custom (business pastes API credentials)
 *
 * WORKER: Inline (Claude references payment details in conversations
 * — no async job needed)
 * PHASE: 3 (real connection)
 * STATUS: placeholder
 */

import { mockId, mockTimestamp, mockInt, mockFloat } from '../mock-data';

// --- Types ---

export type PaymentProvider = 'lenco' | 'momo' | 'airtel' | 'stripe' | 'flutterwave' | 'paychangu' | 'custom';

export interface PaymentRouterGetDetailsParams {
  tenantId: string;
  provider?: PaymentProvider;
}

export interface PaymentRouterProcessPaymentParams {
  tenantId: string;
  customerIdentifier: string;
  amount: number;
  currency: string;
  description: string;
  provider?: PaymentProvider;
}

export interface PaymentRouterStatusParams {
  tenantId: string;
  transactionId: string;
  provider: PaymentProvider;
}

export interface PaymentRouterDetailsResponse {
  provider: PaymentProvider;
  details: {
    displayName: string;
    supportedCurrencies: string[];
    paymentMethods: string[];
  };
}

export interface PaymentRouterProcessResponse {
  transactionId: string;
  status: 'initiated' | 'completed' | 'pending' | 'failed';
  providerTransactionId: string;
}

export interface PaymentRouterStatusResponse {
  transactionId: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  completedAt?: string;
}

const PROVIDER_DETAILS: Record<PaymentProvider, PaymentRouterDetailsResponse> = {
  lenco: {
    provider: 'lenco',
    details: { displayName: 'Lenco', supportedCurrencies: ['ZMW', 'USD'], paymentMethods: ['bank_transfer', 'card'] },
  },
  momo: {
    provider: 'momo',
    details: { displayName: 'MTN Mobile Money', supportedCurrencies: ['ZMW'], paymentMethods: ['mobile_money'] },
  },
  airtel: {
    provider: 'airtel',
    details: { displayName: 'Airtel Money', supportedCurrencies: ['ZMW'], paymentMethods: ['mobile_money'] },
  },
  stripe: {
    provider: 'stripe',
    details: { displayName: 'Stripe', supportedCurrencies: ['USD', 'EUR', 'GBP', 'ZMW'], paymentMethods: ['card', 'bank_transfer', 'apple_pay', 'google_pay'] },
  },
  flutterwave: {
    provider: 'flutterwave',
    details: { displayName: 'Flutterwave', supportedCurrencies: ['ZMW', 'USD', 'NGN', 'KES', 'GHS'], paymentMethods: ['card', 'mobile_money', 'bank_transfer'] },
  },
  paychangu: {
    provider: 'paychangu',
    details: { displayName: 'PayChangu', supportedCurrencies: ['ZMW', 'USD'], paymentMethods: ['card', 'mobile_money'] },
  },
  custom: {
    provider: 'custom',
    details: { displayName: 'Custom Provider', supportedCurrencies: ['ZMW', 'USD'], paymentMethods: ['custom'] },
  },
};

// --- Main exports ---

export async function getPaymentDetails(params: PaymentRouterGetDetailsParams): Promise<PaymentRouterDetailsResponse> {
  // PLACEHOLDER: BUSINESS_PAYMENT_PLUGIN — Customer-facing payment routing
  // REAL INTEGRATION: /src/lib/integrations/payments/payment-router.ts
  // PHASE: 3
  const provider = params.provider || 'momo';
  return PROVIDER_DETAILS[provider];
}

export async function processPayment(params: PaymentRouterProcessPaymentParams): Promise<PaymentRouterProcessResponse> {
  // PLACEHOLDER: BUSINESS_PAYMENT_PLUGIN — Payment processing
  // REAL INTEGRATION: /src/lib/integrations/payments/payment-router.ts
  // PHASE: 3
  return {
    transactionId: mockId('pay', 14),
    status: 'pending',
    providerTransactionId: `PTX-${mockId('', 10).toUpperCase()}`,
  };
}

export async function getPaymentStatus(params: PaymentRouterStatusParams): Promise<PaymentRouterStatusResponse> {
  // PLACEHOLDER: BUSINESS_PAYMENT_PLUGIN — Payment status check
  // REAL INTEGRATION: /src/lib/integrations/payments/payment-router.ts
  // PHASE: 3
  return {
    transactionId: params.transactionId,
    status: 'completed',
    amount: mockFloat(50, 2000),
    currency: 'ZMW',
    completedAt: mockTimestamp(mockInt(1, 60)),
  };
}
