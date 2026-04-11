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

  let completedCount = 0;
  let todayCompletedCount = 0;
  let weekCompletedCount = 0;

  for (const task of tasks) {
    if (!task.completed) {
      continue;
    }

    completedCount++;

    if (isTodayDate(task.completedAt)) {
      todayCompletedCount++;
    }

    if (isThisWeekDate(task.completedAt)) {
      weekCompletedCount++;
    }
  }

  const activeCount = totalCount - completedCount;
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
