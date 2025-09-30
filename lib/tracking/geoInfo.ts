import maxmind, { CountryResponse, CityResponse, AsnResponse } from 'maxmind';
import path from 'path';

// Paths to MaxMind DBs
const DB_PATH_COUNTRY = path.join(process.cwd(), 'resources', 'maxmind-dbs', 'GeoLite2-Country.mmdb');
const DB_PATH_CITY = path.join(process.cwd(), 'resources', 'maxmind-dbs', 'GeoLite2-City.mmdb');
const DB_PATH_ISP = path.join(process.cwd(), 'resources', 'maxmind-dbs', 'GeoIP2-ISP.mmdb');

export async function getGeoInfoFromIp(ip: string): Promise<{ country: string; city: string; isp: string }> {
  if (ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return { country: "Unknown", city: "Unknown", isp: "Unknown" };
  }

  let country = "Unknown";
  let city = "Unknown";
  let isp = "Unknown";

  try {
    // Country lookup
    const countryLookup = await maxmind.open<CountryResponse>(DB_PATH_COUNTRY);
    const countryResult = countryLookup.get(ip);
    country = countryResult?.country?.names?.en || "Unknown";
  } catch (err) {
    console.error("MaxMind country lookup error:", err);
  }

  try {
    // City lookup
    const cityLookup = await maxmind.open<CityResponse>(DB_PATH_CITY);
    const cityResult = cityLookup.get(ip);
    city = cityResult?.city?.names?.en ||
           cityResult?.country?.names?.en ||
           cityResult?.subdivisions?.[0]?.names?.en || // Fallback to region/subdivision
           "Unknown";
  } catch (err) {
    console.error("MaxMind city lookup error:", err);
  }

  try {
    // ISP lookup
    const ispLookup = await maxmind.open<AsnResponse>(DB_PATH_ISP);
    const ispResult = ispLookup.get(ip);
    isp = ispResult?.autonomous_system_organization || "Unknown";
  } catch (err) {
    console.error("MaxMind ISP lookup error:", err);
  }

  return { country, city, isp };
}
