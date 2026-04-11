import type { PomodoroState } from '../types/pomodoro';
import type { TaskItem } from '../types/task';
import { isPomodoroState } from './pomodoro';
import { normalizeTaskItem } from './task';

export const TASKS_STORAGE_KEY = 'time-manager.tasks';
export const POMODORO_STORAGE_KEY = 'time-manager.pomodoro';

function loadJson<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.error(`读取本地存储失败: ${key}`, error);
    return null;
  }
}

function saveJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`写入本地存储失败: ${key}`, error);
  }
}

export function loadTasksFromStorage(): TaskItem[] | null {
  const tasks = loadJson<TaskItem[]>(TASKS_STORAGE_KEY);

  if (!tasks || !Array.isArray(tasks)) {
    return null;
  }

  const validTasks = tasks
    .map((task) => normalizeTaskItem(task))
    .filter((task): task is TaskItem => task !== null);

  return validTasks;
}

export function saveTasksToStorage(tasks: TaskItem[]): void {
  saveJson(TASKS_STORAGE_KEY, tasks);
}

export function loadPomodoroFromStorage(): PomodoroState | null {
  const pomodoro = loadJson<PomodoroState>(POMODORO_STORAGE_KEY);

  if (!isPomodoroState(pomodoro)) {
    return null;
  }

  return pomodoro;
}

export function savePomodoroToStorage(state: PomodoroState): void {
  saveJson(POMODORO_STORAGE_KEY, state);
}
