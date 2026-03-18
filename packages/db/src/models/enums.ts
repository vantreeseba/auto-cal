export const ACTIVITY_TYPES = [
  'work',
  'exercise',
  'learning',
  'personal',
  'social',
  'chores',
  'creative',
  'other',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const FREQUENCY_UNITS = ['week', 'month'] as const;
export type FrequencyUnit = (typeof FREQUENCY_UNITS)[number];
