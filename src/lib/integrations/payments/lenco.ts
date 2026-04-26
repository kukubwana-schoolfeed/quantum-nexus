/**
 * LENCO — Platform billing and payment tracking integration
 *
 * PURPOSE: Platform billing. Monthly invoice generation,
 * payment tracking, refund processing.
 *
 * AUTH METHOD: Lenco API credentials (LENCO_API_KEY env var)
 *
 * WORKER: Worker 4 (daily payment check job)
 * PHASE: 3 (real connection)
 * STATUS: placeholder
 */

import { mockId, mockTimestamp, mockInt, mockFloat, mockDate } from '../mock-data';

// --- Types ---

export interface LencoGetTransactionsParams {
  accountId: string;
  startDate?: string;
  endDate?: string;
  type?: 'credit' | 'debit';
  tenantId: string;
}

export interface LencoGenerateInvoiceParams {
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  items: Array<{
    description: string;
    amount: number;
    currency: string;
  }>;
}

export interface LencoRefundParams {
  transactionId: string;
  amount: number;
  reason: string;
  tenantId: string;
}

export interface LencoGetTransactionsResponse {
  transactions: Array<{
    id: string;
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed';
    type: 'credit' | 'debit';
    reference: string;
    createdAt: string;
  }>;
}

export interface LencoGenerateInvoiceResponse {
  invoiceId: string;
  invoiceUrl: string;
  status: 'generated' | 'sent' | 'failed';
  totalAmount: number;
}

export interface LencoRefundResponse {
  refundId: string;
  status: 'processed' | 'pending' | 'failed';
  amount: number;
}

// --- Main exports ---

export async function getTransactions(params: LencoGetTransactionsParams): Promise<LencoGetTransactionsResponse> {
  // PLACEHOLDER: LENCO — Platform billing and payment tracking
  // REAL INTEGRATION: /src/lib/integrations/payments/lenco.ts
  // PHASE: 3
  const transactions = [];
  const count = mockInt(3, 8);
  for (let i = 0; i < count; i++) {
    const type = params.type || mockPick(['credit', 'debit']);
    transactions.push({
      id: mockId('txn', 12),
      amount: mockFloat(50, 5000),
      currency: 'ZMW',
      status: i === 0 ? 'pending' as const : 'completed' as const,
      type: type as 'credit' | 'debit',
      reference: `LENCO-${mockId('', 8).toUpperCase()}`,
      createdAt: mockTimestamp(mockInt(10, 4320)),
    });
  }
  return { transactions };
}

// local helper
function mockPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function generateInvoice(params: LencoGenerateInvoiceParams): Promise<LencoGenerateInvoiceResponse> {
  // PLACEHOLDER: LENCO — Invoice generation
  // REAL INTEGRATION: /src/lib/integrations/payments/lenco.ts
  // PHASE: 3
  const totalAmount = params.items.reduce((sum, item) => sum + item.amount, 0);
  const invoiceId = mockId('inv', 10);
  return {
    invoiceId,
    invoiceUrl: `https://billing.lenco.co/invoices/${invoiceId}`,
    status: 'generated',
    totalAmount,
  };
}

export async function processRefund(params: LencoRefundParams): Promise<LencoRefundResponse> {
  // PLACEHOLDER: LENCO — Refund processing
  // REAL INTEGRATION: /src/lib/integrations/payments/lenco.ts
  // PHASE: 3
  return {
    refundId: mockId('ref', 10),
    status: 'processed',
    amount: params.amount,
  };
}
