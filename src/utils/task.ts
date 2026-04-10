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

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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

export function createMockTasks(): TaskItem[] {
  const now = dayjs();

  return sortTasksByDeadline([
    {
      id: 'task_demo_1',
      title: '整理今天最重要的 3 件事',
      deadline: now.add(2, 'hour').toISOString(),
      completed: false,
      createdAt: now.subtract(1, 'day').toISOString(),
      completedAt: null,
    },
    {
      id: 'task_demo_2',
      title: '完成本周复盘草稿',
      deadline: now.add(1, 'day').hour(18).minute(0).second(0).toISOString(),
      completed: false,
      createdAt: now.subtract(2, 'day').toISOString(),
      completedAt: null,
    },
    {
      id: 'task_demo_3',
      title: '查看逾期任务的显示效果',
      deadline: now.subtract(3, 'hour').toISOString(),
      completed: false,
      createdAt: now.subtract(1, 'day').toISOString(),
      completedAt: null,
    },
    {
      id: 'task_demo_4',
      title: '已完成任务示例',
      deadline: now.startOf('day').add(10, 'hour').toISOString(),
      completed: true,
      createdAt: now.subtract(2, 'day').toISOString(),
      completedAt: now.subtract(30, 'minute').toISOString(),
    },
    {
      id: 'task_demo_5',
      title: '安排周末学习时间',
      deadline: now
        .startOf('isoWeek')
        .add(5, 'day')
        .hour(14)
        .minute(0)
        .second(0)
        .toISOString(),
      completed: false,
      createdAt: now.subtract(3, 'day').toISOString(),
      completedAt: null,
    },
  ]);
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
      tasks: sortTasksByDeadline(groupTasks),
    };
  });
}

export function getRecentTasks(tasks: TaskItem[], limit = 5): TaskItem[] {
  return sortTasksByDeadline(tasks).slice(0, limit);
}

export function updateTaskItem(task: TaskItem, input: TaskFormInput): TaskItem {
  return {
    ...task,
    title: input.title.trim(),
    deadline: input.deadline,
  };
}
