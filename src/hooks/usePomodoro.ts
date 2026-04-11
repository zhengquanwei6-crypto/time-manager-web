import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import type { PomodoroState } from '../types/pomodoro';
import {
  loadPomodoroFromStorage,
  savePomodoroToStorage,
} from '../utils/storage';

const STORAGE_DEBOUNCE_MS = 300;

const DEFAULT_DURATION_SECONDS = 25 * 60;

function notifyPomodoroFinished(): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('番茄钟完成', {
      body: '休息一下吧！',
      icon: '/favicon.svg',
    });
  }

  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
    oscillator.stop(audioContext.currentTime + 0.8);
    window.setTimeout(() => {
      void audioContext.close();
    }, 900);
  } catch {
    // Audio not supported, silently ignore
  }
}

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
  setDuration: (minutes: number) => void;
}

export function usePomodoro(): UsePomodoroResult {
  const [pomodoro, setPomodoro] = useState<PomodoroState>(() => {
    const storedState = loadPomodoroFromStorage();

    if (!storedState) {
      return DEFAULT_POMODORO_STATE;
    }

    return restorePomodoroState(storedState);
  });

  const saveTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      savePomodoroToStorage(pomodoro);
    }, STORAGE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(saveTimerRef.current);
    };
  }, [pomodoro]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.clearTimeout(saveTimerRef.current);
      savePomodoroToStorage(pomodoro);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
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
          notifyPomodoroFinished();

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

  const startTimer = useCallback(() => {
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
  }, []);

  const pauseTimer = useCallback(() => {
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
  }, []);

  const resetTimer = useCallback(() => {
    setPomodoro(DEFAULT_POMODORO_STATE);
  }, []);

  const setDuration = useCallback((minutes: number) => {
    const seconds = minutes * 60;

    setPomodoro((currentState) => {
      if (currentState.status === 'running') {
        return currentState;
      }

      return {
        ...currentState,
        durationSeconds: seconds,
        remainingSeconds: seconds,
        status: 'idle',
        endTime: null,
      };
    });
  }, []);

  return {
    pomodoro,
    startTimer,
    pauseTimer,
    resetTimer,
    setDuration,
  };
}
