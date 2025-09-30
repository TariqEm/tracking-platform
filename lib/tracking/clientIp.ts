import { NextRequest } from 'next/server';

// Get client IP (headers first, ipify fallback for local dev) - No changes
export async function getClientIp(req: NextRequest): Promise<string> {
  // 1. Try headers (production-friendly)
  let ip = 'unknown';
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  }
  const cfIP = req.headers.get('cf-connecting-ip');
  const realIP = req.headers.get('x-real-ip');
  if (cfIP && cfIP !== '::1') ip = cfIP;
  else if (realIP && realIP !== '::1') ip = realIP;

  // 2. Fallback to ipify if 'unknown' or local (for dev testing)
  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      if (!res.ok) throw new Error('Failed to fetch IP from ipify');
      const data = await res.json() as { ip: string };
      ip = data.ip; // ip = "93.44.210.xxx" //
    } catch (err) {
      console.error('ipify fallback error:', err);
      ip = 'unknown';
    }
  }

  return ip;
}