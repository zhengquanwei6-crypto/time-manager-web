/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useMemo } from 'react';
import { usePomodoro } from '../hooks/usePomodoro';
import type { UsePomodoroResult } from '../hooks/usePomodoro';

const PomodoroContext = createContext<UsePomodoroResult | null>(null);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const { pomodoro, startTimer, pauseTimer, resetTimer, setDuration } =
    usePomodoro();

  const value = useMemo<UsePomodoroResult>(
    () => ({ pomodoro, startTimer, pauseTimer, resetTimer, setDuration }),
    [pomodoro, startTimer, pauseTimer, resetTimer, setDuration],
  );

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoroContext(): UsePomodoroResult {
  const context = useContext(PomodoroContext);

  if (!context) {
    throw new Error(
      'usePomodoroContext must be used within a PomodoroProvider',
    );
  }

  return context;
}
