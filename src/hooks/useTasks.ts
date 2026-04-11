import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import type { TaskFormInput, TaskItem, TaskPriority } from '../types/task';
import { loadTasksFromStorage, saveTasksToStorage } from '../utils/storage';
import {
  createTask,
  normalizeTaskPriority,
  sortTasksByDeadline,
  updateTaskItem,
} from '../utils/task';

const STORAGE_DEBOUNCE_MS = 300;

interface IdleCallbackLikeHandle {
  idleId?: number;
  timeoutId?: number;
}

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export interface UseTasksResult {
  tasks: TaskItem[];
  addTask: (input: TaskFormInput) => TaskItem;
  updateTask: (taskId: string, input: TaskFormInput) => void;
  updateTaskPriority: (taskId: string, priority: TaskPriority) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompleted: (taskId: string) => void;
}

function scheduleIdleSave(callback: () => void): IdleCallbackLikeHandle {
  const idleWindow = window as IdleWindow;

  if (typeof idleWindow.requestIdleCallback === 'function') {
    return {
      idleId: idleWindow.requestIdleCallback(callback, { timeout: 800 }),
    };
  }

  return {
    timeoutId: window.setTimeout(callback, 0),
  };
}

function cancelIdleSave(handle: IdleCallbackLikeHandle) {
  const idleWindow = window as IdleWindow;

  if (
    handle.idleId !== undefined &&
    typeof idleWindow.cancelIdleCallback === 'function'
  ) {
    idleWindow.cancelIdleCallback(handle.idleId);
  }

  if (handle.timeoutId !== undefined) {
    window.clearTimeout(handle.timeoutId);
  }
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const storedTasks = loadTasksFromStorage();

    if (storedTasks) {
      return sortTasksByDeadline(storedTasks);
    }

    return [];
  });

  const saveTimerRef = useRef<number | undefined>(undefined);
  const idleSaveRef = useRef<IdleCallbackLikeHandle>({});

  useEffect(() => {
    window.clearTimeout(saveTimerRef.current);
    cancelIdleSave(idleSaveRef.current);

    saveTimerRef.current = window.setTimeout(() => {
      idleSaveRef.current = scheduleIdleSave(() => {
        saveTasksToStorage(tasks);
      });
    }, STORAGE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(saveTimerRef.current);
      cancelIdleSave(idleSaveRef.current);
    };
  }, [tasks]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.clearTimeout(saveTimerRef.current);
      cancelIdleSave(idleSaveRef.current);
      saveTasksToStorage(tasks);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tasks]);

  const addTask = useCallback((input: TaskFormInput) => {
    const nextTask = createTask(input);

    setTasks((currentTasks) => sortTasksByDeadline([...currentTasks, nextTask]));

    return nextTask;
  }, []);

  const updateTask = useCallback((taskId: string, input: TaskFormInput) => {
    setTasks((currentTasks) =>
      sortTasksByDeadline(
        currentTasks.map((task) =>
          task.id === taskId ? updateTaskItem(task, input) : task,
        ),
      ),
    );
  }, []);

  const updateTaskPriority = useCallback(
    (taskId: string, priority: TaskPriority) => {
      setTasks((currentTasks) =>
        sortTasksByDeadline(
          currentTasks.map((task) =>
            task.id === taskId
              ? { ...task, priority: normalizeTaskPriority(priority) }
              : task,
          ),
        ),
      );
    },
    [],
  );

  const deleteTask = useCallback((taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );
  }, []);

  const toggleTaskCompleted = useCallback((taskId: string) => {
    setTasks((currentTasks) =>
      sortTasksByDeadline(
        currentTasks.map((task) => {
          if (task.id !== taskId) {
            return task;
          }

          const nextCompleted = !task.completed;

          return {
            ...task,
            completed: nextCompleted,
            completedAt: nextCompleted ? dayjs().toISOString() : null,
          };
        }),
      ),
    );
  }, []);

  return {
    tasks,
    addTask,
    updateTask,
    updateTaskPriority,
    deleteTask,
    toggleTaskCompleted,
  };
}
