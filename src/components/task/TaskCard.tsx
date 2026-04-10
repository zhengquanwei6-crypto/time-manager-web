import { formatTaskDateTime, isTaskDateOverdue } from '../../utils/date';
import type { TaskItem } from '../../types/task';

interface TaskCardProps {
  task: TaskItem;
  onToggleTaskCompleted?: (taskId: string) => void;
  onEditTask?: (task: TaskItem) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskCard({
  task,
  onToggleTaskCompleted,
  onEditTask,
  onDeleteTask,
}: TaskCardProps) {
  const isOverdue = isTaskDateOverdue(task.deadline, task.completed);

  const handleDelete = () => {
    if (!onDeleteTask) {
      return;
    }

    const confirmed = window.confirm(`确认删除任务“${task.title}”吗？`);

    if (confirmed) {
      onDeleteTask(task.id);
    }
  };

  return (
    <article className={`task-card ${task.completed ? 'task-card-completed' : ''}`}>
      <div className="task-card-main">
        <div className="task-card-header">
          <h3 className="task-card-title">{task.title}</h3>
          <span className={`status-badge ${isOverdue ? 'status-badge-danger' : ''}`}>
            {task.completed ? '已完成' : isOverdue ? '已逾期' : '进行中'}
          </span>
        </div>

        <p className="task-card-meta">截止时间：{formatTaskDateTime(task.deadline)}</p>
      </div>

      <div className="task-card-actions">
        <button
          className="button button-secondary"
          type="button"
          onClick={() => onToggleTaskCompleted?.(task.id)}
        >
          {task.completed ? '恢复未完成' : '标记完成'}
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => onEditTask?.(task)}
        >
          编辑
        </button>
        <button className="button button-danger" type="button" onClick={handleDelete}>
          删除
        </button>
      </div>
    </article>
  );
}
