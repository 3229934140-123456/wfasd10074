import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export { dayjs };

export function formatDate(date: string, format = 'YYYY年MM月DD日'): string {
  return dayjs(date).format(format);
}

export function formatDateTime(date: string, format = 'YYYY年MM月DD日 HH:mm'): string {
  return dayjs(date).format(format);
}

export function formatMoney(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN')}`;
}

export function getDaysUntil(targetDate: string): number {
  return dayjs(targetDate).startOf('day').diff(dayjs().startOf('day'), 'day');
}

export function isDatePast(date: string): boolean {
  return dayjs(date).isBefore(dayjs(), 'day');
}

export function isDateSoon(date: string, days = 7): boolean {
  const diff = getDaysUntil(date);
  return diff >= 0 && diff <= days;
}

export function getRelativeTime(date: string): string {
  return dayjs(date).fromNow();
}
