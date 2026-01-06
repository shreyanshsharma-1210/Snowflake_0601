/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export type Gender = "male" | "female" | "any";

export type SeverityLevel = "critical" | "moderate" | "low";

export interface VaccineRecommendation {
  id: string;
  age: number;
  gender: Gender;
  vaccine: string;
  disease: string;
  severity: SeverityLevel;
  notes?: string;
}

export interface VaccinesResponse {
  upcoming: VaccineRecommendation[];
  recent: VaccineRecommendation[];
}

export interface ReminderPayload {
  userId: string;
  memberId?: string;
  vaccineId: string;
  scheduledAt?: string;
}

export interface ReminderRecord extends ReminderPayload {
  id: string;
  createdAt: string;
}

export interface FamilyMemberPayload {
  name: string;
  age: number;
  gender: Gender;
}

export interface FamilyMemberRecord extends FamilyMemberPayload {
  id: string;
  createdAt: string;
}

// Doctor directory types
export type DoctorCategory =
  | "pediatrician"
  | "dermatologist"
  | "cardiologist"
  | "general-physician"
  | "gynecologist"
  | "orthopedic";

export interface DoctorRecord {
  id: string;
  name: string;
  specialization: DoctorCategory;
  experienceYears: number;
  avatarUrl?: string;
  bio?: string;
  slots: string[]; // e.g., "2025-10-01T10:00:00Z" or human-readable like "10:00 AM"
}

export interface DoctorsResponse {
  category: DoctorCategory;
  doctors: DoctorRecord[];
}

export interface AppointmentPayload {
  doctor_id: string;
  doctor_name: string;
  specialization: string;
  slot: string;
  user_name: string;
  user_email: string;
}

export interface AppointmentRecord extends AppointmentPayload {
  id: string;
  createdAt: string;
  meetingLink: string;
}
