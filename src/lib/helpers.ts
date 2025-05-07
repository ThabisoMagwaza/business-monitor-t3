export function formatCurrencyAmount(value: number) {
  return (
    'R' +
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value)
  );
}
