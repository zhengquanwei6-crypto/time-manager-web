import dayjs from 'dayjs';
import { memo } from 'react';
import type { TaskItem } from '../../types/task';

interface TodayTaskCardProps {
  task: TaskItem;
  selected: boolean;
  onSelectChange: (taskId: string, selected: boolean) => void;
  onToggleTaskCompleted: (taskId: string) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (task: TaskItem) => void;
}

function getTaskTone(task: TaskItem) {
  if (task.completed) {
    return { label: '已完成', className: 'today-task-tone-success' };
  }

  if (task.deadline && dayjs(task.deadline).isBefore(dayjs())) {
    return { label: '逾期优先', className: 'today-task-tone-danger' };
  }

  if (task.deadline && dayjs(task.deadline).diff(dayjs(), 'hour') <= 3) {
    return { label: '马上处理', className: 'today-task-tone-warning' };
  }

  return { label: '今天安排', className: 'today-task-tone-primary' };
}

function getDeadlineLabel(task: TaskItem) {
  if (!task.deadline) {
    return '未设置截止时间';
  }

  const deadline = dayjs(task.deadline);

  if (!deadline.isValid()) {
    return '时间格式错误';
  }

  const baseLabel = deadline.isSame(dayjs(), 'day')
    ? `今天 ${deadline.format('HH:mm')}`
    : deadline.format('MM-DD HH:mm');

  if (task.completed) {
    return baseLabel;
  }

  const diffMinutes = deadline.diff(dayjs(), 'minute');

  if (diffMinutes < 0) {
    return `${baseLabel} · 已逾期 ${Math.abs(diffMinutes)} 分钟`;
  }

  if (diffMinutes < 60) {
    return `${baseLabel} · ${diffMinutes} 分钟后到期`;
  }

  const diffHours = Math.ceil(diffMinutes / 60);

  return `${baseLabel} · ${diffHours} 小时后到期`;
}

function TodayTaskCardComponent({
  task,
  selected,
  onSelectChange,
  onToggleTaskCompleted,
  onEditTask,
  onDeleteTask,
}: TodayTaskCardProps) {
  const tone = getTaskTone(task);

  return (
    <article
      className={`today-task-card ${
        task.completed ? 'today-task-card-completed' : ''
      }`}
      role="listitem"
    >
      <div className="today-task-card-header">
        <label className="today-task-select">
          <input
            className="today-select-checkbox"
            type="checkbox"
            checked={selected}
            aria-label={`选择任务 ${task.title}`}
            onChange={(event) => onSelectChange(task.id, event.target.checked)}
          />
          <span className="today-task-select-label">多选</span>
        </label>

        <div className="today-task-heading">
          <div className="today-task-title-row">
            <h3 className="today-task-title">{task.title}</h3>
            <span className={`today-task-tone ${tone.className}`}>
              {tone.label}
            </span>
          </div>
          <p className="today-task-meta">{getDeadlineLabel(task)}</p>
        </div>
      </div>

      <div className="today-task-actions">
        <button
          className="button button-primary today-task-action"
          type="button"
          onClick={() => onToggleTaskCompleted(task.id)}
        >
          {task.completed ? '继续处理' : '做完了'}
        </button>
        <button
          className="button button-secondary today-task-action"
          type="button"
          onClick={() => onEditTask(task)}
        >
          修改
        </button>
        <button
          className="button button-danger today-task-action"
          type="button"
          onClick={() => onDeleteTask(task)}
        >
          移除
        </button>
      </div>
    </article>
  );
}

export const TodayTaskCard = memo(TodayTaskCardComponent);
