import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import type { PomodoroState } from '../types/pomodoro';
import {
  loadPomodoroFromStorage,
  savePomodoroToStorage,
} from '../utils/storage';

const DEFAULT_DURATION_SECONDS = 25 * 60;

const DEFAULT_POMODORO_STATE: PomodoroState = {
  durationSeconds: DEFAULT_DURATION_SECONDS,
  remainingSeconds: DEFAULT_DURATION_SECONDS,
  status: 'idle',
  endTime: null,
};

function restorePomodoroState(state: PomodoroState): PomodoroState {
  if (state.status !== 'running' || !state.endTime) {
    return state;
  }

  const remainingSeconds = Math.max(
    dayjs(state.endTime).diff(dayjs(), 'second'),
    0,
  );

  if (remainingSeconds === 0) {
    return {
      ...state,
      remainingSeconds: 0,
      status: 'finished',
      endTime: null,
    };
  }

  return {
    ...state,
    remainingSeconds,
  };
}

export interface UsePomodoroResult {
  pomodoro: PomodoroState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

export function usePomodoro(): UsePomodoroResult {
  const [pomodoro, setPomodoro] = useState<PomodoroState>(() => {
    const storedState = loadPomodoroFromStorage();

    if (!storedState) {
      return DEFAULT_POMODORO_STATE;
    }

    return restorePomodoroState(storedState);
  });

  useEffect(() => {
    savePomodoroToStorage(pomodoro);
  }, [pomodoro]);

  useEffect(() => {
    if (pomodoro.status !== 'running') {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setPomodoro((currentState) => {
        if (currentState.status !== 'running' || !currentState.endTime) {
          return currentState;
        }

        const remainingSeconds = Math.max(
          dayjs(currentState.endTime).diff(dayjs(), 'second'),
          0,
        );

        if (remainingSeconds === 0) {
          return {
            ...currentState,
            remainingSeconds: 0,
            status: 'finished',
            endTime: null,
          };
        }

        return {
          ...currentState,
          remainingSeconds,
        };
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [pomodoro.status]);

  const startTimer = () => {
    setPomodoro((currentState) => {
      if (currentState.status === 'running') {
        return currentState;
      }

      const remainingSeconds =
        currentState.status === 'finished'
          ? currentState.durationSeconds
          : currentState.remainingSeconds;

      return {
        ...currentState,
        remainingSeconds,
        status: 'running',
        endTime: dayjs().add(remainingSeconds, 'second').toISOString(),
      };
    });
  };

  const pauseTimer = () => {
    setPomodoro((currentState) => {
      if (currentState.status !== 'running' || !currentState.endTime) {
        return currentState;
      }

      const remainingSeconds = Math.max(
        dayjs(currentState.endTime).diff(dayjs(), 'second'),
        0,
      );

      return {
        ...currentState,
        remainingSeconds,
        status: 'paused',
        endTime: null,
      };
    });
  };

  const resetTimer = () => {
    setPomodoro(DEFAULT_POMODORO_STATE);
  };

  return {
    pomodoro,
    startTimer,
    pauseTimer,
    resetTimer,
  };
}
