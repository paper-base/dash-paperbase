export type FraudCheckApiOk = {
  cached?: boolean;
  status?: string;
  log_id?: number | null;
  response?: unknown;
};

export type FraudCheckState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; data: FraudCheckApiOk }
  | { kind: "error"; message: string; status?: number };

