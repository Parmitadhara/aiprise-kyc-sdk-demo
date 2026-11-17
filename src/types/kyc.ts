// Defines the sequential stages of the AiPrise-inspired KYC flow
export type KycStep =
  | 'CONSENT'
  | 'DOC_SELECT'
  | 'ID_FRONT'
  | 'ID_BACK'
  | 'SELFIE_LIVENESS'
  | 'PROCESSING'
  | 'RESULT';

// Supported government document types
export type DocumentType = 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID';

// Represents a compressed, upload-ready capture artifact
export interface CapturedArtifact {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  captureMethod: 'WEBRTC_STREAM' | 'NATIVE_FALLBACK';
  timestamp: number;
}

// Complete session payload accumulated across steps
export interface KycSessionState {
  country: string;
  documentType: DocumentType;
  idFront: CapturedArtifact | null;
  idBack: CapturedArtifact | null;
  selfie: CapturedArtifact | null;
  isLowBandwidth: boolean;
}