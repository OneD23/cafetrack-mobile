export const toCents = (amount: number): number => Math.round(amount * 100);

export const fromCents = (amountInCents: number): number => amountInCents / 100;

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
