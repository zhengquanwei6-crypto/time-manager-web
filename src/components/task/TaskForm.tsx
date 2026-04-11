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
  const hintId = `${formId}-hint`;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }

    if (event.key === 'Escape' && isEditing && onCancel) {
      onCancel();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage('先写下要做什么。');
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
          任务标题
        </label>
        <input
          id={titleId}
          className="form-input"
          type="text"
          placeholder="例如：整理今天的项目回顾"
          required
          autoFocus
          aria-describedby={hintId}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={handleKeyDown}
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
          aria-describedby={hintId}
          value={deadlineInput}
          onChange={(event) => setDeadlineInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <p id={hintId} className="form-hint">
        快捷键：`Ctrl/Cmd + Enter` 提交，`Esc` 取消编辑。
      </p>

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
