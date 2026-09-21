/**
 * Counter & Cash Payment Settlement Service
 * HELLO DOCTORRR - Hospital OPD & Clinic Cash Settlement Protocol
 * 
 * Note: Third-party online payment gateways are intentionally not used.
 * All appointments, tokens, lab visits, and orders operate on an authorized
 * Pay-at-Counter / Cash-on-Arrival model at the clinic/hospital reception desk.
 */

import { PaymentDetails } from '../types';

export type CounterPaymentType = 'AT_COUNTER' | 'COD' | 'PAY_ON_VISIT' | 'PAY_AT_LAB';

export interface CounterPaymentConfig {
  type: CounterPaymentType;
  label: string;
  sublabel: string;
  instructions: string;
  statusLabel: string;
}

export const COUNTER_PAYMENT_CONFIGS: Record<CounterPaymentType, CounterPaymentConfig> = {
  AT_COUNTER: {
    type: 'AT_COUNTER',
    label: 'Pay Cash at Hospital / Counter',
    sublabel: 'Zero online charges. Pay directly at the hospital reception counter.',
    instructions: 'Please show your generated Token Number at the hospital reception counter and pay the consultation fee in cash upon arrival.',
    statusLabel: 'Pay Cash at Clinic',
  },
  PAY_ON_VISIT: {
    type: 'PAY_ON_VISIT',
    label: 'Pay Cash to Doctor on Home Visit',
    sublabel: 'Pay the visiting doctor directly in cash when they arrive.',
    instructions: 'Please pay the visit fee directly to the attending physician upon home arrival.',
    statusLabel: 'Pay Cash on Visit',
  },
  COD: {
    type: 'COD',
    label: 'Cash on Delivery (COD)',
    sublabel: 'Pay the delivery executive in cash upon receiving your medicines.',
    instructions: 'Hand over cash to the delivery partner once medicines and invoice are verified.',
    statusLabel: 'Cash on Delivery',
  },
  PAY_AT_LAB: {
    type: 'PAY_AT_LAB',
    label: 'Pay Cash at Diagnostic Lab / On Sample Collection',
    sublabel: 'Pay at the diagnostic collection center or to the phlebotomist.',
    instructions: 'Pay test fees in cash when sample is collected or at the lab reception desk.',
    statusLabel: 'Pay Cash at Lab',
  },
};

export const paymentGateway = {
  /**
   * Generates a formal counter cash payment record for the booking receipt
   */
  createCounterPaymentRecord(
    amount: number,
    counterType: CounterPaymentType = 'AT_COUNTER'
  ): PaymentDetails {
    const config = COUNTER_PAYMENT_CONFIGS[counterType] || COUNTER_PAYMENT_CONFIGS.AT_COUNTER;
    const timestamp = Date.now();
    const uniqueReceiptId = `CTR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      status: counterType,
      method: config.label,
      gateway: 'Hospital Counter',
      transactionId: uniqueReceiptId,
      amount,
      instructions: config.instructions,
      statusLabel: config.statusLabel,
    };
  },
};
