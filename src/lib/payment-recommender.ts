import {
  phonePayNote,
  recommend,
  type CardBrand,
  type PhoneOS,
} from '../data/payment-matrix';

export interface PaymentPlanInput {
  card: CardBrand;
  os: PhoneOS;
}

export interface PaymentPlan {
  headline: string;
  steps: { app: string; action: string; note: string }[];
  warnings: string[];
}

export function buildPaymentPlan(input: PaymentPlanInput): PaymentPlan {
  const recommendation = recommend(input.card);
  return {
    headline: recommendation.headline,
    steps: recommendation.steps,
    warnings: [...recommendation.warnings, phonePayNote(input.os)],
  };
}
