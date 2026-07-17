import './globals.css';

export const metadata = {
  title: 'TNR Election Portal 2026 — Tahreek-e-Nojawanan Roundu',
  description: 'Secure internal election portal for Tahreek-e-Nojawanan Roundu. Your Vote, Your Voice.',
  icons: { icon: '/tnr-logo.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
