import dayjs, { type Dayjs } from 'dayjs';
import { useId, useState } from 'react';
import { formatInputDateTime, toIsoFromInput } from '../../utils/date';
import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_OPTIONS,
  normalizeTaskPriority,
} from '../../utils/task';
import type { TaskFormInput, TaskItem, TaskPriority } from '../../types/task';

interface TodayQuickAddFormProps {
  initialTask?: TaskItem | null;
  onSubmit: (input: TaskFormInput) => void;
  onCancel?: () => void;
}

function getDefaultDeadline(): string {
  const now = dayjs();
  const evening = now.hour(18).minute(0).second(0).millisecond(0);

  if (now.isBefore(evening)) {
    return evening.toISOString();
  }

  return now.endOf('day').toISOString();
}

const timePresets: Array<{ label: string; getValue: () => Dayjs }> = [
  {
    label: '30 分钟后',
    getValue: () => dayjs().add(30, 'minute'),
  },
  {
    label: '今天 18:00',
    getValue: () => dayjs().hour(18).minute(0).second(0).millisecond(0),
  },
  {
    label: '今晚 21:00',
    getValue: () => dayjs().hour(21).minute(0).second(0).millisecond(0),
  },
];

export function TodayQuickAddForm({
  initialTask = null,
  onSubmit,
  onCancel,
}: TodayQuickAddFormProps) {
  const formId = useId();
  const isEditing = Boolean(initialTask);

  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [deadlineInput, setDeadlineInput] = useState(
    formatInputDateTime(initialTask?.deadline ?? getDefaultDeadline()),
  );
  const [priority, setPriority] = useState<TaskPriority>(
    normalizeTaskPriority(initialTask?.priority),
  );
  const [errorMessage, setErrorMessage] = useState('');

  const titleId = `${formId}-title`;
  const deadlineId = `${formId}-deadline`;
  const helperId = `${formId}-helper`;

  const applyPreset = (getValue: () => Dayjs) => {
    setDeadlineInput(formatInputDateTime(getValue().toISOString()));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage('先写下今天要完成什么。');
      return;
    }

    onSubmit({
      title: title.trim(),
      deadline: toIsoFromInput(deadlineInput) ?? getDefaultDeadline(),
      priority,
    });

    setErrorMessage('');

    if (!isEditing) {
      setTitle('');
      setDeadlineInput(formatInputDateTime(getDefaultDeadline()));
      setPriority('medium');
    }
  };

  return (
    <form className="today-v2-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor={titleId}>
          {isEditing ? '修改任务内容' : '新增今天的任务'}
        </label>
        <input
          id={titleId}
          className="form-input"
          type="text"
          placeholder="例如：下午 3 点前发出周报"
          aria-describedby={helperId}
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="today-v2-form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor={deadlineId}>
            截止时间
          </label>
          <input
            id={deadlineId}
            className="form-input"
            type="datetime-local"
            value={deadlineInput}
            onChange={(event) => setDeadlineInput(event.target.value)}
          />
        </div>

        <div className="form-group">
          <span className="form-label">默认优先级</span>
          <div className="today-v2-priority-group" role="radiogroup" aria-label="任务优先级">
            {TASK_PRIORITY_OPTIONS.map((priorityOption) => (
              <button
                key={priorityOption}
                className={`today-v2-priority-chip ${
                  priority === priorityOption
                    ? `today-v2-priority-chip-active today-v2-priority-chip-${priorityOption}`
                    : ''
                }`}
                type="button"
                role="radio"
                aria-checked={priority === priorityOption}
                onClick={() => setPriority(priorityOption)}
              >
                {TASK_PRIORITY_LABELS[priorityOption]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="today-v2-preset-row" aria-label="快捷截止时间">
        {timePresets.map((preset) => (
          <button
            key={preset.label}
            className="today-v2-preset-button"
            type="button"
            onClick={() => applyPreset(preset.getValue)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <p id={helperId} className="form-hint">
        新任务默认会带上截止时间和优先级，你可以稍后再改，不会丢失当前输入。
      </p>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <div className="button-row form-button-row">
        <button className="button button-primary form-primary-button" type="submit">
          {isEditing ? '保存修改' : '立即添加'}
        </button>
        {isEditing && onCancel ? (
          <button
            className="button button-secondary"
            type="button"
            onClick={onCancel}
          >
            取消编辑
          </button>
        ) : null}
      </div>
    </form>
  );
}
