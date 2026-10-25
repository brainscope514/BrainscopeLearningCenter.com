// Pure helpers for the free-trial form: validation and the WhatsApp message (kept DOM-free so they are easy to test).

export interface TrialValues {
  name: string;
  age: string;
  program: string;
  time: string;
  message: string;
  programLabel: string;
  contactLabel: string;
  timeLabel: string;
}

export interface TrialConfig {
  number: string;
  message: { intro: string; name: string; age: string; program: string; contact: string; time: string; note: string };
  errors: { name: string; age: string; program: string; time: string };
}

/** Converts Eastern Arabic (٠-٩) and Persian (۰-۹) digits to Western digits so "١٢" is read as 12. */
export const normalizeDigits = (value: string): string =>
  value.replace(/[٠-٩۰-۹]/g, (d) => String(d.charCodeAt(0) & 0xf));

/** Returns a map of field name → error message (empty when valid). */
export function validateTrial(v: TrialValues, errors: TrialConfig['errors']): Record<string, string> {
  const out: Record<string, string> = {};
  if (v.name.trim().length < 2) out.name = errors.name;
  const age = Number(normalizeDigits(v.age.trim()));
  if (!Number.isInteger(age) || age < 4 || age > 60) out.age = errors.age;
  if (!v.program) out.program = errors.program;
  if (!v.time) out.time = errors.time;
  return out;
}

/** Builds the pre-filled WhatsApp message in the page language (one "Label: value" line per field). */
export function buildTrialMessage(v: TrialValues, m: TrialConfig['message']): string {
  const lines = [
    m.intro,
    '',
    `${m.name}: ${v.name.trim()}`,
    `${m.age}: ${normalizeDigits(v.age.trim())}`,
    `${m.program}: ${v.programLabel}`,
    `${m.contact}: ${v.contactLabel}`,
    `${m.time}: ${v.timeLabel}`,
  ];
  if (v.message.trim()) lines.push(`${m.note}: ${v.message.trim()}`);
  return lines.join('\n');
}
