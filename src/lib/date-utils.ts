import { format, isToday, isTomorrow, isYesterday, differenceInDays, isPast } from 'date-fns';

export function formatRelativeDate(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  
  const diff = differenceInDays(date, new Date());
  
  if (diff < 0) {
    const absDiff = Math.abs(diff);
    return `${absDiff} day${absDiff > 1 ? 's' : ''} overdue`;
  }
  
  if (diff <= 7) {
    return `In ${diff} days`;
  }
  
  return format(date, 'MMM d, yyyy');
}

export function getUrgencyLevel(date: Date): 'overdue' | 'today' | 'upcoming' {
  if (isToday(date)) return 'today';
  if (isPast(date)) return 'overdue';
  return 'upcoming';
}

export function formatTimestamp(date: Date): string {
  return format(date, 'MMM d, yyyy · h:mm a');
}

export function formatDateShort(date: Date): string {
  return format(date, 'MMM d');
}