import type { PomodoroStatus } from '../../types/pomodoro';

interface TimerControlsProps {
  status: PomodoroStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  return (
    <div className="button-row timer-controls">
      <button
        className="button button-primary timer-button"
        type="button"
        onClick={onStart}
        disabled={status === 'running'}
      >
        开始
      </button>
      <button
        className="button button-secondary timer-button"
        type="button"
        onClick={onPause}
        disabled={status !== 'running'}
      >
        暂停
      </button>
      <button
        className="button button-secondary timer-button"
        type="button"
        onClick={onReset}
      >
        重置
      </button>
    </div>
  );
}
