// Shared option lists for the membership application (client-safe, no secrets).
export const GENDERS = ['Male', 'Female'];

export const EDUCATION_LEVELS = [
  'No Formal Education', 'Secondary School', 'Higher Secondary', 'Diploma',
  'Technical or Vocational Education', "Bachelor's Degree", "Master's Degree",
  'MPhil', 'PhD', 'Religious Education', 'Other',
];

// Short forms for the dropdown education levels. Leadership cards should read
// "BS Software Engineering", not the generic "Bachelor's Degree".
const DEGREE_SHORT = {
  "Bachelor's Degree": 'BS',
  "Master's Degree": 'MS',
  'MPhil': 'MPhil',
  'PhD': 'PhD',
  'Diploma': 'Diploma',
  'Technical or Vocational Education': 'Technical',
  'Higher Secondary': 'Higher Secondary',
  'Secondary School': 'Matric',
  'Religious Education': 'Religious Education',
};

/**
 * Academic title for a leadership card.
 *
 * Combines the level with the subject when the level is one of the known
 * dropdown values — "Bachelor's Degree" + "Software Engineering" reads as
 * "BS Software Engineering".
 *
 * Anything the person typed themselves is left exactly as written, so
 * "MS in Chemistry" or "MBBS, FCPS" is never rewritten into something else.
 */
export function academicTitle(qualification, field) {
  const q = String(qualification || '').trim();
  const f = String(field || '').trim();
  if (!q) return f || null;

  const short = DEGREE_SHORT[q];
  if (!short) return q;                 // free text — leave it alone
  if (!f) return short === q ? q : short;
  return `${short} ${f}`;
}

export const POSITIONS = [
  'Student', 'Employee', 'Government Employee', 'Private-Sector Employee',
  'Business Owner', 'Freelancer', 'Teacher or Educator', 'Social Worker',
  'Job Seeker', 'Unemployed', 'Retired', 'Other',
];

export const CONTRIBUTION_AREAS = [
  'Education and Scholarships', 'Career Guidance and Mentorship',
  'Information Technology and Digital Services', 'Youth Development',
  'Community Welfare', 'Health and Awareness', 'Sports and Cultural Activities',
  'Environmental Protection', 'Media and Communications', 'Women Empowerment',
  'Skills Development', 'Employment Opportunities', 'Volunteer and Relief Work',
  'Overseas Coordination', 'Research and Policy Development',
  'Tourism Development', 'Entrepreneurship', 'Other',
];

export const LEADERSHIP_OPTIONS = ['Yes', 'No', 'Not Sure'];

export const DECLARATION_VERSION = 'v1.0';
export const DECLARATION_TEXT =
  'I confirm that the information provided in this application is correct and complete. ' +
  'I support peaceful, constructive, and responsible political awareness and community ' +
  'engagement for the better future of Roundu. I agree to respect the constitution, ' +
  'policies, values, and code of conduct of Tehreek-e-Naujawanan Roundu.';
