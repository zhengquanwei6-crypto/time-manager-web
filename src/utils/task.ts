import dayjs from 'dayjs';
import {
  formatWeekLabel,
  getCurrentWeekDays,
  isTaskDateOverdue,
  isThisWeekDate,
  isTodayDate,
} from './date';
import type {
  TaskFilterValue,
  TaskFormInput,
  TaskItem,
  WeekTaskGroup,
} from '../types/task';

export function isTaskItem(value: unknown): value is TaskItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybeTask = value as TaskItem;

  return (
    typeof maybeTask.id === 'string' &&
    typeof maybeTask.title === 'string' &&
    (typeof maybeTask.deadline === 'string' || maybeTask.deadline === null) &&
    typeof maybeTask.completed === 'boolean' &&
    typeof maybeTask.createdAt === 'string' &&
    (typeof maybeTask.completedAt === 'string' || maybeTask.completedAt === null)
  );
}

export function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createTask(input: TaskFormInput): TaskItem {
  const now = dayjs().toISOString();

  return {
    id: generateId('task'),
    title: input.title.trim(),
    deadline: input.deadline,
    completed: false,
    createdAt: now,
    completedAt: null,
  };
}

export function sortTasksByDeadline(tasks: TaskItem[]): TaskItem[] {
  return [...tasks].sort((firstTask, secondTask) => {
    if (firstTask.completed !== secondTask.completed) {
      return firstTask.completed ? 1 : -1;
    }

    const firstDeadline = firstTask.deadline
      ? dayjs(firstTask.deadline).valueOf()
      : Number.MAX_SAFE_INTEGER;
    const secondDeadline = secondTask.deadline
      ? dayjs(secondTask.deadline).valueOf()
      : Number.MAX_SAFE_INTEGER;

    if (firstDeadline !== secondDeadline) {
      return firstDeadline - secondDeadline;
    }

    return (
      dayjs(secondTask.createdAt).valueOf() - dayjs(firstTask.createdAt).valueOf()
    );
  });
}

export function filterTasksByStatus(
  tasks: TaskItem[],
  filter: TaskFilterValue,
): TaskItem[] {
  if (filter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (filter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

export function getTodayTasks(tasks: TaskItem[]): TaskItem[] {
  return sortTasksByDeadline(
    tasks.filter((task) => {
      if (!task.deadline) {
        return false;
      }

      return isTodayDate(task.deadline) || isTaskDateOverdue(task.deadline, task.completed);
    }),
  );
}

export function getWeekTasks(tasks: TaskItem[]): TaskItem[] {
  return sortTasksByDeadline(
    tasks.filter((task) => task.deadline && isThisWeekDate(task.deadline)),
  );
}

export function getWeekTaskGroups(tasks: TaskItem[]): WeekTaskGroup[] {
  const weekTasks = getWeekTasks(tasks);

  return getCurrentWeekDays().map((day) => {
    const dateKey = day.format('YYYY-MM-DD');
    const groupTasks = weekTasks.filter(
      (task) => task.deadline && dayjs(task.deadline).isSame(day, 'day'),
    );

    return {
      dateKey,
      label: formatWeekLabel(dateKey),
      tasks: groupTasks,
    };
  });
}

export function updateTaskItem(task: TaskItem, input: TaskFormInput): TaskItem {
  return {
    ...task,
    title: input.title.trim(),
    deadline: input.deadline,
  };
}
