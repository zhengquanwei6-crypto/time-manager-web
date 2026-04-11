import dayjs, { type Dayjs } from 'dayjs';
import { useId, useState } from 'react';
import { formatInputDateTime, toIsoFromInput } from '../../utils/date';
import type { TaskFormInput, TaskItem } from '../../types/task';

interface TodayQuickAddFormProps {
  initialTask?: TaskItem | null;
  onSubmit: (input: TaskFormInput) => void;
  onCancel?: () => void;
}

const timePresets = [
  {
    label: '1 小时后',
    getValue: (): Dayjs =>
      dayjs().add(1, 'hour').minute(0).second(0).millisecond(0),
  },
  {
    label: '今天 18:00',
    getValue: (): Dayjs =>
      dayjs().hour(18).minute(0).second(0).millisecond(0),
  },
  {
    label: '今晚 21:00',
    getValue: (): Dayjs =>
      dayjs().hour(21).minute(0).second(0).millisecond(0),
  },
];

export function TodayQuickAddForm({
  initialTask = null,
  onSubmit,
  onCancel,
}: TodayQuickAddFormProps) {
  const formId = useId();
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [deadlineInput, setDeadlineInput] = useState(
    formatInputDateTime(initialTask?.deadline ?? dayjs().endOf('day').toISOString()),
  );
  const [errorMessage, setErrorMessage] = useState('');

  const isEditing = Boolean(initialTask);
  const titleId = `${formId}-title`;
  const deadlineId = `${formId}-deadline`;
  const hintId = `${formId}-hint`;

  const applyPreset = (getValue: () => Dayjs) => {
    const nextValue = getValue();
    setDeadlineInput(formatInputDateTime(nextValue.toISOString()));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage('先写下今天要做什么。');
      return;
    }

    onSubmit({
      title: title.trim(),
      deadline: toIsoFromInput(deadlineInput) ?? dayjs().endOf('day').toISOString(),
    });

    setErrorMessage('');

    if (!isEditing) {
      setTitle('');
      setDeadlineInput(formatInputDateTime(dayjs().endOf('day').toISOString()));
    }
  };

  return (
    <form className="today-quick-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor={titleId}>
          {isEditing ? '修改这条任务' : '快速记一条今天要做的事'}
        </label>
        <input
          id={titleId}
          className="form-input"
          type="text"
          placeholder="例如：下午 3 点前发出周报"
          autoFocus
          aria-describedby={hintId}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={deadlineId}>
          今天几点前完成
        </label>
        <input
          id={deadlineId}
          className="form-input"
          type="datetime-local"
          value={deadlineInput}
          onChange={(event) => setDeadlineInput(event.target.value)}
        />
      </div>

      <div className="today-preset-row" aria-label="快捷时间">
        {timePresets.map((preset) => (
          <button
            key={preset.label}
            className="today-preset-button"
            type="button"
            onClick={() => applyPreset(preset.getValue)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <p id={hintId} className="form-hint">
        如果不改时间，默认会保存到今天 23:59，这样任务会立刻出现在今日列表。
      </p>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <div className="button-row form-button-row">
        <button className="button button-primary form-primary-button" type="submit">
          {isEditing ? '保存这条修改' : '记到今天'}
        </button>
        {isEditing && onCancel ? (
          <button
            className="button button-secondary"
            type="button"
            onClick={onCancel}
          >
            取消修改
          </button>
        ) : null}
      </div>
    </form>
  );
}
