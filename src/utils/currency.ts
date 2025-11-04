/**
 * Format a number as UGX (Ugandan Shillings) currency
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 0 for UGX)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string, decimals: number = 0): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'UGX 0';
  
  return `UGX ${numAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

/**
 * Format a number as UGX currency with 2 decimal places (for prices)
 */
export function formatPrice(amount: number | string): string {
  return formatCurrency(amount, 0); // UGX typically doesn't use decimal places
}

