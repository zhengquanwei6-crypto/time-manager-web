import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/common/AppLayout';
import { ScrollToTop } from '../components/common/ScrollToTop';
import { DashboardPage } from '../pages/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PomodoroPage } from '../pages/PomodoroPage';
import { StatsPage } from '../pages/StatsPage';
import { TodayPage } from '../pages/TodayPage';
import { WeekPage } from '../pages/WeekPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="today" element={<TodayPage />} />
          <Route path="week" element={<WeekPage />} />
          <Route path="pomodoro" element={<PomodoroPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
