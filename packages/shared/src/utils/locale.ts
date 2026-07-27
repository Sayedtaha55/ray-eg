type LocaleConfig = {
  code: string;
  dir: 'rtl' | 'ltr';
  currency: string;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  decimalSeparator: string;
  thousandsSeparator: string;
};

const LOCALE_CONFIGS: Record<string, LocaleConfig> = {
  ar: {
    code: 'ar',
    dir: 'rtl',
    currency: 'EGP',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'hh:mm A',
    timezone: 'Africa/Cairo',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  en: {
    code: 'en',
    dir: 'ltr',
    currency: 'EGP',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm A',
    timezone: 'Africa/Cairo',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
};

const DEFAULT_LOCALE = 'ar';

function getLocaleConfig(lang?: string): LocaleConfig {
  const code = lang || (typeof localStorage !== 'undefined' ? localStorage.getItem('ray_lang') : null) || DEFAULT_LOCALE;
  return LOCALE_CONFIGS[code] || LOCALE_CONFIGS[DEFAULT_LOCALE];
}

function formatCurrency(amount: number, lang?: string): string {
  const config = getLocaleConfig(lang);
  try {
    return new Intl.NumberFormat(config.code === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${config.currency}`;
  }
}

function formatDate(date: Date | string, lang?: string): string {
  const config = getLocaleConfig(lang);
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat(config.code === 'ar' ? 'ar-EG' : 'en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: config.timezone,
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

function formatTime(date: Date | string, lang?: string): string {
  const config = getLocaleConfig(lang);
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat(config.code === 'ar' ? 'ar-EG' : 'en-EG', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: config.timezone,
    }).format(d);
  } catch {
    return d.toLocaleTimeString();
  }
}

function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(d);
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return 'just now';
}

function formatNumber(num: number, lang?: string): string {
  const config = getLocaleConfig(lang);
  try {
    return new Intl.NumberFormat(config.code === 'ar' ? 'ar-EG' : 'en-EG').format(num);
  } catch {
    return String(num);
  }
}

export {
  getLocaleConfig,
  formatCurrency,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatNumber,
  LOCALE_CONFIGS,
  DEFAULT_LOCALE,
};
export type { LocaleConfig };
