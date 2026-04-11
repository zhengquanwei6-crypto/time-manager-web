import { useId, useState } from 'react';
import { formatInputDateTime, toIsoFromInput } from '../../utils/date';
import type { TaskFormInput, TaskItem } from '../../types/task';

interface TaskFormProps {
  initialTask?: TaskItem | null;
  onSubmit: (input: TaskFormInput) => void;
  onCancel?: () => void;
}

export function TaskForm({
  initialTask = null,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const formId = useId();
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [deadlineInput, setDeadlineInput] = useState(
    formatInputDateTime(initialTask?.deadline ?? null),
  );
  const [errorMessage, setErrorMessage] = useState('');

  const isEditing = Boolean(initialTask);
  const titleId = `${formId}-title`;
  const deadlineId = `${formId}-deadline`;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage('任务名称不能为空');
      return;
    }

    onSubmit({
      title: title.trim(),
      deadline: toIsoFromInput(deadlineInput),
    });

    if (!isEditing) {
      setTitle('');
      setDeadlineInput('');
    }

    setErrorMessage('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor={titleId}>
          任务名称
        </label>
        <input
          id={titleId}
          className="form-input"
          type="text"
          placeholder="例如：完成今天的日报"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

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

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <div className="button-row form-button-row">
        <button className="button button-primary form-primary-button" type="submit">
          {isEditing ? '保存修改' : '新增任务'}
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
