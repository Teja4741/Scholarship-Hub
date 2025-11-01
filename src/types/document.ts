export interface Document {
  id: number;
  applicationId: number;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  documentType: 'previous_year_memo' | 'caste_certificate' | 'aadhar_card' | 'health_certificate' | 'league_certifications' | 'other';
  verified: boolean;
  extractedText?: string;
  verifiedAt?: Date;
  verificationNotes?: string;
  uploadedAt: Date;
}

export type DocumentType = Document['documentType'];

export const DOCUMENT_TYPES = {
  PREVIOUS_YEAR_MEMO: 'previous_year_memo' as const,
  CASTE_CERTIFICATE: 'caste_certificate' as const,
  AADHAR_CARD: 'aadhar_card' as const,
  HEALTH_CERTIFICATE: 'health_certificate' as const,
  LEAGUE_CERTIFICATIONS: 'league_certifications' as const,
  OTHER: 'other' as const,
};

export const REQUIRED_DOCUMENTS = [
  DOCUMENT_TYPES.PREVIOUS_YEAR_MEMO,
  DOCUMENT_TYPES.CASTE_CERTIFICATE,
  DOCUMENT_TYPES.AADHAR_CARD,
];

export const SPORTS_DOCUMENTS = [
  DOCUMENT_TYPES.HEALTH_CERTIFICATE,
  DOCUMENT_TYPES.LEAGUE_CERTIFICATIONS,
];
