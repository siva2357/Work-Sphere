import { Pipe, PipeTransform } from '@angular/core';

export type DateFormatStyle = 'short' | 'medium' | 'long' | 'iso' | 'time' | 'relative' | 'monthYear';

@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(
    value: Date | string | number | null | undefined,
    style: DateFormatStyle = 'medium'
  ): string {
    if (!value) return '--';

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return String(value);
    }

    switch (style) {
      case 'iso':
        return date.toISOString().split('T')[0];

      case 'short':
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

      case 'medium':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });

      case 'long':
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

      case 'monthYear':
        return date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });

      case 'time':
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

      case 'relative': {
        const diffMs = Date.now() - date.getTime();
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHr = Math.round(diffMin / 60);
        const diffDays = Math.round(diffHr / 24);

        if (Math.abs(diffSec) < 60) return 'Just now';
        if (Math.abs(diffMin) < 60) return diffMin > 0 ? `${diffMin}m ago` : `In ${Math.abs(diffMin)}m`;
        if (Math.abs(diffHr) < 24) return diffHr > 0 ? `${diffHr}h ago` : `In ${Math.abs(diffHr)}h`;
        if (Math.abs(diffDays) < 30) return diffDays > 0 ? `${diffDays}d ago` : `In ${Math.abs(diffDays)}d`;

        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }

      default:
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
    }
  }
}

