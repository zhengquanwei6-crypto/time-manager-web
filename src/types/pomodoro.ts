export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface PomodoroState {
  durationSeconds: number;
  remainingSeconds: number;
  status: PomodoroStatus;
  endTime: string | null;
}
