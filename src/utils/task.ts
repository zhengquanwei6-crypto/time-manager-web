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
  TaskPriority,
  TaskPriorityFilterValue,
  TaskSortValue,
  WeekTaskGroup,
} from '../types/task';

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export const TASK_PRIORITY_OPTIONS: TaskPriority[] = ['high', 'medium', 'low'];

const TASK_PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function normalizeTaskPriority(value: unknown): TaskPriority {
  if (value === 'high' || value === 'medium' || value === 'low') {
    return value;
  }

  return 'medium';
}

export function normalizeTaskItem(value: unknown): TaskItem | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const maybeTask = value as Partial<TaskItem>;

  if (
    typeof maybeTask.id !== 'string' ||
    typeof maybeTask.title !== 'string' ||
    (typeof maybeTask.deadline !== 'string' && maybeTask.deadline !== null) ||
    typeof maybeTask.completed !== 'boolean' ||
    typeof maybeTask.createdAt !== 'string' ||
    (typeof maybeTask.completedAt !== 'string' && maybeTask.completedAt !== null)
  ) {
    return null;
  }

  return {
    id: maybeTask.id,
    title: maybeTask.title,
    deadline: maybeTask.deadline,
    completed: maybeTask.completed,
    createdAt: maybeTask.createdAt,
    completedAt: maybeTask.completedAt,
    priority: normalizeTaskPriority(maybeTask.priority),
  };
}

export function isTaskItem(value: unknown): value is TaskItem {
  return normalizeTaskItem(value) !== null;
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
    priority: normalizeTaskPriority(input.priority),
  };
}

export function getTaskPriorityWeight(priority: TaskPriority): number {
  return TASK_PRIORITY_WEIGHT[priority];
}

function compareByPriority(firstTask: TaskItem, secondTask: TaskItem) {
  return (
    getTaskPriorityWeight(secondTask.priority) -
    getTaskPriorityWeight(firstTask.priority)
  );
}

function compareByDeadline(firstTask: TaskItem, secondTask: TaskItem) {
  const firstDeadline = firstTask.deadline
    ? dayjs(firstTask.deadline).valueOf()
    : Number.MAX_SAFE_INTEGER;
  const secondDeadline = secondTask.deadline
    ? dayjs(secondTask.deadline).valueOf()
    : Number.MAX_SAFE_INTEGER;

  if (firstDeadline !== secondDeadline) {
    return firstDeadline - secondDeadline;
  }

  return dayjs(secondTask.createdAt).valueOf() - dayjs(firstTask.createdAt).valueOf();
}

export function compareTasksByRecommended(
  firstTask: TaskItem,
  secondTask: TaskItem,
): number {
  if (firstTask.completed !== secondTask.completed) {
    return firstTask.completed ? 1 : -1;
  }

  const firstOverdue = isTaskDateOverdue(firstTask.deadline, firstTask.completed);
  const secondOverdue = isTaskDateOverdue(
    secondTask.deadline,
    secondTask.completed,
  );

  if (firstOverdue !== secondOverdue) {
    return firstOverdue ? -1 : 1;
  }

  const priorityDiff = compareByPriority(firstTask, secondTask);

  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  return compareByDeadline(firstTask, secondTask);
}

export function compareTasksByPriority(
  firstTask: TaskItem,
  secondTask: TaskItem,
): number {
  if (firstTask.completed !== secondTask.completed) {
    return firstTask.completed ? 1 : -1;
  }

  const priorityDiff = compareByPriority(firstTask, secondTask);

  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  return compareByDeadline(firstTask, secondTask);
}

export function compareTasksByStatus(
  firstTask: TaskItem,
  secondTask: TaskItem,
): number {
  if (firstTask.completed !== secondTask.completed) {
    return firstTask.completed ? 1 : -1;
  }

  const overdueDiff =
    Number(isTaskDateOverdue(secondTask.deadline, secondTask.completed)) -
    Number(isTaskDateOverdue(firstTask.deadline, firstTask.completed));

  if (overdueDiff !== 0) {
    return overdueDiff;
  }

  const priorityDiff = compareByPriority(firstTask, secondTask);

  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  return compareByDeadline(firstTask, secondTask);
}

export function sortTasksByDeadline(tasks: TaskItem[]): TaskItem[] {
  return [...tasks].sort(compareTasksByRecommended);
}

export function sortTasksForToday(
  tasks: TaskItem[],
  sortBy: TaskSortValue,
): TaskItem[] {
  const clonedTasks = [...tasks];

  if (sortBy === 'priority') {
    return clonedTasks.sort(compareTasksByPriority);
  }

  if (sortBy === 'deadline') {
    return clonedTasks.sort(compareByDeadline);
  }

  if (sortBy === 'status') {
    return clonedTasks.sort(compareTasksByStatus);
  }

  return clonedTasks.sort(compareTasksByRecommended);
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

export function filterTasksByPriority(
  tasks: TaskItem[],
  filter: TaskPriorityFilterValue,
): TaskItem[] {
  if (filter === 'all') {
    return tasks;
  }

  return tasks.filter((task) => task.priority === filter);
}

export function getTodayTasks(tasks: TaskItem[]): TaskItem[] {
  return sortTasksByDeadline(
    tasks.filter((task) => {
      if (!task.deadline) {
        return false;
      }

      return (
        isTodayDate(task.deadline) ||
        isTaskDateOverdue(task.deadline, task.completed)
      );
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

export function getCoreTodayTask(tasks: TaskItem[]): TaskItem | null {
  return (
    sortTasksForToday(
      tasks.filter((task) => !task.completed),
      'recommended',
    )[0] ?? null
  );
}

export function updateTaskItem(task: TaskItem, input: TaskFormInput): TaskItem {
  return {
    ...task,
    title: input.title.trim(),
    deadline: input.deadline,
    priority: input.priority ? normalizeTaskPriority(input.priority) : task.priority,
  };
}
