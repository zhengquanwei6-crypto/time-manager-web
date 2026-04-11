import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/common/AppShell';
import { PageLoading } from '../components/common/PageLoading';
import { ScrollToTop } from '../components/common/ScrollToTop';
import { DashboardPage } from '../pages/DashboardPage';

const TodayPage = lazy(async () => ({
  default: (await import('../pages/TodayPage')).TodayPage,
}));

const WeekPage = lazy(async () => ({
  default: (await import('../pages/WeekPage')).WeekPage,
}));

const PomodoroPage = lazy(async () => ({
  default: (await import('../pages/PomodoroPage')).PomodoroPage,
}));

const StatsPage = lazy(async () => ({
  default: (await import('../pages/StatsPage')).StatsPage,
}));

const NotFoundPage = lazy(async () => ({
  default: (await import('../pages/NotFoundPage')).NotFoundPage,
}));

function RoutePrefetcher() {
  useEffect(() => {
    const preloadTimer = window.setTimeout(() => {
      void import('../pages/TodayPage');
      void import('../pages/WeekPage');
      void import('../pages/PomodoroPage');
      void import('../pages/StatsPage');
      void import('../pages/NotFoundPage');
    }, 1200);

    return () => {
      window.clearTimeout(preloadTimer);
    };
  }, []);

  return null;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RoutePrefetcher />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="today" element={<TodayPage />} />
            <Route path="week" element={<WeekPage />} />
            <Route path="pomodoro" element={<PomodoroPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
