import { Pipe, PipeTransform } from '@angular/core';
import { REGEX_PATTERNS, RegexPatternKey, RegexValidator } from '../constants/regex.constants';

export { REGEX_PATTERNS, RegexValidator };
export type { RegexPatternKey };

/**
 * Validates or tests any input string against a centralized regex pattern in `REGEX_PATTERNS`
 * or a custom RegExp / pattern string.
 *
 * Example usage in templates:
 *   `newEmployee.email | regexPattern:'EMAIL'`
 *   `newEmployee.phone | regexPattern:'PHONE_INDIA'`
 */
@Pipe({
  name: 'regexPattern',
  standalone: true,
})
export class RegexPatternPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    pattern: RegexPatternKey | RegExp | string
  ): boolean {
    if (!value) return false;

    const trimmed = String(value).trim();
    if (!trimmed) return false;

    if (pattern instanceof RegExp) {
      return pattern.test(trimmed);
    }

    if (typeof pattern === 'string' && pattern in REGEX_PATTERNS) {
      const regex = REGEX_PATTERNS[pattern as RegexPatternKey];
      return new RegExp(regex.source, regex.flags.replace('g', '')).test(trimmed);
    }

    try {
      return new RegExp(pattern).test(trimmed);
    } catch {
      return false;
    }
  }
}

