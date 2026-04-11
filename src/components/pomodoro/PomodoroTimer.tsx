import { formatTime } from '../../utils/date';
import type { PomodoroStatus } from '../../types/pomodoro';
import { formatPomodoroStatus } from '../../utils/pomodoro';

interface PomodoroTimerProps {
  remainingSeconds: number;
  durationSeconds: number;
  status: PomodoroStatus;
}

const RING_SIZE = 180;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function PomodoroTimer({
  remainingSeconds,
  durationSeconds,
  status,
}: PomodoroTimerProps) {
  const progress =
    durationSeconds > 0 ? 1 - remainingSeconds / durationSeconds : 0;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <section className="pomodoro-card">
      <p className="pomodoro-label">当前倒计时</p>
      <div className="pomodoro-ring-wrapper">
        <svg
          className="pomodoro-ring"
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        >
          <circle
            className="pomodoro-ring-bg"
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            strokeWidth={RING_STROKE}
          />
          <circle
            className="pomodoro-ring-progress"
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            strokeWidth={RING_STROKE}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </svg>
        <p className="pomodoro-time" aria-live="polite">
          {formatTime(remainingSeconds)}
        </p>
      </div>
      <p className="pomodoro-status">状态：{formatPomodoroStatus(status)}</p>
    </section>
  );
}
