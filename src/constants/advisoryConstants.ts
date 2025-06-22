// Advisory comment constants
export const ADVISORY_AUTO_REFRESH_DELAY = 2000; // 2 seconds for responsive feedback

export const ADVISORY_CATEGORIES = {
  'Strengthen a Claim': {
    label: 'Strengthen a Claim',
    description: 'Add data, statistics, or concrete examples to support your claims.',
    color: 'amber'
  },
  'Define a Key Term/Acronym': {
    label: 'Define a Key Term/Acronym',
    description: 'Clarify technical terms or acronyms for better understanding.',
    color: 'amber'
  },
  'Improve Structural Flow': {
    label: 'Improve Structural Flow',
    description: 'Break down complex paragraphs and improve document organization.',
    color: 'amber'
  },
  'Add a Clear Call to Action': {
    label: 'Add a Clear Call to Action',
    description: 'Guide readers on what to do next with clear action items.',
    color: 'amber'
  },
  'Acknowledge Alternatives': {
    label: 'Acknowledge Alternatives',
    description: 'Consider and mention alternative approaches or solutions.',
    color: 'amber'
  }
};

export type AdvisoryCategory = keyof typeof ADVISORY_CATEGORIES;

// Minimum content length for advisory analysis (100 characters)
export const ADVISORY_MIN_CONTENT_LENGTH = 100; 