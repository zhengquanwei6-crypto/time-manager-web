import { EmptyState } from '../common/EmptyState';
import { TaskCard } from './TaskCard';
import type { TaskItem } from '../../types/task';

interface TaskListProps {
  tasks: TaskItem[];
  emptyTitle: string;
  emptyDescription: string;
  onToggleTaskCompleted?: (taskId: string) => void;
  onEditTask?: (task: TaskItem) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskList({
  tasks,
  emptyTitle,
  emptyDescription,
  onToggleTaskCompleted,
  onEditTask,
  onDeleteTask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleTaskCompleted={onToggleTaskCompleted}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
}
