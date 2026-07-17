import { NextResponse } from 'next/server';
export const ok   = (data = {}, init = {}) => NextResponse.json({ ok: true, ...data }, init);
export const fail = (error, status = 400, extra = {}) =>
  NextResponse.json({ ok: false, error, ...extra }, { status });
export async function readJson(req) { try { return await req.json(); } catch { return {}; } }
