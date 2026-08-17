import { create } from "zustand";
import { STORAGE_KEY } from "./config";
import { activities } from "./data/activities";
import { createSession, demonstrationSession, summarize } from "./lib/session";
import type { InteractionEvent, LabSession, StudentIdentity } from "./types";

type Screen = "welcome" | "activity" | "summary";

interface LabState {
  session: LabSession | null;
  screen: Screen;
  currentIndex: number;
  hasSavedSession: boolean;
  start: (student: StudentIdentity) => void;
  startDemo: () => void;
  resume: () => void;
  openActivity: (index: number) => void;
  recordInteraction: (event: InteractionEvent, finalState?: Record<string, number | string | boolean>) => void;
  submitAnswer: (value: string, correct: boolean, responseTimeMs: number) => void;
  requestHint: () => void;
  restartActivity: () => void;
  continueAfterError: () => void;
  next: () => void;
  finish: () => void;
  erase: () => void;
  goSummary: () => void;
}

function load(): LabSession | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as LabSession | null; }
  catch { return null; }
}

function save(session: LabSession | null): void {
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_KEY);
}

export const useLabStore = create<LabState>((set, get) => ({
  session: null, screen: "welcome", currentIndex: 0, hasSavedSession: Boolean(load()),
  start: student => {
    const session = createSession(student); save(session);
    set({ session, screen: "activity", currentIndex: 0, hasSavedSession: true });
    get().openActivity(0);
  },
  startDemo: () => { const session = demonstrationSession(false); save(session); set({ session, screen: "activity", currentIndex: 5, hasSavedSession: true }); },
  resume: () => {
    const session = load(); if (!session) return;
    const currentIndex = Math.max(0, session.activities.findIndex(record => record.status === "in_progress" || record.status === "not_started"));
    set({ session, currentIndex, screen: session.locked ? "summary" : "activity" });
    if (!session.locked) get().openActivity(currentIndex);
  },
  openActivity: index => set(state => {
    if (!state.session || state.session.locked || index < 0 || index >= activities.length) return state;
    // Sem pré-requisito: o aluno abre qualquer atividade, na ordem que
    // quiser, tenha ou não acertado as anteriores. O percurso continua
    // sendo registrado -- o que deixou de existir é a obrigação de
    // percorrê-lo em fila.
    const session = structuredClone(state.session);
    const record = session.activities[index];
    if (record.status === "not_started") { record.status = "in_progress"; record.startedAt = new Date().toISOString(); }
    save(session); return { session, currentIndex: index, screen: "activity" };
  }),
  recordInteraction: (event, finalState) => set(state => {
    if (!state.session || state.session.locked) return state;
    const session = structuredClone(state.session); const record = session.activities[state.currentIndex];
    const previous = record.interactions.at(-1);
    const throttled = (event.type === "slider" || event.type === "drag") && previous?.type === event.type && Date.now() - new Date(previous.at).getTime() < 250;
    if (throttled) record.interactions[record.interactions.length - 1] = event; else record.interactions.push(event);
    if (finalState) record.finalState = finalState;
    save(session); return { session };
  }),
  submitAnswer: (value, correct, responseTimeMs) => set(state => {
    if (!state.session || state.session.locked) return state;
    const session = structuredClone(state.session); const record = session.activities[state.currentIndex];
    record.questions.push({ submittedAt: new Date().toISOString(), value, correct, responseTimeMs });
    record.interactions.push({ type: "answer", at: new Date().toISOString(), payload: { correct, value } });
    if (correct) {
      record.status = "completed"; record.finishedAt = new Date().toISOString();
      record.durationMs = new Date(record.finishedAt).getTime() - new Date(record.startedAt).getTime();
    }
    save(session); return { session };
  }),
  requestHint: () => set(state => {
    if (!state.session) return state; const session = structuredClone(state.session); const record = session.activities[state.currentIndex];
    record.hintsUsed += 1; record.interactions.push({ type: "hint", at: new Date().toISOString() }); save(session); return { session };
  }),
  restartActivity: () => set(state => {
    if (!state.session) return state; const session = structuredClone(state.session); const record = session.activities[state.currentIndex];
    record.restarts += 1; record.interactions.push({ type: "restart", at: new Date().toISOString() }); record.finalState = {}; save(session); return { session };
  }),
  continueAfterError: () => set(state => {
    if (!state.session) return state; const session = structuredClone(state.session); const record = session.activities[state.currentIndex];
    record.status = "skipped_after_error"; record.continuedAfterError = true; record.finishedAt = new Date().toISOString();
    record.durationMs = new Date(record.finishedAt).getTime() - new Date(record.startedAt).getTime(); save(session); return { session };
  }),
  next: () => { const nextIndex = get().currentIndex + 1; if (nextIndex >= activities.length) get().finish(); else get().openActivity(nextIndex); },
  finish: () => set(state => {
    if (!state.session) return state; const session = structuredClone(state.session); session.finishedAt = new Date().toISOString();
    session.totalDurationMs = new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime(); session.summary = summarize(session); session.locked = true;
    save(session); return { session, screen: "summary" };
  }),
  erase: () => { save(null); set({ session: null, screen: "welcome", currentIndex: 0, hasSavedSession: false }); },
  goSummary: () => set({ screen: "summary" }),
}));
