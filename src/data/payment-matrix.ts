/**
 * Payment recommendation matrix for foreign travelers in China.
 *
 * This is general guidance, not financial advice. Acceptance varies by
 * merchant and provider terms change. Review date: 2026-10-16.
 */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'none';
export type PhoneOS = 'ios' | 'android';

export interface PaymentStep {
  app: 'Alipay' | 'WeChat Pay' | 'TenPayGo' | 'Cash';
  action: string;
  note: string;
}

export interface PaymentRecommendation {
  headline: string;
  steps: PaymentStep[];
  warnings: string[];
}

export interface PaymentMatrix {
  lastReviewed: string;
  sourceUrl: string;
  recommendations: Record<CardBrand, PaymentRecommendation>;
}

const baseSteps: Record<CardBrand, PaymentStep[]> = {
  visa: [
    {
      app: 'Alipay',
      action: 'Download Alipay, sign up with your phone number, and add your Visa card.',
      note: 'Works for most QR payments. Small transaction fees may apply after a threshold.',
    },
    {
      app: 'WeChat Pay',
      action: 'Add the same Visa card to WeChat Pay as a backup.',
      note: 'Some merchants only accept WeChat Pay.',
    },
    {
      app: 'TenPayGo',
      action: 'Open TenPayGo, register with an email address (no Chinese phone number needed), then link your Visa card.',
      note: 'Tencent app for visitors, launched September 2026. Pays over the WeChat Pay network; also accepts overseas wallets and Apple Pay.',
    },
    {
      app: 'Cash',
      action: 'Carry a small amount of RMB (¥200–500) as a fallback.',
      note: 'Cards are often rejected at small vendors; cash is accepted but change can be an issue.',
    },
  ],
  mastercard: [
    {
      app: 'Alipay',
      action: 'Download Alipay and add your Mastercard.',
      note: 'Mastercard works on Alipay for most merchants.',
    },
    {
      app: 'WeChat Pay',
      action: 'Add your Mastercard to WeChat Pay as a backup.',
      note: 'Some merchants only accept WeChat Pay.',
    },
    {
      app: 'TenPayGo',
      action: 'Open TenPayGo, register with an email address (no Chinese phone number needed), then link your Mastercard.',
      note: 'Tencent app for visitors, launched September 2026. Pays over the WeChat Pay network; also accepts overseas wallets and Apple Pay.',
    },
    {
      app: 'Cash',
      action: 'Carry a small amount of RMB (¥200–500) as a fallback.',
      note: 'Useful for tiny vendors and rural areas.',
    },
  ],
  amex: [
    {
      app: 'Alipay',
      action: 'Download Alipay, sign up with your phone number, and add your Amex card.',
      note: 'Amex is a fully supported network; works for most QR payments.',
    },
    {
      app: 'WeChat Pay',
      action: 'Add the same Amex card to WeChat Pay as a backup.',
      note: 'Some merchants only accept WeChat Pay.',
    },
    {
      app: 'TenPayGo',
      action: 'Open TenPayGo, register with an email address (no Chinese phone number needed), then link your Amex card.',
      note: 'Tencent app for visitors, launched September 2026. Pays over the WeChat Pay network; also accepts overseas wallets and Apple Pay.',
    },
    {
      app: 'Cash',
      action: 'Carry a small amount of RMB (¥200–500) as a fallback.',
      note: 'Cards are often rejected at small vendors; cash is accepted but change can be an issue.',
    },
  ],
  discover: [
    {
      app: 'Alipay',
      action: 'Download Alipay, sign up with your phone number, and add your Discover card.',
      note: 'Discover is a supported network; works for most QR payments.',
    },
    {
      app: 'WeChat Pay',
      action: 'Add the same Discover card to WeChat Pay as a backup.',
      note: 'Some merchants only accept WeChat Pay.',
    },
    {
      app: 'TenPayGo',
      action: 'Open TenPayGo, register with an email address (no Chinese phone number needed), then link your Discover card.',
      note: 'Tencent app for visitors, launched September 2026. Pays over the WeChat Pay network; also accepts overseas wallets and Apple Pay.',
    },
    {
      app: 'Cash',
      action: 'Carry a small amount of RMB (¥200–500) as a fallback.',
      note: 'Cards are often rejected at small vendors; cash is accepted but change can be an issue.',
    },
  ],
  none: [
    {
      app: 'Cash',
      action: 'Bring RMB cash and exchange at a bank or airport counter.',
      note: 'Without a card you will rely on cash; budget accordingly.',
    },
    {
      app: 'Alipay',
      action: 'Ask a trusted friend to send you Alipay balance, or use a prepaid travel card if available.',
      note: 'No foreign card means no easy self-serve setup.',
    },
  ],
};

const iosNote =
 'Apple Pay itself is not widely accepted offline in China. Use the Alipay/WeChat Pay apps instead, your linked card does the paying.';
const androidNote =
 'Google Pay itself is not widely accepted offline in China. Use the Alipay/WeChat Pay apps instead, your linked card does the paying.';

export const paymentMatrix: PaymentMatrix = {
  lastReviewed: '2026-10-16',
  sourceUrl: 'https://www.tenpayglobal.com/',
  recommendations: {
    visa: {
      headline: 'You are well set up: link your Visa card to the big two apps.',
      steps: baseSteps.visa,
      warnings: [
        'Apple Pay / Google Pay tap-to-pay is not the norm; QR codes are.',
        'Keep your physical card as an emergency backup, but do not expect it to work everywhere.',
      ],
    },
    mastercard: {
      headline: 'You are well set up: link your Mastercard to the big two apps.',
      steps: baseSteps.mastercard,
      warnings: [
        'Apple Pay / Google Pay tap-to-pay is not the norm; QR codes are.',
        'Keep your physical card as an emergency backup, but do not expect it to work everywhere.',
      ],
    },
    amex: {
      headline: 'Amex is a fully supported network: link it to Alipay and WeChat Pay.',
      steps: baseSteps.amex,
      warnings: ['Apple Pay / Google Pay tap-to-pay is not the norm; QR codes are.', 'What decides success is the merchant QR type, not your network: personal codes reject every foreign card.'],
    },
    discover: {
      headline: 'Discover is a fully supported network: link it to Alipay and WeChat Pay.',
      steps: baseSteps.discover,
      warnings: ['Apple Pay / Google Pay tap-to-pay is not the norm; QR codes are.', 'What decides success is the merchant QR type, not your network: personal codes reject every foreign card.'],
    },
    none: {
      headline: 'Without a foreign card, plan around cash.',
      steps: baseSteps.none,
   warnings: ['Exchanging cash at airports is convenient but rates vary.', 'Small vendors may struggle with large notes, ask for small bills.'],
    },
  },
};

export function phonePayNote(os: PhoneOS): string {
  return os === 'ios' ? iosNote : androidNote;
}

export function recommend(card: CardBrand): PaymentRecommendation {
  return paymentMatrix.recommendations[card];
}
