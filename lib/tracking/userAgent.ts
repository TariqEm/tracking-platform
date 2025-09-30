export function getUserAgentInfo(userAgent: string): { device: string; os: string; browser: string } {
  // Simple regex-based fallback parser (basic detection)
  let device = "Desktop";
  let os = "Unknown";
  let browser = "Unknown";

  // Browser detection
  if (/Firefox\//.test(userAgent)) {
    browser = "Firefox";
  } else if (/OPR\//.test(userAgent) || /Opera\//.test(userAgent)) {
    browser = "Opera";
  } else if (/Edg\//.test(userAgent)) {
    browser = "Edge";
  } else if (/Chrome\//.test(userAgent) && !/Edg\//.test(userAgent) && !/OPR\//.test(userAgent)) {
    browser = "Chrome";
  } else if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) {
    browser = "Safari";
  } else if (/MSIE /.test(userAgent) || /Trident\/.*rv:/.test(userAgent)) {
    browser = "Internet Explorer";
  }

  // OS detection
  if (/Windows NT ([\d.]+)/.test(userAgent)) {
    os = `Windows`;
  } else if (/Macintosh/.test(userAgent)) {
    os = "macOS";
  } else if (/Linux/.test(userAgent)) {
    os = "Linux";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
    device = "Mobile";
  } else if (/iPhone|iPad/.test(userAgent)) {
    os = "iOS";
    device = "Mobile";
  }

  return { device, os, browser };
}
