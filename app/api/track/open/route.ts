import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
// import {generateUniqueId, getUserAgentInfo } from '@/lib/trackingUtils' // Adjust path if needed
import { getClientIp } from '@/lib/tracking/clientIp'
import { getGeoInfoFromIp } from '@/lib/tracking/geoInfo'
import { getUserAgentInfo } from '@/lib/tracking/userAgent'
import { generateUniqueId } from '@/lib/tracking/UniqueID'


// 1x1 transparent PNG pixel as base64
const PIXEL_DATA = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='


const LOG_FILE_PATH = path.join(process.cwd(), 'email_opens.json')

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
  
  // Read existing logs
  let logs = readLogs();
  const now = new Date().toISOString();
  
  // Find existing record for this email
  const existingIndex = logs.findIndex((log) => log.email === email);
  let logEntry: LogEntry;
  
  if (existingIndex === -1) {
    // New record
    logEntry = {
      id: generateUniqueId(),
      email,
      offerId, // Included in file log for reference
      ipAdr,
      country,
      city,
      isp,
      device,
      os,
      browser,
      createdAt: now,
      updatedAt: now,
      openTimestampAt: now
    };
    logs.push(logEntry);
  } else {
    // Update existing record
    logEntry = { ...logs[existingIndex] };
    logEntry.ipAdr = ipAdr; // Update to latest IP
    logEntry.country = country; // Update to latest country
    logEntry.city = city; // Update to latest city
    logEntry.isp = isp; // Update to latest isp
    logEntry.device = device; // Update to latest device
    logEntry.os = os; // Update to latest os
    logEntry.browser = browser; // Update to latest browser
    logEntry.offerId = offerId; // Update if needed
    logEntry.updatedAt = now;
    logEntry.openTimestampAt = now;
    logs[existingIndex] = logEntry;
  }
  
  // Write updated logs
  writeLogs(logs);
  
  // Return pixel
  const pixelBuffer = Buffer.from(PIXEL_DATA, 'base64');
  
  return new NextResponse(pixelBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': pixelBuffer.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}