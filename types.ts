// Database Schema / Domain Models
// These interfaces align strictly with schema.sql

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  COMPANY_ADMIN = 'company_admin',
  DPO = 'dpo',
  USER = 'user'
}

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum IncidentStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  MITIGATED = 'mitigated',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive'
}

export enum RequestStatus {
  NEW = 'new',
  VALIDATING = 'validating',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

export enum DocType {
  PRIVACY_POLICY = 'privacy_policy',
  TERMS_OF_USE = 'terms_of_use',
  INCIDENT_PLAN = 'incident_plan',
  DPIA = 'dpia',
  ROPA_REPORT = 'ropa_report'
}

export enum AwarenessCategory {
  SECURITY = 'Segurança da Informação',
  PRIVACY_CULTURE = 'Cultura de Privacidade',
  GOVERNANCE = 'Governança e Políticas',
  COMPLIANCE = 'Conformidade LGPD'
}

export interface ThemeConfig {
  primaryColor: string;
  sidebarColor: string;
  sidebarTextColor: string;
  logoUrl?: string;
}

export interface SecurityConfig {
  mfaEnabled: boolean;
  sessionTimeoutMinutes: number;
  passwordPolicy: 'standard' | 'strong';
}

export interface CommitteeMember {
  id: string;
  name: string;
  function: string;
  email: string;
}

export interface Tenant {
  id: string; // UUID
  cnpj: string; // XX.XXX.XXX/0001-XX
  name: string;
  planStatus: 'active' | 'trial' | 'suspended' | 'cancelled';
  contactEmail?: string;
  settings?: {
    dpoName?: string;
    dpoEmail?: string;
    privacyCommittee?: CommitteeMember[];
    theme?: ThemeConfig;
    security?: SecurityConfig;
  };
  createdAt: string;
}

export interface User {
  id: string; // UUID
  tenantId: string; // UUID
  email: string;
  name: string;
  googleId?: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  lastLogin?: string;
}

// ROPA: Record of Processing Activities
export interface RopaEntry {
  id: string;
  tenantId: string;
  processName: string;
  department: string;
  dataTypes: string[]; // e.g. ["CPF", "Email"]
  dataSubjects: string; // e.g. "Employees"
  legalBasis: string;
  retentionPeriod: string;
  securityMeasures?: string;
  updatedAt: string;
}

export interface IncidentHistory {
  date: string;
  action: string;
  description: string;
  user: string;
}

export interface Incident {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedDataTypes?: string[];
  dateOccurred?: string;
  dateReported: string;
  analysisReport?: string;
  remediationPlan?: string;
  history: IncidentHistory[];
}

export interface DsarRequest {
  id: string;
  tenantId: string;
  protocolNumber: string;
  subjectName: string;
  subjectEmail: string;
  requestType: string;
  status: RequestStatus;
  deadline: string;
  responseContent?: string;
  createdAt: string;
}

export interface LegalDoc {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  type: DocType;
  version: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  tenantId: string;
  name: string;
  serviceProvided: string;
  riskLevel: IncidentSeverity;
  hasSignedDpa: boolean;
}

export interface Quiz {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface AwarenessPost {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  category: AwarenessCategory;
  isPublished: boolean;
  viewCount: number;
  date: string; // map from createdAt
  quiz?: Quiz;
}

// Mock Data Constants
export const MOCK_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
export const MOCK_CNPJ = '12.345.678/0001-90';