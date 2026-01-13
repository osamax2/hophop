/**
 * Currency Converter Utility
 * Converts all prices to NEW_SYP for consistent filtering
 * 
 * Conversion rates:
 * - OLD_SYP (SYP): 100 old = 1 NEW_SYP
 * - USD, EUR, TRY: Uses Fixer.io API with SYP as target
 */

const FIXER_API_KEY = '9fa62b026d0b7b944b9255bc65e47062';
const FIXER_BASE_URL = 'http://data.fixer.io/api';

// Cache for exchange rates (valid for 1 hour)
interface RateCache {
  rates: Record<string, number>;
  timestamp: number;
  baseCurrency: string;
}

let rateCache: RateCache | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Approximate rate: 1 USD = 15,000 NEW_SYP (as of 2026)
// This is a fallback if API fails
const FALLBACK_RATES: Record<string, number> = {
  USD: 15000,      // 1 USD = 15,000 NEW_SYP
  EUR: 16000,      // 1 EUR = 16,000 NEW_SYP
  TRY: 500,        // 1 TRY = 500 NEW_SYP
  SYP: 0.01,       // 100 OLD_SYP = 1 NEW_SYP
  NEW_SYP: 1,      // Base currency
};

/**
 * Fetch exchange rates from Fixer.io API
 * Note: Free plan only supports EUR as base currency
 */
async function fetchExchangeRates(): Promise<Record<string, number>> {
  // Check cache first
  if (rateCache && Date.now() - rateCache.timestamp < CACHE_DURATION) {
    console.log('Using cached exchange rates');
    return rateCache.rates;
  }

  try {
    // Fixer.io free plan only allows EUR as base
    const response = await fetch(
      `${FIXER_BASE_URL}/latest?access_key=${FIXER_API_KEY}&symbols=USD,TRY,SYP`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('Fixer API error:', data.error);
      throw new Error(data.error?.info || 'API error');
    }

    // data.rates contains rates from EUR to each currency
    // Example: { USD: 1.08, TRY: 35.5, SYP: 13500 }
    const eurRates = data.rates;
    
    // Convert to NEW_SYP as base
    // First, calculate how many NEW_SYP per EUR
    // If SYP in API is old SYP, then NEW_SYP = SYP / 100
    const oldSypPerEur = eurRates.SYP || 1350000; // fallback
    const newSypPerEur = oldSypPerEur / 100;
    
    // Now calculate all rates relative to NEW_SYP
    const newSypRates: Record<string, number> = {
      NEW_SYP: 1,
      SYP: 0.01, // 100 old = 1 new
      EUR: newSypPerEur,
      USD: newSypPerEur / (eurRates.USD || 1.08),
      TRY: newSypPerEur / (eurRates.TRY || 35.5),
    };

    // Cache the rates
    rateCache = {
      rates: newSypRates,
      timestamp: Date.now(),
      baseCurrency: 'NEW_SYP',
    };

    console.log('Fetched new exchange rates:', newSypRates);
    return newSypRates;
  } catch (error) {
    console.error('Failed to fetch exchange rates, using fallback:', error);
    return FALLBACK_RATES;
  }
}

/**
 * Convert a price from any currency to NEW_SYP
 * @param price The price value
 * @param currency The currency code (SYP, NEW_SYP, USD, EUR, TRY)
 * @param rates Optional exchange rates (will fetch if not provided)
 * @returns Price in NEW_SYP
 */
export async function convertToNewSyp(
  price: number,
  currency: string = 'NEW_SYP',
  rates?: Record<string, number>
): Promise<number> {
  const exchangeRates = rates || await fetchExchangeRates();
  
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
      return price * (exchangeRates.USD || FALLBACK_RATES.USD);
    
    case 'EUR':
      return price * (exchangeRates.EUR || FALLBACK_RATES.EUR);
    
    case 'TRY':
      return price * (exchangeRates.TRY || FALLBACK_RATES.TRY);
    
    default:
      console.warn(`Unknown currency: ${currency}, assuming NEW_SYP`);
      return price;
  }
}

/**
 * Synchronous conversion using cached or fallback rates
 * Use this when async is not possible (e.g., in filter functions)
 */
export function convertToNewSypSync(
  price: number,
  currency: string = 'NEW_SYP'
): number {
  const rates = rateCache?.rates || FALLBACK_RATES;
  
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
      return price * (rates.USD || FALLBACK_RATES.USD);
    
    case 'EUR':
      return price * (rates.EUR || FALLBACK_RATES.EUR);
    
    case 'TRY':
      return price * (rates.TRY || FALLBACK_RATES.TRY);
    
    default:
      return price;
  }
}

/**
 * Pre-fetch exchange rates to populate cache
 * Call this on app startup or before filtering
 */
export async function preloadExchangeRates(): Promise<void> {
  await fetchExchangeRates();
}

/**
 * Get the current cached rates (or fallback)
 */
export function getCachedRates(): Record<string, number> {
  return rateCache?.rates || FALLBACK_RATES;
}

/**
 * Clear the rate cache (for testing or manual refresh)
 */
export function clearRateCache(): void {
  rateCache = null;
}
