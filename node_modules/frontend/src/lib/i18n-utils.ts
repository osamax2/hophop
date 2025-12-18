import type { Language } from '../App';

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
    return new Intl.NumberFormat(locales[language], defaultOptions).format(value);
  } catch (e) {
    return value.toString();
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

  try {
    return new Intl.NumberFormat(locales[language], {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (e) {
    // Fallback if currency not supported
    return `${formatNumber(value, language)} ${currency}`;
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
    parts.push(`${hours} ${t.hour}`);
  }
  if (mins > 0) {
    parts.push(`${mins} ${t.minute}`);
  }

  return parts.join(' ') || '0 ' + t.minute;
}

