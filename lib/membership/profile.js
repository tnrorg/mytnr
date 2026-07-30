// Profile section registry — server + client share this so the API and UI
// can never drift apart.
export const SECTIONS = {
  education:  { table: 'member_education',            label: 'Education' },
  experience: { table: 'member_experience',           label: 'Work Experience' },
  skills:     { table: 'member_skills',               label: 'Skills' },
  projects:   { table: 'member_projects',             label: 'Projects' },
  certifications: { table: 'member_certifications',   label: 'Certifications' },
  languages:  { table: 'member_languages',            label: 'Languages' },
  volunteer:  { table: 'member_volunteer_experience', label: 'Volunteer Experience' },
};

// Columns a member may write, per section. Anything else is ignored — this is
// the whitelist that prevents members from injecting member_id, status, etc.
export const ALLOWED = {
  education:  ['qualification','degree','field_of_study','institution','start_date','end_date','currently_studying','grade','description','sort_order'],
  experience: ['job_title','organization','employment_type','location','start_date','end_date','currently_working','responsibilities','achievements','sort_order'],
  skills:     ['name','category','level','sort_order'],
  projects:   ['name','description','technologies','project_url','github_url','image_url','sort_order'],
  certifications: ['name','issuer','issue_date','expiry_date','credential_id','credential_url','file_url','sort_order'],
  languages:  ['language','proficiency','sort_order'],
  volunteer:  ['role','organization','area','start_date','end_date','currently_active','description','sort_order'],
};

// Free-to-edit profile fields (member_profiles table).
export const PROFILE_FIELDS = [
  'headline','summary','country','city','address','whatsapp',
  'linkedin_url','portfolio_url','github_url','tnr_contributions','awards',
];

// Changing any of these requires ADMIN APPROVAL — never written directly.
// Fields a member may change themselves — written straight through, so the
// public profile updates immediately with no admin request.
export const SELF_EDITABLE_CORE = [
  'first_name', 'last_name', 'mobile', 'village', 'union_council',
];

// Still routed through approval, and only these two:
//   email       — it is the login identity, so an instant change could lock a
//                 member out or be used to take an account over.
//   category_id — a classification the committee assigns, not a self-declared
//                 value.
export const SENSITIVE_FIELDS = ['email', 'category_id'];
// Members can never change these at all.
export const FORBIDDEN_FIELDS = ['membership_id','status','approved_by','approved_at','public_visible'];

export const pick = (obj, keys) =>
  keys.reduce((o, k) => { if (obj[k] !== undefined) o[k] = obj[k] === '' ? null : obj[k]; return o; }, {});
