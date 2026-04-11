import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { usePomodoroContext } from '../../contexts/PomodoroContext';
import { useTasksContext } from '../../contexts/TasksContext';
import { formatPomodoroStatus } from '../../utils/pomodoro';

const navItems = [
  {
    to: '/',
    label: '仪表盘',
    description: '总览任务、统计卡片和番茄钟入口。',
    end: true,
  },
  {
    to: '/today',
    label: '今日任务',
    description: '聚焦今天到期或已经逾期的任务。',
  },
  {
    to: '/week',
    label: '本周视图',
    description: '按日期查看本周的任务分组。',
  },
  {
    to: '/pomodoro',
    label: '番茄钟',
    description: '开始专注计时，并调整提醒方式。',
  },
  {
    to: '/stats',
    label: '统计',
    description: '查看当前任务完成情况和整体趋势。',
  },
];

export function AppShell() {
  const { tasks } = useTasksContext();
  const { pomodoro } = usePomodoroContext();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const pendingTaskCount = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks],
  );

  const currentNavItem = useMemo(
    () =>
      navItems.find((item) =>
        item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to),
      ),
    [location.pathname],
  );

  const currentPageLabel = currentNavItem?.label ?? '仪表盘';
  const currentPageDescription =
    currentNavItem?.description ?? '管理任务、计时和完成统计。';

  useEffect(() => {
    document.title = `${currentPageLabel} | 时间管理 Web`;

    const descriptionMeta = document.querySelector('meta[name="description"]');

    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', currentPageDescription);
    }
  }, [currentPageDescription, currentPageLabel]);

  useEffect(() => {
    if (!isDrawerOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isDrawerOpen]);

  const renderNav = (className: string, ariaLabel: string) => (
    <nav className={className} aria-label={ariaLabel}>
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
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>

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
            aria-controls="mobile-navigation"
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

      <aside
        id="mobile-navigation"
        className={`mobile-drawer ${isDrawerOpen ? 'mobile-drawer-open' : ''}`}
        aria-label="移动端导航菜单"
      >
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

        {renderNav('mobile-nav-list', '移动端主导航')}

        <div className="mobile-drawer-summary">
          <div className="mobile-summary-card">
            <span className="summary-label">未完成任务</span>
            <strong className="summary-value">{pendingTaskCount}</strong>
          </div>
          <div className="mobile-summary-card">
            <span className="summary-label">番茄钟状态</span>
            <strong className="summary-value">
              {formatPomodoroStatus(pomodoro.status)}
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

        {renderNav('nav-list', '桌面端主导航')}

        <div className="sidebar-summary">
          <div className="summary-card">
            <span className="summary-label">未完成任务</span>
            <strong className="summary-value">{pendingTaskCount}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">番茄钟状态</span>
            <strong className="summary-value">
              {formatPomodoroStatus(pomodoro.status)}
            </strong>
          </div>
        </div>
      </aside>

      <main id="main-content" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
