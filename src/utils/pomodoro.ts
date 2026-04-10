import type { PomodoroState, PomodoroStatus } from '../types/pomodoro';

const pomodoroStatusTextMap: Record<PomodoroStatus, string> = {
  idle: '未开始',
  running: '进行中',
  paused: '已暂停',
  finished: '已结束',
};

export function formatPomodoroStatus(status: PomodoroStatus): string {
  return pomodoroStatusTextMap[status];
}

export function isPomodoroState(value: unknown): value is PomodoroState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybePomodoro = value as PomodoroState;
  const validStatus: PomodoroStatus[] = ['idle', 'running', 'paused', 'finished'];

  return (
    typeof maybePomodoro.durationSeconds === 'number' &&
    maybePomodoro.durationSeconds > 0 &&
    typeof maybePomodoro.remainingSeconds === 'number' &&
    maybePomodoro.remainingSeconds >= 0 &&
    validStatus.includes(maybePomodoro.status) &&
    (typeof maybePomodoro.endTime === 'string' || maybePomodoro.endTime === null)
  );
}
