import './globals.css';
import { Mulish } from 'next/font/google';

const mulish = Mulish({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mulish',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata = {
  title: 'Tehreek-e-Nojawanan Roundu — Election Portal',
  description: 'Official online election portal of Tehreek-e-Nojawanan Roundu. Your Vote, Your Voice.',
  icons: { icon: '/tnr-logo.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={mulish.variable}>
      <head>
        {/* Urdu script uses Noto Nastaliq (different alphabet, not the body font) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
