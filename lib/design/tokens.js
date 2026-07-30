// ── TNR design tokens — the single source of truth ─────────────────────────
// The audit found 29 files each declaring their own `const C = { deep, green,
// gold }` and 31 redeclaring the Mulish font stack, with 91 hardcoded
// #063D2B literals. Import from here instead so a brand change is one edit.
//
// These mirror the CSS custom properties in globals.css and the Tailwind
// `tnr` palette, so the same value is available in JS, CSS and utilities.

export const COLORS = {
  green950: '#062D21',
  green900: '#0A3D2C',
  green800: '#0F5138',
  green700: '#176B49',
  gold500:  '#C89A2B',
  gold400:  '#D7AE4A',
  white:    '#FFFFFF',
  snow:     '#F8FAF8',
  neutral:  '#F1F4F2',
  charcoal: '#17211C',
  muted:    '#647169',
};

/** Legacy aliases — lets existing pages swap `const C = {...}` for one import
 *  without renaming every usage in the same commit. */
export const C = {
  deep:  COLORS.green900,
  green: COLORS.green700,
  gold:  COLORS.gold500,
  ink:   COLORS.charcoal,
  snow:  COLORS.snow,
  muted: COLORS.muted,
};

/** The Mulish stack, previously copy-pasted into 31 files. */
export const FONT = {
  fontFamily: 'var(--font-mulish), Mulish, system-ui, sans-serif',
};

/** Chart palette: a forest-green ramp with gold reserved for "Other". */
export const CHART_GREENS = [
  '#062D21', '#0A3D2C', '#0F5138', '#176B49', '#1E8759',
  '#2A9C6C', '#4FB088', '#77C4A5', '#A2D7C2', '#C9E7DA',
];
export const CHART_OTHER = COLORS.gold500;

/** Motion durations from the spec — micro 120–180, standard 200–300,
 *  reveal 350–550ms. Kept here so components cannot drift. */
export const MOTION = {
  micro: 0.15,
  standard: 0.25,
  reveal: 0.45,
  ease: [0.22, 0.61, 0.36, 1],
};

/** Section-reveal variants for Framer Motion, honouring reduced motion via
 *  the CSS media query in globals.css (transforms are cheap to disable). */
export const revealUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: MOTION.reveal, ease: MOTION.ease },
  },
};
export const staggerChildren = (gap = 0.06) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap } },
});
