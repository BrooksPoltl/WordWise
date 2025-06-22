// Advisory comment constants
export const ADVISORY_AUTO_REFRESH_DELAY = 2000; // 2 seconds for responsive feedback

export const ADVISORY_CATEGORIES = {
  // Context-aware categories (blue styling) - Priority 1
  'Implementation Feasibility': {
    label: 'Implementation Feasibility',
    description: 'Practical considerations for execution given constraints and context.',
    color: '#3B82F6' // blue-500
  },
  'Domain Expertise': {
    label: 'Domain Expertise',
    description: 'Industry standards, best practices, and domain-specific guidance.',
    color: '#3B82F6' // blue-500
  },
  'Risk Assessment': {
    label: 'Risk Assessment',
    description: 'Potential challenges and mitigation strategies based on context.',
    color: '#3B82F6' // blue-500
  },
  'Competitive Context': {
    label: 'Competitive Context',
    description: 'Market conditions and competitive landscape considerations.',
    color: '#3B82F6' // blue-500
  },
  // Standard advisory categories (amber styling) - Priority 2
  'Strengthen a Claim': {
    label: 'Strengthen a Claim',
    description: 'Add data, statistics, or concrete examples to support your claims.',
    color: '#F59E0B' // amber-500
  },
  'Define a Key Term/Acronym': {
    label: 'Define a Key Term/Acronym',
    description: 'Clarify technical terms or acronyms for better understanding.',
    color: '#F59E0B' // amber-500
  },
  'Improve Structural Flow': {
    label: 'Improve Structural Flow',
    description: 'Break down complex paragraphs and improve document organization.',
    color: '#F59E0B' // amber-500
  },
  'Add a Clear Call to Action': {
    label: 'Add a Clear Call to Action',
    description: 'Guide readers on what to do next with clear action items.',
    color: '#F59E0B' // amber-500
  },
  'Acknowledge Alternatives': {
    label: 'Acknowledge Alternatives',
    description: 'Consider and mention alternative approaches or solutions.',
    color: '#F59E0B' // amber-500
  }
};

export type AdvisoryCategory = keyof typeof ADVISORY_CATEGORIES;

// Context-aware categories for filtering/styling
export const CONTEXT_AWARE_CATEGORIES: AdvisoryCategory[] = [
  'Implementation Feasibility',
  'Domain Expertise', 
  'Risk Assessment',
  'Competitive Context'
];

// Standard categories for filtering/styling
export const STANDARD_CATEGORIES: AdvisoryCategory[] = [
  'Strengthen a Claim',
  'Define a Key Term/Acronym',
  'Improve Structural Flow',
  'Add a Clear Call to Action',
  'Acknowledge Alternatives'
];

// Minimum content length for advisory analysis (100 characters)
export const ADVISORY_MIN_CONTENT_LENGTH = 100; 