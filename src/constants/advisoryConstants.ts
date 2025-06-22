// Advisory comment constants
export const ADVISORY_AUTO_REFRESH_DELAY = 5000; // 5 seconds

export const ADVISORY_CATEGORIES = {
  'Strengthen a Claim': {
    label: 'Strengthen a Claim',
    color: '#8b5cf6', // Purple-500
    description: 'Add data points, statistics, or concrete examples to support claims'
  },
  'Define a Key Term/Acronym': {
    label: 'Define a Key Term/Acronym',
    color: '#06b6d4', // Cyan-500
    description: 'Define specialized jargon or acronyms for clarity'
  },
  'Improve Structural Flow': {
    label: 'Improve Structural Flow',
    color: '#10b981', // Emerald-500
    description: 'Break up dense paragraphs or improve organization'
  },
  'Add a Clear Call to Action': {
    label: 'Add a Clear Call to Action',
    color: '#f59e0b', // Amber-500
    description: 'Guide readers on next steps or conclusions'
  },
  'Acknowledge Alternatives': {
    label: 'Acknowledge Alternatives',
    color: '#ef4444', // Red-500
    description: 'Consider mentioning other options to strengthen your case'
  },
} as const;

export type AdvisoryCategory = keyof typeof ADVISORY_CATEGORIES; 