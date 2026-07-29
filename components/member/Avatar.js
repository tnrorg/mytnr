'use client';
export function initials(name) {
  const p = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '?';
  return ((p[0][0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}

// Member photo with an initials fallback. The TNR logo is never used as a
// stand-in for a person's face.
export default function Avatar({ src, name, style, className, fontSize = 20 }) {
  if (src) return <img src={src} alt={name || ''} style={style} className={className} />;
  return (
    <div style={{ ...style, display: 'grid', placeItems: 'center',
      background: 'linear-gradient(160deg,#0B6B4F,#063D2B)', color: '#F3E4B3',
      fontWeight: 900, fontSize, letterSpacing: '.04em' }} className={className}>
      {initials(name)}
    </div>
  );
}
