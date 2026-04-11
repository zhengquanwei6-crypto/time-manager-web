import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { usePomodoroContext } from '../../contexts/PomodoroContext';
import { useTasksContext } from '../../contexts/TasksContext';
import { formatPomodoroStatus } from '../../utils/pomodoro';

const navItems = [
  { to: '/', label: '仪表盘', end: true },
  { to: '/today', label: '今日任务' },
  { to: '/week', label: '本周视图' },
  { to: '/pomodoro', label: '番茄钟' },
  { to: '/stats', label: '统计' },
];

export function AppLayout() {
  const { tasks } = useTasksContext();
  const { pomodoro } = usePomodoroContext();
  const pendingTaskCount = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks],
  );
  const pomodoroStatus = pomodoro.status;
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const currentPageLabel = useMemo(() => {
    const currentItem = navItems.find((item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to),
    );

    return currentItem?.label ?? '仪表盘';
  }, [location.pathname]);

  const renderNav = (className: string) => (
    <nav className={className}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setIsDrawerOpen(false)}
          className={({ isActive }) =>
            isActive ? 'nav-link nav-link-active' : 'nav-link'
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="app-shell">
      <header className="mobile-topbar">
        <div className="mobile-topbar-main">
          <div>
            <p className="mobile-topbar-kicker">时间管理 Web</p>
            <strong className="mobile-topbar-title">{currentPageLabel}</strong>
          </div>
          <button
            className="mobile-menu-button"
            type="button"
            aria-label="打开导航菜单"
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen(true)}
          >
            菜单
          </button>
        </div>
      </header>

      <div
        className={`mobile-drawer-backdrop ${
          isDrawerOpen ? 'mobile-drawer-backdrop-open' : ''
        }`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside className={`mobile-drawer ${isDrawerOpen ? 'mobile-drawer-open' : ''}`}>
        <div className="mobile-drawer-header">
          <div>
            <p className="mobile-topbar-kicker">导航菜单</p>
            <strong className="mobile-topbar-title">快速切换页面</strong>
          </div>
          <button
            className="mobile-menu-button"
            type="button"
            aria-label="关闭导航菜单"
            onClick={() => setIsDrawerOpen(false)}
          >
            关闭
          </button>
        </div>

        {renderNav('mobile-nav-list')}

        <div className="mobile-drawer-summary">
          <div className="mobile-summary-card">
            <span className="summary-label">未完成任务</span>
            <strong className="summary-value">{pendingTaskCount}</strong>
          </div>
          <div className="mobile-summary-card">
            <span className="summary-label">番茄钟状态</span>
            <strong className="summary-value">
              {formatPomodoroStatus(pomodoroStatus)}
            </strong>
          </div>
        </div>
      </aside>

      <aside className="app-sidebar">
        <div className="brand-block">
          <p className="brand-kicker">时间管理 Web</p>
          <h1 className="brand-title">个人时间管理台</h1>
          <p className="brand-description">
            管理任务、查看今日和本周安排、使用番茄钟专注，并追踪完成情况。
          </p>
        </div>

        {renderNav('nav-list')}

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
