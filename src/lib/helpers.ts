export function formatCurrencyAmount(value: number) {
  return new Intl.NumberFormat('en-ZA', {
    currency: 'ZAR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}
