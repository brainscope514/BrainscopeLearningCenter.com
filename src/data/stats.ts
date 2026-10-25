// Numeric stats for the highlights strip. PLACEHOLDER: add ONLY numbers the founders have confirmed.
// While empty, the strip shows non-numeric proof points instead. Labels live in i18n `highlights.statLabels[id]`.
export interface Stat {
  id: string;
  value: number;
  suffix?: string;
}

export const STATS: Stat[] = [];
