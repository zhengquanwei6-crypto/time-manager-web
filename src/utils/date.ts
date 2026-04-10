import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/zh-cn';

dayjs.extend(isoWeek);
dayjs.extend(localizedFormat);
dayjs.locale('zh-cn');

export function formatTaskDateTime(value: string | null): string {
  if (!value) {
    return '未设置截止时间';
  }

  const date = dayjs(value);

  if (!date.isValid()) {
    return '时间格式错误';
  }

  return date.format('YYYY-MM-DD HH:mm');
}

export function formatInputDateTime(value: string | null): string {
  if (!value) {
    return '';
  }

  return dayjs(value).format('YYYY-MM-DDTHH:mm');
}

export function toIsoFromInput(value: string): string | null {
  if (!value) {
    return null;
  }

  return dayjs(value).toISOString();
}

export function isTodayDate(value: string | null): boolean {
  if (!value) {
    return false;
  }

  return dayjs(value).isSame(dayjs(), 'day');
}

export function isThisWeekDate(value: string | null): boolean {
  if (!value) {
    return false;
  }

  const date = dayjs(value);
  const start = dayjs().startOf('isoWeek');
  const end = dayjs().endOf('isoWeek');

  return date.valueOf() >= start.valueOf() && date.valueOf() <= end.valueOf();
}

export function isTaskDateOverdue(
  deadline: string | null,
  completed: boolean,
): boolean {
  if (!deadline || completed) {
    return false;
  }

  return dayjs(deadline).isBefore(dayjs());
}

export function getCurrentWeekDays(baseDate: Dayjs = dayjs()): Dayjs[] {
  const start = baseDate.startOf('isoWeek');

  return Array.from({ length: 7 }, (_, index) => start.add(index, 'day'));
}

export function formatWeekLabel(value: string): string {
  return dayjs(value).format('MM-DD dddd');
}

export function formatTime(seconds: number): string {
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`;
}
