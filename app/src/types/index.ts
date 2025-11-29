export type ConfidenceScore = number;

export interface ApplicantProfile {
  name: string;
  dateOfBirth: string;
  passportNumber: string;
  nationality: string;
  visaType: string;
  intendedTravelDate: string;
}

export interface EligibilityPolicy {
  minPassportValidityDays: number;
  minApplicantAge: number;
  supportedVisaTypes: string[];
  blacklistedNationalities: string[];
  requireNameMatch: boolean;
  requirePassportMatch: boolean;
}

export interface ExtractedField {
  label: string;
  value: string | null;
  confidence: ConfidenceScore;
  source: "ocr" | "mrz" | "barcode" | "inferred" | "manual" | "unknown";
  issues?: string[];
}

export interface MrzResult {
  format:
    | "TD1"
    | "TD2"
    | "TD3"
    | "MRVA"
    | "MRVB"
    | "FRENCH_NATIONAL_ID"
    | "FRENCH_DRIVING_LICENSE"
    | "SWISS_DRIVING_LICENSE"
    | "unknown";
  fields: Record<string, ExtractedField>;
  checksumValid: boolean;
}

export interface ValidationCheck {
  id: string;
  label: string;
  status: "pass" | "fail" | "warning" | "unknown";
  details: string;
  confidence: ConfidenceScore;
}

export interface EligibilityDecision {
  status: "approved" | "manual_review" | "rejected" | "unknown";
  reasons: string[];
  confidence: ConfidenceScore;
}

export interface VerificationResponse {
  summary: string;
  overallConfidence: ConfidenceScore;
  extractedFields: Record<string, ExtractedField>;
  mrz?: MrzResult | null;
  barcodeData?: {
    raw: string | null;
    parsed?: Record<string, ExtractedField>;
  };
  validationChecks: ValidationCheck[];
  eligibility: EligibilityDecision;
  recommendedActions: string[];
  rawOcrText: string;
  timingMs: number;
}
