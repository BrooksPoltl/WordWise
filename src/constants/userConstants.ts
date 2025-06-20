export const USER_ROLES = [
  'Product Manager',
  'Software Engineer',
] as const;

export type UserRole = typeof USER_ROLES[number];

export const ONBOARDING_TEXT = {
  TITLE: "Welcome to WordWise! Let's personalize your experience.",
  ROLE_SUBTITLE: "By understanding your role, we can provide you with tailored suggestions, document templates, and insights to help you write more effectively.",
  PERSONA_TITLE: "Supercharge your suggestions.",
  PERSONA_DESCRIPTION: "Give WordWise more context about what you do. The more detail you provide (like your industry, company, or specific projects), the more insightful and relevant the AI's feedback will become. This is optional but highly recommended for the best experience.",
} as const; 