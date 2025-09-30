interface CountryResponse {
  country?: {
    names?: {
      en?: string;
    };
  };
}

interface LogEntry {
  id: string;
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
  openTimestampAt: string;
}