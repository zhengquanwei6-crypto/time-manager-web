import { NavLink, Outlet } from 'react-router-dom';
import type { PomodoroStatus } from '../../types/pomodoro';
import { formatPomodoroStatus } from '../../utils/pomodoro';

interface AppLayoutProps {
  pendingTaskCount: number;
  pomodoroStatus: PomodoroStatus;
}

const navItems = [
  { to: '/', label: '任务总览', end: true },
  { to: '/today', label: '今日视图' },
  { to: '/week', label: '本周视图' },
  { to: '/pomodoro', label: '番茄钟' },
  { to: '/stats', label: '统计' },
];

export function AppLayout({
  pendingTaskCount,
  pomodoroStatus,
}: AppLayoutProps) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <p className="brand-kicker">时间管理 Web</p>
          <h1 className="brand-title">个人时间管理台</h1>
          <p className="brand-description">
            管理任务、查看今日和本周安排、使用番茄钟专注，并追踪完成情况。
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
              {formatPomodoroStatus(pomodoroStatus)}
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
