export type DashboardClientRow = {
  id: string | number;
  name?: string;
  clientId?: string | number;
  clientName?: string;
  planName?: string;
  activePlan?: string;
  compliance?: number;
  adherencePercentage?: number;
  goal?: string;
  objective?: string;
  lastCheckin?: string;
  phase?: string;
  nextSessionAt?: string;
};

export type StoredMessage = {
  id: string | number;
  sender: string;
  status?: string;
  clientName?: string;
  text?: string;
  clientId?: string | number;
};

export type ChartPoint = {
  session: number;
  date: string;
  startedAt: string;
  volume: number;
};

export type NormalizedExercise = {
  id?: string | number;
  name?: string;
  notes?: string;
  muscles?: string[];
  sets?: { reps?: string; load?: string }[];
};

export type NormalizedPlan = {
  name?: string;
  notes?: string;
  phase?: string;
  blocks?: { exercises?: NormalizedExercise[] }[];
  exercises?: NormalizedExercise[];
};
