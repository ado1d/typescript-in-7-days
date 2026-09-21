"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export interface QuizScore {
  correct: number;
  total: number;
}

export interface ProgressState {
  completedDays: number[];
  quizScores: Record<string, QuizScore>;
  /** ISO date of first visit */
  startedAt: string | null;
  lastDay: number | null;
  lastView: string | null;
}

const STORAGE_KEY = "ts7-progress-v1";

const defaultProgress: ProgressState = {
  completedDays: [],
  quizScores: {},
  startedAt: null,
  lastDay: null,
  lastView: null,
};

function loadProgress(): ProgressState {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      completedDays: Array.isArray(parsed.completedDays) ? parsed.completedDays : [],
      quizScores:
        parsed.quizScores && typeof parsed.quizScores === "object" ? parsed.quizScores : {},
      startedAt: typeof parsed.startedAt === "string" ? parsed.startedAt : null,
      lastDay: typeof parsed.lastDay === "number" ? parsed.lastDay : null,
      lastView: typeof parsed.lastView === "string" ? parsed.lastView : null,
    };
  } catch {
    return defaultProgress;
  }
}

function saveProgress(progress: ProgressState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage unavailable — progress simply won't persist
  }
}

/* ---- module-level external store (hydration-safe) ---- */

interface Snapshot {
  progress: ProgressState;
  ready: boolean;
}

let snapshot: Snapshot = { progress: defaultProgress, ready: false };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setProgress(next: ProgressState) {
  saveProgress(next);
  snapshot = { progress: next, ready: true };
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Snapshot {
  return snapshot;
}

const serverSnapshot: Snapshot = { progress: defaultProgress, ready: false };

function getServerSnapshot(): Snapshot {
  return serverSnapshot;
}

let hydrated = false;

export function useProgress() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Sync with the external localStorage system once after mount
  useEffect(() => {
    if (hydrated) return;
    hydrated = true;
    const loaded = loadProgress();
    if (JSON.stringify(loaded) !== JSON.stringify(defaultProgress)) {
      saveProgress(loaded);
      snapshot = { progress: loaded, ready: true };
      emit();
    } else {
      snapshot = { ...snapshot, ready: true };
      emit();
    }
  }, []);

  const toggleDayComplete = useCallback((dayId: number) => {
    const prev = snapshot.progress;
    setProgress({
      ...prev,
      completedDays: prev.completedDays.includes(dayId)
        ? prev.completedDays.filter((d) => d !== dayId)
        : [...prev.completedDays, dayId].sort((a, b) => a - b),
    });
  }, []);

  const recordQuiz = useCallback((dayId: number, score: QuizScore) => {
    const prev = snapshot.progress;
    setProgress({
      ...prev,
      quizScores: { ...prev.quizScores, [String(dayId)]: score },
    });
  }, []);

  const trackVisit = useCallback((view: string, dayId?: number) => {
    const prev = snapshot.progress;
    setProgress({
      ...prev,
      startedAt: prev.startedAt ?? new Date().toISOString(),
      lastView: view,
      lastDay: dayId ?? prev.lastDay,
    });
  }, []);

  const resetAll = useCallback(() => {
    setProgress(defaultProgress);
  }, []);

  return {
    progress: state.progress,
    ready: state.ready,
    toggleDayComplete,
    recordQuiz,
    trackVisit,
    resetAll,
  };
}
