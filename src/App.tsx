import { usePomodoro } from './hooks/usePomodoro';
import { useTasks } from './hooks/useTasks';
import { AppRouter } from './router';

function App() {
  const tasksApi = useTasks();
  const pomodoroApi = usePomodoro();

  return <AppRouter tasksApi={tasksApi} pomodoroApi={pomodoroApi} />;
}

export default App;
