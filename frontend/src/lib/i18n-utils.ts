import type { Language } from '../App';

/**
 * Convert Western numerals to Arabic-Indic numerals
 */
function toArabicNumerals(str: string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/\d/g, (digit) => arabicNumerals[parseInt(digit)]);
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date | string, language: Language): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const locales: Record<Language, string> = {
    en: 'en-US',
    de: 'de-DE',
    ar: 'ar-SA',
  };

  try {
    return new Intl.DateTimeFormat(locales[language], options).format(dateObj);
  } catch (e) {
    // Fallback to ISO string if locale not supported
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format date and time according to locale
 */
export function formatDateTime(date: Date | string, language: Language): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  const locales: Record<Language, string> = {
    en: 'en-US',
    de: 'de-DE',
    ar: 'ar-SA',
  };

  try {
    return new Intl.DateTimeFormat(locales[language], options).format(dateObj);
  } catch (e) {
    return dateObj.toLocaleString();
  }
}

/**
 * Format time only according to locale
 */
export function formatTime(date: Date | string, language: Language): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: language === 'ar' ? false : false, // 24-hour format
  };

  const locales: Record<Language, string> = {
    en: 'en-US',
    de: 'de-DE',
    ar: 'ar-SA',
  };

  try {
    return new Intl.DateTimeFormat(locales[language], options).format(dateObj);
  } catch (e) {
    return dateObj.toLocaleTimeString();
  }
}

/**
 * Format number according to locale
 */
export function formatNumber(value: number, language: Language, options?: Intl.NumberFormatOptions): string {
  const locales: Record<Language, string> = {
    en: 'en-US',
    de: 'de-DE',
    ar: 'ar-SA',
  };

  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  try {
    const formatted = new Intl.NumberFormat(locales[language], defaultOptions).format(value);
    return language === 'ar' ? toArabicNumerals(formatted) : formatted;
  } catch (e) {
    const fallback = value.toString();
    return language === 'ar' ? toArabicNumerals(fallback) : fallback;
  }
}

/**
 * Format currency according to locale
 */
export function formatCurrency(value: number, language: Language, currency: string = 'SYP'): string {
  const locales: Record<Language, string> = {
    en: 'en-US',
    de: 'de-DE',
    ar: 'ar-SA',
  };

  const currencyTranslations: Record<string, Record<Language, string>> = {
    'SYP': {
      en: 'SYP',
      de: 'SYP',
      ar: 'ل.س',
    },
    'NEW_SYP': {
      en: 'New SYP',
      de: 'Neue SYP',
      ar: 'ل.س.ج',
    },
    'TRY': {
      en: 'TRY',
      de: 'TRY',
      ar: 'ليرة تركية',
    },
    'USD': {
      en: 'USD',
      de: 'USD',
      ar: 'دولار',
    },
    'EUR': {
      en: 'EUR',
      de: 'EUR',
      ar: 'يورو',
    },
  };

  try {
    if (language === 'ar') {
      // For Arabic, use custom format with Arabic numerals and translated currency
      const formattedNumber = formatNumber(value, language);
      const translatedCurrency = currencyTranslations[currency]?.[language] || currency;
      return `${formattedNumber} ${translatedCurrency}`;
    } else {
      return new Intl.NumberFormat(locales[language], {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
  } catch (e) {
    // Fallback if currency not supported
    const translatedCurrency = currencyTranslations[currency]?.[language] || currency;
    return `${formatNumber(value, language)} ${translatedCurrency}`;
  }
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number, language: Language): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const translations = {
    en: {
      hour: hours === 1 ? 'hour' : 'hours',
      minute: mins === 1 ? 'minute' : 'minutes',
    },
    de: {
      hour: hours === 1 ? 'Stunde' : 'Stunden',
      minute: mins === 1 ? 'Minute' : 'Minuten',
    },
    ar: {
      hour: hours === 1 ? 'ساعة' : 'ساعات',
      minute: mins === 1 ? 'دقيقة' : 'دقائق',
    },
  };

  const t = translations[language];
  const parts: string[] = [];

  if (hours > 0) {
    const hourNum = language === 'ar' ? toArabicNumerals(hours.toString()) : hours.toString();
    parts.push(`${hourNum} ${t.hour}`);
  }
  if (mins > 0) {
    const minNum = language === 'ar' ? toArabicNumerals(mins.toString()) : mins.toString();
    parts.push(`${minNum} ${t.minute}`);
  }

  const zero = language === 'ar' ? '٠' : '0';
  return parts.join(' ') || `${zero} ${t.minute}`;
}

