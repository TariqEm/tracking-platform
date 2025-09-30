import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getClientIp } from '@/lib/tracking/clientIp'
import { getGeoInfoFromIp } from '@/lib/tracking/geoInfo'
import { getUserAgentInfo } from '@/lib/tracking/userAgent'


// Path to the JSON log file (created automatically if missing)
const LOG_FILE_PATH = path.join(process.cwd(), 'email_unsubscribes.json')


// Interface for log entry (matching enhanced open/click structure)
interface LogEntry {
  id: number; // Auto-increment per email
  email: string;
  offerId: string;
  ipAdr: string;
  country: string;
  city: string;
  isp: string;
  device: string;
  os: string;
  browser: string;
  createdAt: string;
  updatedAt: string;
  unsubscribedAt: string;
}


// Read logs from file
function readLogs(): LogEntry[] {
  try {
    if (!fs.existsSync(LOG_FILE_PATH)) return [];
    const data = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
    return JSON.parse(data) as LogEntry[];
  } catch (e) {
    return [];
  }
}


// Write logs to file
function writeLogs(logs: LogEntry[]): void {
  fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
}


// Get next auto-increment ID for the email
function getNextId(email: string): number {
  const logs = readLogs();
  const emailLogs = logs.filter((log) => log.email === email);
  if (emailLogs.length === 0) return 1;
  return Math.max(...emailLogs.map((l) => l.id)) + 1;
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const offerId = searchParams.get('offerId')
  
  if (!email) {
    return new NextResponse('Missing email query parameter', { status: 400 })
  }
  if (!offerId) {
    return new NextResponse('Missing offerId query parameter', { status: 400 })
  }
  
  // Get client IP and geo info (country, city, isp)
  const ipAdr = await getClientIp(request);
  const { country, city, isp } = await getGeoInfoFromIp(ipAdr);
  
  // Get user-agent info (device, os, browser)
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const { device, os, browser } = getUserAgentInfo(userAgent);
  
  // Generate auto-increment ID per email
  const id = getNextId(email);
  const now = new Date().toISOString();
  
  // Create new record
  const logEntry: LogEntry = {
    id,
    email,
    offerId,
    ipAdr,
    country,
    city,
    isp,
    device,
    os,
    browser,
    createdAt: now,
    updatedAt: now,
    unsubscribedAt: now
  };
  
  // Add to logs
  const logs = readLogs();
  logs.push(logEntry);
  writeLogs(logs);
  
  // Redirect to Google
  return NextResponse.redirect('https://www.google.com', 302);
}
