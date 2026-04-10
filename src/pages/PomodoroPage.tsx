import { PageHeader } from '../components/common/PageHeader';
import { PomodoroTimer } from '../components/pomodoro/PomodoroTimer';
import { TimerControls } from '../components/pomodoro/TimerControls';
import type { UsePomodoroResult } from '../hooks/usePomodoro';

interface PomodoroPageProps {
  pomodoroApi: UsePomodoroResult;
}

export function PomodoroPage({ pomodoroApi }: PomodoroPageProps) {
  const { pomodoro, startTimer, pauseTimer, resetTimer } = pomodoroApi;

  return (
    <div className="page-stack">
      <PageHeader
        title="番茄钟页"
        description="这里提供可用的基础倒计时界面，并支持本地保存与刷新后恢复。"
      />

      <section className="two-column-grid">
        <div className="panel">
          <PomodoroTimer
            remainingSeconds={pomodoro.remainingSeconds}
            status={pomodoro.status}
          />
          <TimerControls
            status={pomodoro.status}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
          />
        </div>

        <div className="panel">
          <h3 className="section-title">当前实现说明</h3>
          <div className="info-list">
            <div className="info-row">
              <span>默认时长</span>
              <strong>25 分钟</strong>
            </div>
            <div className="info-row">
              <span>本地保存</span>
              <strong>已接入 localStorage</strong>
            </div>
            <div className="info-row">
              <span>当前阶段</span>
              <strong>可用的 MVP 版本</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
