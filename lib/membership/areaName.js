/**
 * Tidy an area name before it is stored.
 *
 * Names are typed by hand and end up on the public site, on membership cards
 * and in every chart, so small inconsistencies are visible everywhere:
 * "UC BAGORDO /BAGHIZA" has a stray space before the slash, and a trailing
 * space would make an otherwise identical name count as a separate village.
 *
 * Deliberately conservative — it fixes whitespace and punctuation spacing
 * only. Capitalisation is left exactly as typed, because real names are not
 * predictable ("UC", "Talu Broq", "Nawasher/Nageghot") and auto-casing would
 * do more damage than it prevents.
 */
export function cleanAreaName(input) {
  return String(input || '')
    .replace(/\s+/g, ' ')            // collapse repeated whitespace
    .replace(/\s*\/\s*/g, '/')       // "A / B" and "A /B" → "A/B"
    .replace(/\s*-\s*/g, '-')        // same for hyphenated names
    .replace(/\s*,\s*/g, ', ')       // normalise comma spacing
    .trim();
}
