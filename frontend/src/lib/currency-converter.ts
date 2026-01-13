/**
 * Currency Converter Utility
 * Converts all prices to NEW_SYP for consistent filtering
 * 
 * Conversion rates:
 * - OLD_SYP (SYP): 100 old = 1 NEW_SYP
 * - USD, EUR, TRY: Uses fixed rates (Fixer.io API disabled due to HTTPS/Mixed Content issues)
 */

// Fixed exchange rates (Fixer.io free plan only supports HTTP, which causes Mixed Content issues on HTTPS sites)
// These rates are approximate and suitable for a local travel booking app
const FIXED_RATES: Record<string, number> = {
  USD: 15000,      // 1 USD = 15,000 NEW_SYP
  EUR: 16000,      // 1 EUR = 16,000 NEW_SYP
  TRY: 500,        // 1 TRY = 500 NEW_SYP
  SYP: 0.01,       // 100 OLD_SYP = 1 NEW_SYP
  NEW_SYP: 1,      // Base currency
};

/**
 * Get exchange rates (using fixed rates)
 * Note: Fixer.io API disabled because free plan only supports HTTP,
 * which causes Mixed Content errors on HTTPS sites like hophopsy.com
 */
function getExchangeRates(): Record<string, number> {
  return FIXED_RATES;
}

/**
 * Convert a price from any currency to NEW_SYP
 * @param price The price value
 * @param currency The currency code (SYP, NEW_SYP, USD, EUR, TRY)
 * @param rates Optional exchange rates (will use fixed rates if not provided)
 * @returns Price in NEW_SYP
 */
export async function convertToNewSyp(
  price: number,
  currency: string = 'NEW_SYP',
  rates?: Record<string, number>
): Promise<number> {
  const exchangeRates = rates || getExchangeRates();
  
  const normalizedCurrency = currency.toUpperCase();
  
  // Direct conversion for known currencies
  switch (normalizedCurrency) {
    case 'NEW_SYP':
    case 'NEWSYP':
      return price;
    
    case 'SYP':
    case 'OLD_SYP':
    case 'OLDSYP':
      // 100 old SYP = 1 new SYP
      return price / 100;
    
    case 'USD':
      return price * (exchangeRates.USD || FIXED_RATES.USD);
    
    case 'EUR':
      return price * (exchangeRates.EUR || FIXED_RATES.EUR);
    
    case 'TRY':
      return price * (exchangeRates.TRY || FIXED_RATES.TRY);
    
    default:
      console.warn(`Unknown currency: ${currency}, assuming NEW_SYP`);
      return price;
  }
}

/**
 * Synchronous conversion using fixed rates
 * Use this when async is not possible (e.g., in filter functions)
 */
export function convertToNewSypSync(
  price: number,
  currency: string = 'NEW_SYP'
): number {
  const rates = FIXED_RATES;
  
  const normalizedCurrency = currency.toUpperCase();
  
  switch (normalizedCurrency) {
    case 'NEW_SYP':
    case 'NEWSYP':
      return price;
    
    case 'SYP':
    case 'OLD_SYP':
    case 'OLDSYP':
      return price / 100;
    
    case 'USD':
      return price * rates.USD;
    
    case 'EUR':
      return price * rates.EUR;
    
    case 'TRY':
      return price * rates.TRY;
    
    default:
      return price;
  }
}

/**
 * Pre-load exchange rates (no-op now, kept for API compatibility)
 */
export async function preloadExchangeRates(): Promise<void> {
  // No-op - using fixed rates now
}

/**
 * Get the current rates
 */
export function getCachedRates(): Record<string, number> {
  return FIXED_RATES;
}

/**
 * Clear the rate cache (no-op, kept for API compatibility)
 */
export function clearRateCache(): void {
  // No-op - using fixed rates now
}
