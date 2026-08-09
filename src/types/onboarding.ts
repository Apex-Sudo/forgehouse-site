export type OnboardingPhase = "extraction" | "calibration" | "ingestion" | "complete";

export interface OnboardingSession {
  id: string;
  mentorName: string;
  email: string;
  currentPhase: OnboardingPhase;
  extractionData: any;
  calibrationData: any;
  ingestionData: any;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  agentApproved?: boolean;
  agentApprovedAt?: string;
  /** 1 = legacy three-phase flow, 2 = the module program. */
  programVersion?: number;
  /** Aggregate coverage across modules (v2 only). */
  coverage?: Record<string, number>;
}
