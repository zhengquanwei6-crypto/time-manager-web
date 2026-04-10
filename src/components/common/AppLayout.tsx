import { NavLink, Outlet } from 'react-router-dom';
import type { PomodoroStatus } from '../../types/pomodoro';

interface AppLayoutProps {
  pendingTaskCount: number;
  pomodoroStatus: PomodoroStatus;
}

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/today', label: '今日视图' },
  { to: '/week', label: '本周视图' },
  { to: '/pomodoro', label: '番茄钟' },
  { to: '/stats', label: '统计' },
];

const statusTextMap: Record<PomodoroStatus, string> = {
  idle: '未开始',
  running: '进行中',
  paused: '已暂停',
  finished: '已结束',
};

export function AppLayout({
  pendingTaskCount,
  pomodoroStatus,
}: AppLayoutProps) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <p className="brand-kicker">时间管理 Web</p>
          <h1 className="brand-title">第一版 MVP 骨架</h1>
          <p className="brand-description">
            先把任务、视图、番茄钟和统计页面跑起来，再逐步补充细节。
          </p>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-summary">
          <div className="summary-card">
            <span className="summary-label">未完成任务</span>
            <strong className="summary-value">{pendingTaskCount}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">番茄钟状态</span>
            <strong className="summary-value">
              {statusTextMap[pomodoroStatus]}
            </strong>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
