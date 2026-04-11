/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import type { UseTasksResult } from '../hooks/useTasks';

const TasksContext = createContext<UseTasksResult | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompleted } =
    useTasks();

  const value = useMemo<UseTasksResult>(
    () => ({ tasks, addTask, updateTask, deleteTask, toggleTaskCompleted }),
    [tasks, addTask, updateTask, deleteTask, toggleTaskCompleted],
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasksContext(): UseTasksResult {
  const context = useContext(TasksContext);

  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }

  return context;
}
