export type Severity = "GREEN" | "AMBER" | "RED";

export interface Scenario {
  id: number;
  name: string;
  amount: number;
  amountFormatted: string;
  beneficiaryName: string;
  beneficiaryVpa: string;
  description: string;
  isFirstTimeBeneficiary: boolean;
  previousTransactionCount: number;
  averageTransactionAmount: number;
  deviceSignals: {
    screenSharing: boolean;
    accessibilityServicesActive: boolean;
    accessibilityApp?: string;
    sameCity: boolean;
    unusualTime: boolean;
  };
  behavioralSignals: {
    referralSource?: string;
    recentSearches?: string[];
    sessionAnomalies?: string[];
  };
  expectedSeverity: Severity;
}

export interface EvaluateRequest {
  scenario: Scenario;
}

export interface CategoryScores {
  transaction: number;
  beneficiary: number;
  device: number;
  behavioral: number;
  content_intent: number;
}

export interface EvaluateResponse {
  risk_score: number;
  severity: Severity;
  headline: string;
  primary_reason: string;
  supporting_signals: string[];
  category_scores: CategoryScores;
  category_labels: {
    transaction: string;
    beneficiary: string;
    device: string;
    behavioral: string;
    content_intent: string;
  };
  amplification_rule?: string;
  raw_request?: string;
  raw_response?: string;
}

export type AppScreen = "home" | "loading" | "green-note" | "interception" | "drilldown";
