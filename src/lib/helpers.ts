export function formatCurrencyAmount(value: number) {
  return (
    'R' +
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value)
  );
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-ZA').format(date).replaceAll('/', '-');
}
