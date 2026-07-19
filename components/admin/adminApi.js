'use client';
export function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('tnr_admin_token') : null; }
export function setToken(t) { localStorage.setItem('tnr_admin_token', t); }
export function clearToken() { localStorage.removeItem('tnr_admin_token'); }

async function req(method, url, body) {
  const headers = { 'Content-Type': 'application/json' };
  const tok = getToken(); if (tok) headers.Authorization = `Bearer ${tok}`;
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { clearToken(); if (typeof window !== 'undefined') window.dispatchEvent(new Event('tnr-logout')); }
  return data;
}
export const aGet   = (u) => req('GET', u);
export const aPost  = (u, b) => req('POST', u, b);
export const aPatch = (u, b) => req('PATCH', u, b);
export const aDel   = (u) => req('DELETE', u);

// Roles are deliberately NOT derived on the client.
// Ask the server (/api/admin/me) — it verifies the signature and re-reads the database.
