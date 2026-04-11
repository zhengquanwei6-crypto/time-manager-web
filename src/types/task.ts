export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskItem {
  id: string;
  title: string;
  deadline: string | null;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
  priority: TaskPriority;
}

export interface TaskFormInput {
  title: string;
  deadline: string | null;
  priority?: TaskPriority;
}

export type TaskFilterValue = 'all' | 'active' | 'completed';

export type TaskPriorityFilterValue = 'all' | TaskPriority;

export type TaskSortValue = 'recommended' | 'priority' | 'deadline' | 'status';

export interface WeekTaskGroup {
  dateKey: string;
  label: string;
  tasks: TaskItem[];
}
