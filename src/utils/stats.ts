import { isThisWeekDate, isTodayDate } from './date';
import type { TaskItem } from '../types/task';

export interface TaskStats {
  totalCount: number;
  completedCount: number;
  activeCount: number;
  todayCompletedCount: number;
  weekCompletedCount: number;
  completionRate: number;
}

export function calculateTaskStats(tasks: TaskItem[]): TaskStats {
  const totalCount = tasks.length;
  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = totalCount - completedCount;
  const todayCompletedCount = tasks.filter(
    (task) => task.completed && isTodayDate(task.completedAt),
  ).length;
  const weekCompletedCount = tasks.filter(
    (task) => task.completed && isThisWeekDate(task.completedAt),
  ).length;
  const completionRate =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return {
    totalCount,
    completedCount,
    activeCount,
    todayCompletedCount,
    weekCompletedCount,
    completionRate,
  };
}
