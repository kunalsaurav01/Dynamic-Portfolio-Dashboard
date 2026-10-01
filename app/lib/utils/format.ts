export const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
export const numberFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
export const percentFormatter = new Intl.NumberFormat('en-IN', { style: 'percent', maximumFractionDigits: 2 });

export function formatINR(value: number | null): string { return value === null ? 'N/A' : inrFormatter.format(value); }
export function formatNumber(value: number | null): string { return value === null ? 'N/A' : numberFormatter.format(value); }
export function formatPercent(value: number | null): string { return value === null ? 'N/A' : percentFormatter.format(value); }
export function formatGain(value: number | null): string {
  if (value === null) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${inrFormatter.format(value)}`;
}
export function formatUpdated(timestamp: string | null): string {
  if (!timestamp) return 'Not updated yet';
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(timestamp));
}
