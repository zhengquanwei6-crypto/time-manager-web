import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import type { TaskFormInput, TaskItem } from '../types/task';
import { loadTasksFromStorage, saveTasksToStorage } from '../utils/storage';
import {
  createTask,
  sortTasksByDeadline,
  updateTaskItem,
} from '../utils/task';

const STORAGE_DEBOUNCE_MS = 300;

export interface UseTasksResult {
  tasks: TaskItem[];
  addTask: (input: TaskFormInput) => void;
  updateTask: (taskId: string, input: TaskFormInput) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompleted: (taskId: string) => void;
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

  useEffect(() => {
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveTasksToStorage(tasks);
    }, STORAGE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(saveTimerRef.current);
    };
  }, [tasks]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.clearTimeout(saveTimerRef.current);
      saveTasksToStorage(tasks);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tasks]);

  const addTask = useCallback((input: TaskFormInput) => {
    setTasks((currentTasks) =>
      sortTasksByDeadline([...currentTasks, createTask(input)]),
    );
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
    deleteTask,
    toggleTaskCompleted,
  };
}
