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
}
