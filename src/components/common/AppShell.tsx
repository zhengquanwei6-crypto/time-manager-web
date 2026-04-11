import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { usePomodoroContext } from '../../contexts/PomodoroContext';
import { useTasksContext } from '../../contexts/TasksContext';
import { formatPomodoroStatus } from '../../utils/pomodoro';

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'time-manager.theme';

const navItems = [
  {
    to: '/',
    label: '仪表盘',
    description: '查看任务总览、番茄钟状态和整体进度。',
    end: true,
  },
  {
    to: '/today',
    label: '今日任务',
    description: '聚焦今天要处理的任务，快速决定下一步。',
  },
  {
    to: '/week',
    label: '本周视图',
    description: '按日期查看本周任务安排。',
  },
  {
    to: '/pomodoro',
    label: '番茄钟',
    description: '开始专注计时并跟踪当前状态。',
  },
  {
    to: '/stats',
    label: '统计',
    description: '查看完成情况和今日进展。',
  },
];

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function AppShell() {
  const { tasks } = useTasksContext();
  const { pomodoro } = usePomodoroContext();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

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
    currentNavItem?.description ?? '管理任务、专注时间和完成进度。';

  useEffect(() => {
    document.title = `${currentPageLabel} | 时间管理 Web`;

    const descriptionMeta = document.querySelector('meta[name="description"]');

    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', currentPageDescription);
    }
  }, [currentPageDescription, currentPageLabel]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

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

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

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

  const themeButtonLabel = theme === 'light' ? '切换深色' : '切换浅色';

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

          <div className="mobile-topbar-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={themeButtonLabel}
            >
              {theme === 'light' ? '深色' : '浅色'}
            </button>
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
        aria-label="移动端主导航"
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
            <span className="summary-label">待处理任务</span>
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
          <h1 className="brand-title">更清晰地安排今天</h1>
          <p className="brand-description">
            把任务、时间安排和专注节奏放到同一个工作台里，减少来回切页和临时记忆负担。
          </p>
        </div>

        <button
          className="theme-toggle theme-toggle-sidebar"
          type="button"
          onClick={toggleTheme}
          aria-label={themeButtonLabel}
        >
          {theme === 'light' ? '切换深色模式' : '切换浅色模式'}
        </button>

        {renderNav('nav-list', '桌面端主导航')}

        <div className="sidebar-summary">
          <div className="summary-card">
            <span className="summary-label">待处理任务</span>
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
