import { Pipe, PipeTransform } from '@angular/core';
import { REGEX_PATTERNS } from '../constants/regex.constants';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    currency: CurrencyCode = 'INR',
    compact: boolean = false,
    fractionDigits: number = 0
  ): string {
    if (value === null || value === undefined || value === '') return '--';

    if (typeof value === 'string') {
      const cleaned = value.replace(REGEX_PATTERNS.NON_NUMERIC_CURRENCY, '');
      const parsed = Number(cleaned);
      if (isNaN(parsed)) {
        return value;
      }
      value = parsed;
    }

    if (isNaN(value)) return '--';

    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    const symbolMap: Record<CurrencyCode, string> = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    const symbol = symbolMap[currency] || '₹';

    if (compact) {
      if (currency === 'INR') {
        const abs = Math.abs(value);
        if (abs >= 1_00_00_000) {
          return `${symbol}${(value / 1_00_00_000).toFixed(2)} Cr`;
        }
        if (abs >= 1_00_000) {
          return `${symbol}${(value / 1_00_000).toFixed(2)} L`;
        }
      } else {
        const abs = Math.abs(value);
        if (abs >= 1_000_000) {
          return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
        }
        if (abs >= 1_000) {
          return `${symbol}${(value / 1_000).toFixed(1)}K`;
        }
      }
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  }
}
