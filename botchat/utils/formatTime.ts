import {
  formatDistanceToNow,
  format,
  isToday,
  isYesterday,
  differenceInDays,
  differenceInMinutes,
} from 'date-fns';

/**
 * Format message timestamp for display in conversation list
 */
export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const minutesAgo = differenceInMinutes(now, date);

  // Less than 1 minute ago
  if (minutesAgo < 1) {
    return 'just now';
  }

  // 1-59 minutes ago
  if (minutesAgo < 60) {
    return `${minutesAgo}m`;
  }

  // Today
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }

  // Yesterday
  if (isYesterday(date)) {
    return 'Yesterday';
  }

  const daysAgo = differenceInDays(now, date);

  // 2-6 days ago - show day name
  if (daysAgo < 7) {
    return format(date, 'EEEE'); // e.g., "Monday"
  }

  // 7+ days ago
  return format(date, 'dd/MM/yy');
};

/**
 * Format date separator for chat messages
 */
export const formatDateSeparator = (date: Date): string => {
  // Today
  if (isToday(date)) {
    return 'Today';
  }

  // Yesterday
  if (isYesterday(date)) {
    return 'Yesterday';
  }

  const daysAgo = differenceInDays(new Date(), date);

  // 2-6 days ago - show full day name
  if (daysAgo < 7) {
    return format(date, 'EEEE');
  }

  // 7+ days ago - show full date
  return format(date, 'dd MMMM yyyy');
};
