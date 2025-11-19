export const PROFESSIONAL_PROFILE_ROLES = [
  "Founder",
  "Developer",
  "Investor",
  "Designer",
] as const;

export type ProfessionalProfileRole =
  (typeof PROFESSIONAL_PROFILE_ROLES)[number];
