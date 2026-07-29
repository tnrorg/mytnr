// TNR platform navigation. Election Portal points at the LIVE existing system.
// Every other route is a placeholder page to be built — nothing here touches
// election data, APIs or logic.
export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'About TNR', items: [
    ['About Us', '/about'], ['Vision & Mission', '/about/vision-mission'],
    ['Constitution', '/about/constitution'], ['Executive Committee', '/about/executive-committee'],
    ['Advisory Council', '/about/advisory-council'], ['Office Bearers', '/about/office-bearers'],
    ['Departments', '/about/departments'], ['History of TNR', '/about/history'],
  ]},
  { label: 'Membership', href: '/membership', items: [
    ['Membership Overview', '/membership'], ['Become a Member', '/membership/apply'],
    ['Check Application Status', '/membership/status'], ['Verify Membership', '/membership/verify'],
    ['Our Members', '/members'], ['Volunteer With TNR', '/volunteer'],
    ['Member Login', '/member/login'],
  ]},
  { label: 'Community', items: [
    ['Global Member Directory', '/community/directory'], ['Professional Directory', '/community/professionals'],
    ['Country Chapters', '/community/chapters'], ['Regional Representatives', '/community/representatives'],
    ['Interactive World Map', '/community/map'], ['Community Forum', '/community/forum'],
    ['Success Stories', '/community/stories'], ['Hall of Fame', '/community/hall-of-fame'],
  ]},
  { label: 'Education', items: [
    ['Scholarships', '/education/scholarships'], ['University Directory', '/education/universities'],
    ['Admission Guidance', '/education/admissions'], ['Student Mentorship', '/education/mentorship'],
    ['CV Builder', '/education/cv-builder'], ['SOP Builder', '/education/sop-builder'],
    ['Cover Letter Builder', '/education/cover-letter'], ['Educational Resources', '/education/resources'],
  ]},
  { label: 'Career & Business', items: [
    ['Job Portal', '/career/jobs'], ['Internship Portal', '/career/internships'],
    ['Career Mentorship', '/career/mentorship'], ['Business Directory', '/career/businesses'],
    ['Startup Support', '/career/startups'], ['Freelancing Resources', '/career/freelancing'],
    ['Post a Job', '/career/post-job'], ['Register a Business', '/career/register-business'],
  ]},
  { label: 'Welfare', items: [
    ['Charity Projects', '/welfare/projects'], ['Donate', '/welfare/donate'],
    ['Emergency Support', '/welfare/emergency'], ['Request Assistance', '/welfare/request'],
    ['Volunteer Portal', '/welfare/volunteer'], ['Transparency Reports', '/welfare/transparency'],
    ['Completed Projects', '/welfare/completed'],
  ]},
  { label: 'News & Events', items: [
    ['News', '/news'], ['Announcements', '/news/announcements'],
    ['Upcoming Events', '/events'], ['Events Calendar', '/events/calendar'],
    ['Online Meetings', '/events/meetings'], ['Webinars', '/events/webinars'],
    ['Workshops', '/events/workshops'], ['Past Events', '/events/past'],
    ['Event Registration', '/events/register'],
  ]},
  { label: 'Rondo Statistics', href: '/statistics', items: [
    ['Population', '/statistics/population'], ['Literacy Rate', '/statistics/literacy'],
    ['Education Statistics', '/statistics/education'],
    ['Health Statistics', '/statistics/health'], ['Tourism Statistics', '/statistics/tourism'],
    ['Schools', '/statistics/schools'],
    ['Colleges', '/statistics/colleges'], ['Universities', '/statistics/universities'],
    ['Doctors', '/statistics/doctors'], ['Engineers', '/statistics/engineers'],
    ['Teachers', '/statistics/teachers'], ['Overseas Professionals', '/statistics/overseas'],
    ['Employment Statistics', '/statistics/employment'], ['Interactive Reports', '/statistics/reports'],
  ]},
  { label: 'Election Portal', href: '/election-portal', highlight: true, items: [
    ['Current Election', '/election-portal'], ['Candidate Profiles', '/election-portal#candidates'],
    ['Voter Verification', '/vote'], ['Election Results', '/results'],
    ['Live Dashboard', '/dashboard'], ['Election Guidelines', '/election-portal#process'],
  ]},
  { label: 'More', items: [
    ['Digital Library', '/media/library'],
    ['Research Papers', '/media/research'], ['Photo Gallery', '/media/photos'],
    ['Video Gallery', '/media/videos'], ['Newsletter', '/media/newsletter'],
    ['Verify Records', '/verify'], ['Ask TNR AI', '/tnr-ai'],
    ['Contact Us', '/contact'], ['Help Center', '/help'],
  ]},
];

export const FOOTER_LINKS = [
  ['Privacy Policy', '/legal/privacy'], ['Terms & Conditions', '/legal/terms'],
  ['Data Protection Policy', '/legal/data-protection'], ['Code of Conduct', '/legal/code-of-conduct'],
  ['Community Guidelines', '/legal/community-guidelines'], ['Accessibility', '/legal/accessibility'],
  ['Security', '/legal/security'], ['Transparency Reports', '/welfare/transparency'],
  ['Sitemap', '/sitemap'], ['Help Center', '/help'], ['Contact', '/contact'],
];
