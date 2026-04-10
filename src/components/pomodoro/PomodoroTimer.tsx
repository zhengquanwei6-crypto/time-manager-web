import { formatTime } from '../../utils/date';
import type { PomodoroStatus } from '../../types/pomodoro';
import { formatPomodoroStatus } from '../../utils/pomodoro';

interface PomodoroTimerProps {
  remainingSeconds: number;
  status: PomodoroStatus;
}

export function PomodoroTimer({
  remainingSeconds,
  status,
}: PomodoroTimerProps) {
  return (
    <section className="pomodoro-card">
      <p className="pomodoro-label">当前倒计时</p>
      <p className="pomodoro-time">{formatTime(remainingSeconds)}</p>
      <p className="pomodoro-status">状态：{formatPomodoroStatus(status)}</p>
    </section>
  );
}
