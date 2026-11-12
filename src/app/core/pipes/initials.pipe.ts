import { Pipe, PipeTransform } from '@angular/core';
import { REGEX_PATTERNS } from '../constants/regex.constants';

@Pipe({
  name: 'initials',
  standalone: true,
})
export class InitialsPipe implements PipeTransform {
  transform(fullName: string | null | undefined, maxLetters: number = 2): string {
    if (!fullName || !fullName.trim()) return 'WS';

    return fullName
      .trim()
      .split(REGEX_PATTERNS.WHITESPACE_SPLIT)
      .slice(0, maxLetters)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
