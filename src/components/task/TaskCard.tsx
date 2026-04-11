import { useState } from 'react';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatRelativeTime, formatTaskDateTime, isTaskDateOverdue } from '../../utils/date';
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

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  return (
    <article className={`task-card ${task.completed ? 'task-card-completed' : ''}`}>
      <div className="task-card-main">
        <div className="task-card-title-row">
          <label className="task-check-row">
            <input
              className="task-checkbox"
              type="checkbox"
              checked={task.completed}
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
          onClick={() => onToggleTaskCompleted?.(task.id)}
        >
          {task.completed ? '恢复未完成' : '标记完成'}
        </button>
        <button
          className="button button-secondary task-action-button"
          type="button"
          onClick={() => onEditTask?.(task)}
        >
          编辑
        </button>
        <button
          className="button button-danger task-action-button"
          type="button"
          onClick={handleDeleteConfirm}
        >
          删除
        </button>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        title="确认删除"
        description={`确认删除任务"${task.title}"吗？删除后无法恢复。`}
        confirmLabel="删除"
        cancelLabel="取消"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </article>
  );
}
