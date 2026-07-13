export type ActivityStatus = "not_started" | "in_progress" | "completed" | "skipped_after_error";

export interface StudentIdentity {
  name: string;
  registration?: string;
  className?: string;
}

export interface InteractionEvent {
  type: "slider" | "number" | "toggle" | "drag" | "hint" | "restart" | "answer" | "navigation";
  at: string;
  payload?: Record<string, string | number | boolean>;
}

export interface QuestionAttempt {
  submittedAt: string;
  value: string;
  correct: boolean;
  responseTimeMs: number;
}

export interface ActivityRecord {
  activityId: string;
  version: string;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  status: ActivityStatus;
  restarts: number;
  hintsUsed: number;
  continuedAfterError: boolean;
  interactions: InteractionEvent[];
  questions: QuestionAttempt[];
  finalState: Record<string, number | string | boolean>;
}

export interface CompetencyScore {
  competency: string;
  earned: number;
  possible: number;
}

export interface SessionSummary {
  score: number;
  correct: number;
  errors: number;
  hints: number;
  restarts: number;
  completed: number;
  competencies: CompetencyScore[];
}

export interface LabSession {
  schemaVersion: "1.0";
  sessionId: string;
  activitySetVersion: "cap4-1.0";
  student: StudentIdentity;
  startedAt: string;
  finishedAt?: string;
  totalDurationMs?: number;
  browser: { userAgent: string; platform: string };
  activities: ActivityRecord[];
  summary?: SessionSummary;
  locked: boolean;
  demonstration?: boolean;
}

export type QuestionKind = "choice" | "numeric" | "boolean";

export interface QuestionDefinition {
  prompt: string;
  kind: QuestionKind;
  options?: string[];
  expected: string | number | boolean;
  explanation: string;
  hint: string;
  absoluteTolerance?: number;
  relativeTolerance?: number;
}

export interface ActivityDefinition {
  id: string;
  version: "1.0";
  title: string;
  concept: string;
  shortIntroduction: string;
  detailedIntroduction: string;
  competencies: string[];
  visualizationType: string;
  initialState: Record<string, number | string | boolean>;
  minimumInteractions: number;
  formula: string;
  question: QuestionDefinition;
}

export interface EncryptedLabFileHeader {
  magic: "RGLAB";
  fileFormatVersion: 1;
  schemaVersion: string;
  algorithm: "RSA-OAEP-256+A256GCM";
  createdAt: string;
  keyId: string;
  ivLength: number;
  encryptedKeyLength: number;
  ciphertextLength: number;
}

export interface ProtectedPrivateKeyFile {
  magic: "RGLABKEY";
  version: 1;
  keyId: string;
  salt: string;
  iv: string;
  iterations: number;
  ciphertext: string;
}
