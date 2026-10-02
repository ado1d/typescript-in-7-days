"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny module-level store so deep components (lesson sections) can open
 * the AI assistant with a prefilled question, without prop drilling.
 */

export interface AssistantSeed {
  /** unique per request */
  id: number;
  text: string;
}

interface AssistantState {
  open: boolean;
  seed: AssistantSeed | null;
}

let state: AssistantState = { open: false, seed: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AssistantState {
  return state;
}

const serverSnapshot: AssistantState = { open: false, seed: null };

let seedCounter = 0;

export function openAssistant(seedText?: string): void {
  state = {
    open: true,
    seed: seedText ? { id: ++seedCounter, text: seedText } : null,
  };
  emit();
}

export function closeAssistant(): void {
  state = { open: false, seed: null };
  emit();
}

/** Call after the seed has been consumed so it does not re-fire. */
export function clearSeed(): void {
  if (!state.seed) return;
  state = { ...state, seed: null };
  emit();
}

export function useAssistant(): AssistantState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getServerSnapshot(): AssistantState {
  return serverSnapshot;
}
