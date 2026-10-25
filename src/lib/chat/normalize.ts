// Text normalisation shared by the FAQ matcher: lower-case, strip Latin accents and Arabic diacritics,
// unify Arabic letter variants, convert Eastern Arabic digits, drop punctuation.

const ARABIC_DIACRITICS = /[ً-ٰٟـ]/g;

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(ARABIC_DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[’'`]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Strips common Arabic prefixes (ال، و، ب، ل) and French elisions so "الروبوتات" ≈ "روبوتات". */
export function stem(token: string): string {
  let t = token;
  if (/^[؀-ۿ]/.test(t)) {
    if (t.length > 4 && /^(وال|بال|لل|فال|كال)/.test(t)) t = t.slice(t.startsWith('لل') ? 2 : 3);
    else if (t.length > 3 && t.startsWith('ال')) t = t.slice(2);
    else if (t.length > 3 && /^[وب]/.test(t)) t = t.slice(1);
    return t;
  }
  return t.length > 4 && t.endsWith('s') ? t.slice(0, -1) : t;
}

const STOPWORDS = new Set([
  // en
  'the', 'a', 'an', 'is', 'are', 'do', 'does', 'you', 'your', 'i', 'my', 'me', 'to', 'of', 'for', 'in', 'on', 'and', 'or',
  'can', 'what', 'how', 'it', 'there', 'any', 'have', 'with', 'at', 'be', 'we', 'please',
  // fr
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'est', 'et', 'ou', 'je', 'vous', 'mon', 'ma', 'mes', 'votre',
  'vos', 'pour', 'en', 'au', 'aux', 'que', 'qui', 'quoi', 'il', 'elle', 'on', 'ce', 'cette', 'avez', 'sont', 'l', 'd',
  'est', 'ce', 'pas', 'y', 'a', 'svp',
  // ar
  'في', 'من', 'على', 'هل', 'ما', 'ماذا', 'عن', 'الى', 'او', 'و', 'يا', 'انا', 'انتم', 'عندكم', 'لو', 'هو', 'هي', 'شو',
  'مع', 'كيف', 'ان',
]);

export function tokens(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}
