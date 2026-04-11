import { useState } from 'react';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  formatRelativeTime,
  formatTaskDateTime,
  isTaskDateOverdue,
} from '../../utils/date';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isOverdue = isTaskDateOverdue(task.deadline, task.completed);

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDeleteTask?.(task.id);
  };

  return (
    <article
      className={`task-card ${task.completed ? 'task-card-completed' : ''}`}
      aria-label={`任务：${task.title}`}
      role="listitem"
    >
      <div className="task-card-main">
        <div className="task-card-title-row">
          <label className="task-check-row">
            <input
              className="task-checkbox"
              type="checkbox"
              checked={task.completed}
              aria-label={task.completed ? '恢复为待处理' : '标记为已完成'}
              onChange={() => onToggleTaskCompleted?.(task.id)}
            />
            <h3 className="task-card-title">{task.title}</h3>
          </label>
        </div>

        <div className="task-card-meta-row">
          <span
            className={`status-badge ${
              task.completed
                ? 'status-badge-success'
                : isOverdue
                  ? 'status-badge-danger'
                  : ''
            }`}
          >
            {task.completed ? '已完成' : isOverdue ? '已逾期' : '进行中'}
          </span>
          <p className="task-card-meta">
            截止时间：{formatTaskDateTime(task.deadline)}
            {!task.completed && task.deadline ? (
              <span className="task-card-relative-time">
                （{formatRelativeTime(task.deadline)}）
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="task-card-actions">
        <button
          className="button button-primary task-action-button"
          type="button"
          aria-label={task.completed ? '恢复为待处理' : '标记为已完成'}
          onClick={() => onToggleTaskCompleted?.(task.id)}
        >
          {task.completed ? '继续处理' : '做完了'}
        </button>
        <button
          className="button button-secondary task-action-button"
          type="button"
          aria-label={`修改任务 ${task.title}`}
          onClick={() => onEditTask?.(task)}
        >
          修改
        </button>
        <button
          className="button button-danger task-action-button"
          type="button"
          aria-label={`移除任务 ${task.title}`}
          onClick={() => setShowDeleteConfirm(true)}
        >
          移除
        </button>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        title="确认移除任务"
        description={`确认移除“${task.title}”吗？移除后将无法自动恢复。`}
        confirmLabel="移除"
        cancelLabel="取消"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </article>
  );
}
