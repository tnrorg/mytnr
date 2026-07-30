// Shared validation for the membership application.
// Imported by BOTH the form and the API route so the rules can never drift
// apart — the browser gives instant feedback, the server enforces the same
// thing for anyone posting directly to the endpoint.

export const REQUIRED_LABELS = {
  applied_role: 'Membership type',
  first_name: 'First name',
  last_name: 'Last name',
  gender: 'Gender',
  age: 'Age',
  union_council: 'Union Council',
  village: 'Village / Area',
  mobile: 'Mobile / WhatsApp number',
  email: 'Email address',
  education_level: 'Highest level of education',
  field_of_study: 'Field of study / profession',
  current_position: 'Current position',
  position_other: 'Your position',
  why_join: 'Why you want to join',
  contribution_areas: 'Contribution areas',
  leadership_view: 'Leadership question',
  youth_issues: 'Issues facing the youth',
  declaration_accepted: 'Declaration',
};

// Field → the form section it lives in, used to flag incomplete sections.
export const FIELD_SECTION = {
  applied_role: 'R',
  first_name: 'A', last_name: 'A', gender: 'A', age: 'A', union_council: 'A',
  village: 'A', mobile: 'A', email: 'A',
  education_level: 'B', field_of_study: 'B', current_position: 'B', position_other: 'B',
  why_join: 'C', contribution_areas: 'C', leadership_view: 'C', youth_issues: 'C',
  declaration_accepted: 'D',
};

const MIN_TEXT = 15;   // stops "asdf" being accepted as a written answer

export function validateApplication(f = {}) {
  const e = {};
  const str = (k) => String(f[k] ?? '').trim();

  if (!str('applied_role')) e.applied_role = 'Please choose a membership type.';

  for (const k of ['first_name', 'last_name', 'gender', 'union_council', 'village',
                   'education_level', 'field_of_study', 'current_position']) {
    if (!str(k)) e[k] = `${REQUIRED_LABELS[k]} is required.`;
  }

  if (!str('first_name')) { /* already flagged */ }
  else if (str('first_name').length < 2) e.first_name = 'Please enter your full first name.';
  if (str('last_name') && str('last_name').length < 2) e.last_name = 'Please enter your full last name.';

  const age = Number(str('age'));
  if (!str('age')) e.age = 'Age is required.';
  else if (!Number.isFinite(age) || age < 12 || age > 120) e.age = 'Please enter an age between 12 and 120.';

  const mobile = str('mobile');
  const digits = mobile.replace(/\D/g, '');
  if (!mobile) e.mobile = 'Mobile / WhatsApp number is required.';
  else if (digits.length < 10 || digits.length > 15) e.mobile = 'Please enter a valid mobile number.';

  const email = str('email');
  if (!email) e.email = 'Email address is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) e.email = 'Please enter a valid email address.';

  for (const k of ['why_join', 'youth_issues']) {
    const v = str(k);
    if (!v) e[k] = `${REQUIRED_LABELS[k]} is required.`;
    else if (v.length < MIN_TEXT) e[k] = `Please write a little more (at least ${MIN_TEXT} characters).`;
  }

  // "Other" is only meaningful once they say what it is.
  if (str('current_position') === 'Other' && !str('position_other'))
    e.position_other = 'Please type your current position.';

  if (!Array.isArray(f.contribution_areas) || !f.contribution_areas.length)
    e.contribution_areas = 'Please select at least one area.';
  if (!str('leadership_view')) e.leadership_view = 'Please choose an answer.';
  if (!f.declaration_accepted) e.declaration_accepted = 'You must accept the declaration to submit.';

  return e;
}

export const isComplete = (f) => Object.keys(validateApplication(f)).length === 0;

/** Sections that still have at least one problem, e.g. ['A','C']. */
export const incompleteSections = (errors) =>
  [...new Set(Object.keys(errors).map(k => FIELD_SECTION[k]).filter(Boolean))].sort();

// ── Multi-step form wiring ────────────────────────────────────────────────
// The steps deliberately mirror FIELD_SECTION, so "which fields belong to
// step 3" has exactly one answer shared by the form and the server.
export const STEPS = [
  { key: 'R', title: 'Membership Type', blurb: 'Choose how you would like to join TNR. The rest of the form is the same for everyone.' },
  { key: 'A', title: 'Personal Information', blurb: 'Who you are and how the committee can reach you.' },
  { key: 'B', title: 'Education & Profession', blurb: 'Your studies and what you currently do.' },
  { key: 'C', title: 'Motivation & Contribution', blurb: 'Why you want to join and where you can help.' },
  { key: 'D', title: 'Declaration', blurb: 'Confirm you accept the membership declaration.' },
  { key: 'REVIEW', title: 'Review & Submit', blurb: 'Check your answers before sending.' },
];

/** Field keys belonging to a step, in the order they appear on the form. */
export const fieldsInStep = (key) =>
  Object.keys(FIELD_SECTION).filter(f => FIELD_SECTION[f] === key);

/** Errors limited to one step — used to gate the Continue button. */
export function stepErrors(f, key) {
  const all = validateApplication(f);
  if (key === 'REVIEW') return all;                 // final gate = everything
  const keys = fieldsInStep(key);
  return Object.fromEntries(Object.entries(all).filter(([k]) => keys.includes(k)));
}
export const isStepComplete = (f, key) => Object.keys(stepErrors(f, key)).length === 0;
