import { PomodoroProvider } from './contexts/PomodoroContext';
import { TasksProvider } from './contexts/TasksContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppRouter } from './router';

function App() {
  return (
    <ToastProvider>
      <TasksProvider>
        <PomodoroProvider>
          <AppRouter />
        </PomodoroProvider>
      </TasksProvider>
    </ToastProvider>
  );
}

export default App;
