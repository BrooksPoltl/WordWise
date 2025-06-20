import { UserRole } from './userConstants';

export interface DocumentType {
  name: string;
  description: string;
}

export const DOCUMENT_TYPES_BY_ROLE: Record<UserRole, DocumentType[]> = {
  'Product Manager': [
    {
      name: 'Product Requirements Document (PRD)',
      description: 'Outline the product\'s purpose, features, functionality, and behavior.',
    },
    {
      name: 'User Story',
      description: 'Describe a software feature from the end-user\'s perspective.',
    },
    {
      name: 'Feature Specification',
      description: 'Provide detailed information about a new feature, including design, functionality, and technical requirements.',
    },
    {
      name: 'Product Roadmap',
      description: 'High-level summary of the product\'s vision and direction over time.',
    },
  ],
  'Software Engineer': [
    {
      name: 'Technical Design Document (TDD)',
      description: 'Detail the technical approach, architecture, and implementation plan for a new feature or system.',
    },
    {
      name: 'API Documentation',
      description: 'Provide clear instructions and examples for using an API.',
    },
    {
      name: 'Post-Mortem Analysis',
      description: 'Document an incident, analyzing the root cause, impact, and steps to prevent recurrence.',
    },
    {
      name: 'Request for Comments (RFC)',
      description: 'Propose a new technical standard or major architectural change and solicit feedback from peers.',
    },
  ],
};

export const NEW_DOCUMENT_TEXT = {
  MODAL_TITLE: 'Create a New Document',
  TITLE_LABEL: 'Title (Optional)',
  TITLE_PLACEHOLDER: 'Untitled Document',
  CONTEXT_LABEL: 'What\'s this document about?',
  CONTEXT_DESCRIPTION: 'Provide some context (e.g., project name, goals, audience). This will help power AI suggestions. You can always add this later.',
  DOCUMENT_TYPE_HEADER: 'Select a document type for tailored AI suggestions (Optional)',
  CREATE_BUTTON: 'Create Document',
} as const; 