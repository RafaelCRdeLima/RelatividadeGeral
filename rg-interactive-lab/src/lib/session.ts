import { activities } from "../data/activities";
import type { ActivityRecord, LabSession, SessionSummary, StudentIdentity } from "../types";

export function newActivityRecord(activityId: string): ActivityRecord {
  return {
    activityId, version: "1.0", startedAt: new Date().toISOString(), status: "not_started",
    restarts: 0, hintsUsed: 0, continuedAfterError: false, interactions: [], questions: [], finalState: {},
  };
}

export function createSession(student: StudentIdentity, demonstration = false): LabSession {
  return {
    schemaVersion: "1.0", sessionId: crypto.randomUUID(), activitySetVersion: "cap4-1.0", student,
    startedAt: new Date().toISOString(), browser: { userAgent: navigator.userAgent, platform: navigator.platform },
    activities: activities.map(activity => newActivityRecord(activity.id)), locked: false, demonstration,
  };
}

export function summarize(session: LabSession): SessionSummary {
  const attempts = session.activities.flatMap(record => record.questions);
  const correct = session.activities.filter(record => record.status === "completed").length;
  const errors = attempts.filter(attempt => !attempt.correct).length;
  const competencies = new Map<string, { earned: number; possible: number }>();
  activities.forEach((definition, index) => {
    const mastered = session.activities[index]?.status === "completed";
    definition.competencies.forEach(competency => {
      const score = competencies.get(competency) ?? { earned: 0, possible: 0 };
      score.possible += 1;
      if (mastered) score.earned += 1;
      competencies.set(competency, score);
    });
  });
  return {
    score: Math.round(100 * correct / activities.length), correct, errors,
    hints: session.activities.reduce((total, record) => total + record.hintsUsed, 0),
    restarts: session.activities.reduce((total, record) => total + record.restarts, 0),
    completed: session.activities.filter(record => record.status === "completed" || record.status === "skipped_after_error").length,
    competencies: [...competencies].map(([competency, score]) => ({ competency, ...score })),
  };
}

export function demonstrationSession(completed = false): LabSession {
  const session = createSession({ name: "Ada Lovelace (demonstração)", registration: "DEMO-001", className: "RG 2026" }, true);
  const limit = completed ? activities.length : 5;
  for (let index = 0; index < limit; index += 1) {
    const record = session.activities[index];
    record.status = index === 3 ? "skipped_after_error" : "completed";
    record.finishedAt = new Date(Date.now() - (limit - index) * 60000).toISOString();
    record.durationMs = 180000 + index * 11000;
    record.hintsUsed = index === 2 ? 1 : 0;
    record.restarts = index === 1 ? 1 : 0;
    record.continuedAfterError = index === 3;
    record.questions.push({ submittedAt: record.finishedAt, value: "resposta demonstrativa", correct: index !== 3, responseTimeMs: 24000 });
  }
  if (!completed) session.activities[limit].status = "in_progress";
  if (completed) {
    session.finishedAt = new Date().toISOString();
    session.totalDurationMs = Date.now() - new Date(session.startedAt).getTime();
    session.locked = true;
    session.summary = summarize(session);
  }
  return session;
}
