export const FREQUENCY_UNITS = ['week', 'month'] as const;
export type FrequencyUnit = (typeof FREQUENCY_UNITS)[number];

export const API_KEY_SCOPES = ['read', 'write'] as const;
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];
