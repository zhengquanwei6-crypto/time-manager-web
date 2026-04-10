import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/common/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { PomodoroPage } from '../pages/PomodoroPage';
import { StatsPage } from '../pages/StatsPage';
import { TodayPage } from '../pages/TodayPage';
import { WeekPage } from '../pages/WeekPage';
import type { UsePomodoroResult } from '../hooks/usePomodoro';
import type { UseTasksResult } from '../hooks/useTasks';

interface AppRouterProps {
  tasksApi: UseTasksResult;
  pomodoroApi: UsePomodoroResult;
}

export function AppRouter({ tasksApi, pomodoroApi }: AppRouterProps) {
  const pendingTaskCount = tasksApi.tasks.filter((task) => !task.completed).length;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout
              pendingTaskCount={pendingTaskCount}
              pomodoroStatus={pomodoroApi.pomodoro.status}
            />
          }
        >
          <Route
            index
            element={<DashboardPage tasksApi={tasksApi} pomodoroApi={pomodoroApi} />}
          />
          <Route path="today" element={<TodayPage tasksApi={tasksApi} />} />
          <Route path="week" element={<WeekPage tasksApi={tasksApi} />} />
          <Route
            path="pomodoro"
            element={<PomodoroPage pomodoroApi={pomodoroApi} />}
          />
          <Route path="stats" element={<StatsPage tasksApi={tasksApi} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
