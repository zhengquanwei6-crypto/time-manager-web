export interface TaskItem {
  id: string;
  title: string;
  deadline: string | null;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface TaskFormInput {
  title: string;
  deadline: string | null;
}

export type TaskFilterValue = 'all' | 'active' | 'completed';

export interface WeekTaskGroup {
  dateKey: string;
  label: string;
  tasks: TaskItem[];
}
