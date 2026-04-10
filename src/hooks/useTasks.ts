import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import type { TaskFormInput, TaskItem } from '../types/task';
import { loadTasksFromStorage, saveTasksToStorage } from '../utils/storage';
import {
  createMockTasks,
  createTask,
  sortTasksByDeadline,
  updateTaskItem,
} from '../utils/task';

export interface UseTasksResult {
  tasks: TaskItem[];
  addTask: (input: TaskFormInput) => void;
  updateTask: (taskId: string, input: TaskFormInput) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompleted: (taskId: string) => void;
  resetTasks: () => void;
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const storedTasks = loadTasksFromStorage();

    if (storedTasks) {
      return sortTasksByDeadline(storedTasks);
    }

    return createMockTasks();
  });

  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const addTask = (input: TaskFormInput) => {
    setTasks((currentTasks) =>
      sortTasksByDeadline([...currentTasks, createTask(input)]),
    );
  };

  const updateTask = (taskId: string, input: TaskFormInput) => {
    setTasks((currentTasks) =>
      sortTasksByDeadline(
        currentTasks.map((task) =>
          task.id === taskId ? updateTaskItem(task, input) : task,
        ),
      ),
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );
  };

  const toggleTaskCompleted = (taskId: string) => {
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
  };

  const resetTasks = () => {
    setTasks(createMockTasks());
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    resetTasks,
  };
}
