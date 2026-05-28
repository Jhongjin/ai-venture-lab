export const STRIPE_CHECKOUT_ENV_KEYS = [
  "NEXT_PUBLIC_APP_URL",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRO_MONTHLY_PRICE_ID",
  "STRIPE_TEAM_MONTHLY_PRICE_ID",
] as const;

export type StripeCheckoutEnvKey = (typeof STRIPE_CHECKOUT_ENV_KEYS)[number];

export type StripeCheckoutReadiness = {
  configuredCount: number;
  isEnvReady: boolean;
  missingKeys: StripeCheckoutEnvKey[];
  totalCount: number;
};

function hasEnvValue(value: string | undefined) {
  return Boolean(value && value.trim());
}

export function readStripeCheckoutReadiness(env: NodeJS.ProcessEnv = process.env): StripeCheckoutReadiness {
  const missingKeys = STRIPE_CHECKOUT_ENV_KEYS.filter((key) => !hasEnvValue(env[key]));

  return {
    configuredCount: STRIPE_CHECKOUT_ENV_KEYS.length - missingKeys.length,
    isEnvReady: missingKeys.length === 0,
    missingKeys,
    totalCount: STRIPE_CHECKOUT_ENV_KEYS.length,
  };
}
