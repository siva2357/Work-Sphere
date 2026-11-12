import { Pipe, PipeTransform } from '@angular/core';
import { REGEX_PATTERNS } from '../constants/regex.constants';

@Pipe({
  name: 'phoneFormat',
  standalone: true,
})
export class PhoneFormatPipe implements PipeTransform {
  transform(phone: string | null | undefined, defaultCountryCode: string = '+91'): string {
    if (!phone || !phone.trim()) return '--';

    const trimmed = phone.trim();

    // Check against Indian Phone Regex Pattern directly first
    const indiaMatch = trimmed.match(REGEX_PATTERNS.PHONE_INDIA);
    if (indiaMatch) {
      return `${defaultCountryCode} ${indiaMatch[1]} ${indiaMatch[2]}`;
    }

    const digits = trimmed.replace(REGEX_PATTERNS.NON_DIGIT, '');
    if (REGEX_PATTERNS.PHONE_10_DIGIT_GROUPS.test(digits)) {
      return digits.replace(REGEX_PATTERNS.PHONE_10_DIGIT_GROUPS, `${defaultCountryCode} $1 $2`);
    }
    if (REGEX_PATTERNS.PHONE_91_12_DIGIT_GROUPS.test(digits)) {
      return digits.replace(REGEX_PATTERNS.PHONE_91_12_DIGIT_GROUPS, '+$1 $2 $3');
    }

    return trimmed;
  }
}
