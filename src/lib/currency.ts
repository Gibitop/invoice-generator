// Single source of truth for currencies
export const currencyKeys = ['USD', 'EUR', 'RUB'] as const

export type CurrencyKey = (typeof currencyKeys)[number]

export const makeCurrencyFormatter = (currency: string) => new Intl.NumberFormat("en", {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    currencyDisplay: 'code',
});

// Build currency display names from the currency keys
export const currencies: Record<CurrencyKey, string> = {
    USD: "USD - US Dollar",
    EUR: "EUR - Euro",
    RUB: "RUB - Russian Ruble",
} as const
