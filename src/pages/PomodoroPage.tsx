import { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { PomodoroTimer } from '../components/pomodoro/PomodoroTimer';
import { TimerControls } from '../components/pomodoro/TimerControls';
import { usePomodoroContext } from '../contexts/PomodoroContext';

const DURATION_OPTIONS = [15, 25, 45, 60];

export function PomodoroPage() {
  const { pomodoro, startTimer, pauseTimer, resetTimer, setDuration } =
    usePomodoroContext();
  const [notificationStatus, setNotificationStatus] = useState<string>(() =>
    'Notification' in window ? Notification.permission : 'unsupported',
  );

  const isIdle = pomodoro.status === 'idle';
  const currentMinutes = Math.round(pomodoro.durationSeconds / 60);
  const canRequestNotification = notificationStatus === 'default';

  const handleEnableNotification = () => {
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported');
      return;
    }

    void Notification.requestPermission().then((permission) => {
      setNotificationStatus(permission);
    });
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="番茄钟"
        description="开始一段专注倒计时。结束后会通过声音和浏览器通知提醒你。"
      />

      <section className="two-column-grid">
        <div className="panel">
          <PomodoroTimer
            remainingSeconds={pomodoro.remainingSeconds}
            durationSeconds={pomodoro.durationSeconds}
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
          <h3 className="section-title">时长设置</h3>
          <p className="section-description">
            {isIdle
              ? '选择你想要的专注时长，然后点击开始。'
              : '计时进行中不能切换时长，请先重置。'}
          </p>
          <div className="duration-options">
            {DURATION_OPTIONS.map((minutes) => (
              <button
                key={minutes}
                className={`button duration-button ${
                  currentMinutes === minutes ? 'duration-button-active' : 'button-secondary'
                }`}
                type="button"
                disabled={!isIdle}
                onClick={() => setDuration(minutes)}
              >
                {minutes} 分钟
              </button>
            ))}
          </div>

          <h3 className="section-title" style={{ marginTop: 24 }}>
            提醒设置
          </h3>
          <div className="info-list">
            <div className="info-row">
              <span>声音提醒</span>
              <strong>已启用</strong>
            </div>
            <div className="info-row">
              <span>浏览器通知</span>
              <strong>
                {notificationStatus === 'granted'
                  ? '已授权'
                  : notificationStatus === 'denied'
                    ? '已拒绝'
                    : notificationStatus === 'unsupported'
                      ? '不支持'
                      : '未授权'}
              </strong>
            </div>
          </div>
          {canRequestNotification ? (
            <button
              className="button button-primary inline-link-button"
              type="button"
              onClick={handleEnableNotification}
            >
              授权浏览器通知
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
