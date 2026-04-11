import dayjs from 'dayjs';
import { memo } from 'react';
import type { TaskItem, TaskPriority } from '../../types/task';
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_OPTIONS } from '../../utils/task';

interface TodayTaskCardProps {
  task: TaskItem;
  selected: boolean;
  isNew: boolean;
  isCompleting: boolean;
  isDragging: boolean;
  onSelectChange: (taskId: string, selected: boolean) => void;
  onToggleTaskCompleted: (taskId: string) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (task: TaskItem) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
}

function getStatusLabel(task: TaskItem) {
  if (task.completed) {
    return '已完成';
  }

  if (task.deadline && dayjs(task.deadline).isBefore(dayjs())) {
    return '已逾期';
  }

  return '待处理';
}

function getDeadlineLabel(task: TaskItem) {
  if (!task.deadline) {
    return '未设置截止时间';
  }

  const deadline = dayjs(task.deadline);

  if (!deadline.isValid()) {
    return '时间格式错误';
  }

  const base = deadline.isSame(dayjs(), 'day')
    ? `今天 ${deadline.format('HH:mm')}`
    : deadline.format('MM-DD HH:mm');

  if (task.completed) {
    return base;
  }

  return `${base} · ${deadline.fromNow()}`;
}

function TodayTaskCardComponent({
  task,
  selected,
  isNew,
  isCompleting,
  isDragging,
  onSelectChange,
  onToggleTaskCompleted,
  onEditTask,
  onDeleteTask,
  onPriorityChange,
  onDragStart,
  onDragEnd,
}: TodayTaskCardProps) {
  return (
    <article
      className={`today-v2-task-card ${
        task.completed ? 'today-v2-task-card-completed' : ''
      } ${selected ? 'today-v2-task-card-selected' : ''} ${
        task.priority === 'high'
          ? 'today-v2-task-card-high'
          : task.priority === 'medium'
            ? 'today-v2-task-card-medium'
            : 'today-v2-task-card-low'
      } ${isNew ? 'today-v2-task-card-added' : ''} ${
        isCompleting ? 'today-v2-task-card-completing' : ''
      } ${isDragging ? 'today-v2-task-card-dragging' : ''}`}
      role="listitem"
      draggable
      aria-label={`任务 ${task.title}`}
      aria-grabbed={isDragging}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', task.id);
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
    >
      <div className="today-v2-task-main">
        <label className="today-v2-select-wrap">
          <input
            className="today-v2-select-checkbox"
            type="checkbox"
            checked={selected}
            aria-label={`选择任务 ${task.title}`}
            onChange={(event) => onSelectChange(task.id, event.target.checked)}
          />
          <span>多选</span>
        </label>

        <div className="today-v2-task-content">
          <div className="today-v2-task-heading">
            <h3 className="today-v2-task-title">{task.title}</h3>
            <div className="today-v2-task-tags">
              <span
                className={`today-v2-priority-badge today-v2-priority-badge-${task.priority}`}
              >
                {TASK_PRIORITY_LABELS[task.priority]}优先级
              </span>
              <span
                className={`today-v2-status-badge ${
                  task.completed
                    ? 'today-v2-status-success'
                    : getStatusLabel(task) === '已逾期'
                      ? 'today-v2-status-danger'
                      : 'today-v2-status-neutral'
                }`}
              >
                {getStatusLabel(task)}
              </span>
            </div>
          </div>

          <p className="today-v2-task-meta">{getDeadlineLabel(task)}</p>

          <div
            className="today-v2-priority-toggle"
            role="group"
            aria-label={`调整 ${task.title} 的优先级`}
          >
            {TASK_PRIORITY_OPTIONS.map((priorityOption) => (
              <button
                key={priorityOption}
                className={`today-v2-mini-priority ${
                  task.priority === priorityOption
                    ? `today-v2-mini-priority-active today-v2-mini-priority-${priorityOption}`
                    : ''
                }`}
                type="button"
                aria-pressed={task.priority === priorityOption}
                onClick={() => onPriorityChange(task.id, priorityOption)}
              >
                {TASK_PRIORITY_LABELS[priorityOption]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="today-v2-task-actions">
        <button
          className="button button-primary today-v2-task-action"
          type="button"
          onClick={() => onToggleTaskCompleted(task.id)}
        >
          {task.completed ? '恢复待处理' : '完成任务'}
        </button>
        <button
          className="button button-secondary today-v2-task-action"
          type="button"
          onClick={() => onEditTask(task)}
        >
          编辑
        </button>
        <button
          className="button button-danger today-v2-task-action"
          type="button"
          onClick={() => onDeleteTask(task)}
        >
          删除
        </button>
      </div>
    </article>
  );
}

export const TodayTaskCard = memo(TodayTaskCardComponent);
