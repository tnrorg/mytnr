// Membership emails — reuse the existing branded SMTP sender (lib/mailer.js).
// No new credentials, no secrets in the client bundle.
import { sendNotice } from '@/lib/mailer';

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://tnr-nine.vercel.app';

export async function sendApplicationReceived(app) {
  await sendNotice({
    to: app.email,
    subject: `Application Received — ${app.reference_no}`,
    heading: 'We have received your application',
    body:
`Assalam-o-Alaikum Dear ${app.first_name},

Thank you for applying for membership of Tehreek-e-Naujawanan Roundu.

Your application reference number is: ${app.reference_no}

Please keep this number safe. You can check your application status at any time
using this reference number and your email address.

Our membership committee will review your application and inform you of the outcome.

TNR Membership Committee`,
    ctaText: 'Check Application Status',
    ctaUrl: `${siteUrl()}/membership/status`,
  });
}

export async function sendApprovalInvite(member, inviteToken) {
  await sendNotice({
    to: member.email,
    subject: 'Your TNR Membership is Approved — Set Your Password',
    heading: 'Welcome to Tehreek-e-Naujawanan Roundu',
    body:
`Assalam-o-Alaikum Dear ${member.first_name},

Congratulations — your membership application has been approved.

Your Membership ID is: ${member.membership_id}

To activate your Member Portal, please set your password using the button below.
This link is valid for 7 days and can be used once.

Through the Member Portal you can manage your profile, build your CV,
download your digital membership card and certificate, and access
opportunities, events and community programmes.

TNR Membership Committee`,
    ctaText: 'Set My Password',
    ctaUrl: `${siteUrl()}/member/set-password?token=${inviteToken}`,
  });
}

export async function sendRejection(app, reason) {
  await sendNotice({
    to: app.email,
    subject: `Membership Application Update — ${app.reference_no}`,
    heading: 'Application Update',
    body:
`Assalam-o-Alaikum Dear ${app.first_name},

Thank you for your interest in Tehreek-e-Naujawanan Roundu.

After review, your membership application (${app.reference_no}) has not been approved at this time.

${reason ? 'Reason: ' + reason : ''}

You are welcome to contact the membership committee if you would like further guidance.

TNR Membership Committee`,
  });
}

export async function sendPasswordReset(member, token) {
  await sendNotice({
    to: member.email,
    subject: 'Reset Your TNR Member Password',
    heading: 'Password Reset Request',
    body:
`Assalam-o-Alaikum Dear ${member.first_name},

We received a request to reset the password for your TNR Member Portal account.

Use the button below to set a new password. This link is valid for 7 days.
If you did not request this, you can safely ignore this email.

TNR Membership Committee`,
    ctaText: 'Reset My Password',
    ctaUrl: `${siteUrl()}/member/set-password?token=${token}`,
  });
}
