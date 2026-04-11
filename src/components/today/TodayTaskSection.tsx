import { EmptyState } from '../common/EmptyState';
import type { TaskItem } from '../../types/task';
import { TodayTaskCard } from './TodayTaskCard';

interface TodayTaskSectionProps {
  id: string;
  title: string;
  description: string;
  tasks: TaskItem[];
  selectedTaskIds: string[];
  onSelectChange: (taskId: string, selected: boolean) => void;
  onToggleTaskCompleted: (taskId: string) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (task: TaskItem) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function TodayTaskSection({
  id,
  title,
  description,
  tasks,
  selectedTaskIds,
  onSelectChange,
  onToggleTaskCompleted,
  onEditTask,
  onDeleteTask,
  emptyTitle,
  emptyDescription,
  collapsible = false,
  collapsed = false,
  onToggleCollapsed,
}: TodayTaskSectionProps) {
  return (
    <section className="today-task-section panel" aria-labelledby={`${id}-title`}>
      <div className="today-task-section-header">
        <div>
          <h2 id={`${id}-title`} className="section-title">
            {title}
          </h2>
          <p className="section-description">{description}</p>
        </div>
        <div className="today-task-section-actions">
          <span className="today-task-count">{tasks.length}</span>
          {collapsible && onToggleCollapsed ? (
            <button
              className="button button-secondary"
              type="button"
              onClick={onToggleCollapsed}
              aria-expanded={!collapsed}
            >
              {collapsed ? '展开' : '收起'}
            </button>
          ) : null}
        </div>
      </div>

      {!tasks.length ? (
        <EmptyState
          title={emptyTitle ?? '这里还没有任务'}
          description={emptyDescription ?? '继续往下安排就好。'}
        />
      ) : collapsed ? null : (
        <div className="today-task-list" role="list">
          {tasks.map((task) => (
            <TodayTaskCard
              key={task.id}
              task={task}
              selected={selectedTaskIds.includes(task.id)}
              onSelectChange={onSelectChange}
              onToggleTaskCompleted={onToggleTaskCompleted}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </section>
  );
}
