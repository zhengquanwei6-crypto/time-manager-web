import { formatTime } from '../../utils/date';
import type { PomodoroStatus } from '../../types/pomodoro';

interface PomodoroTimerProps {
  remainingSeconds: number;
  status: PomodoroStatus;
}

const statusTextMap: Record<PomodoroStatus, string> = {
  idle: '未开始',
  running: '进行中',
  paused: '已暂停',
  finished: '已结束',
};

export function PomodoroTimer({
  remainingSeconds,
  status,
}: PomodoroTimerProps) {
  return (
    <section className="pomodoro-card">
      <p className="pomodoro-label">当前倒计时</p>
      <p className="pomodoro-time">{formatTime(remainingSeconds)}</p>
      <p className="pomodoro-status">状态：{statusTextMap[status]}</p>
    </section>
  );
}
