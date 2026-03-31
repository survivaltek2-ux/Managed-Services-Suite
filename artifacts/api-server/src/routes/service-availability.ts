import { Router, Response } from "express";
import { requirePartnerAuth, PartnerRequest } from "../middlewares/partnerAuth.js";

const router = Router();

interface CensusMatch {
  matchedAddress: string;
  coordinates: { x: number; y: number };
}

async function geocodeAddress(address: string, city?: string, state?: string, zip?: string): Promise<CensusMatch | null> {
  const oneLineAddress = [address, city, state, zip].filter(Boolean).join(", ");
  const params = new URLSearchParams({
    address: oneLineAddress,
    benchmark: "2020",
    format: "json",
  });

  const res = await fetch(`https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?${params}`);
  if (!res.ok) return null;

  const data = await res.json();
  const matches: CensusMatch[] = data?.result?.addressMatches ?? [];
  return matches.length > 0 ? matches[0] : null;
}

function buildFccMapUrl(lat: number, lon: number, addr: string): string {
  const params = new URLSearchParams({
    addr,
    lat: lat.toFixed(6),
    lon: lon.toFixed(6),
    unit: "ft",
    speed: "25",
    tech: "300",
    zoom: "14",
  });
  return `https://broadbandmap.fcc.gov/home?${params}`;
}

function buildFccLocationUrl(lat: number, lon: number, addr: string): string {
  const params = new URLSearchParams({
    addr,
    lat: lat.toFixed(6),
    lon: lon.toFixed(6),
    unit: "ft",
    speed: "25",
    tech: "300",
    zoom: "14",
  });
  return `https://broadbandmap.fcc.gov/location-summary/fixed?${params}`;
}

router.get("/service-availability", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const { address, city, state, zip } = req.query as Record<string, string>;

    if (!address || !state) {
      res.status(400).json({ error: "validation_error", message: "address and state are required" });
      return;
    }

    const match = await geocodeAddress(address, city, state, zip);

    if (!match) {
      res.status(404).json({
        error: "location_not_found",
        message: "This address could not be verified. Please check the address and try again.",
      });
      return;
    }

    const lat = match.coordinates.y;
    const lon = match.coordinates.x;
    const formattedAddress = match.matchedAddress;

    res.json({
      location: {
        address: formattedAddress,
        latitude: lat,
        longitude: lon,
      },
      fccMapUrl: buildFccMapUrl(lat, lon, formattedAddress),
      fccLocationUrl: buildFccLocationUrl(lat, lon, formattedAddress),
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
    });
  } catch (err: any) {
    console.error("[Service Availability] Error:", err);
    res.status(500).json({ error: "server_error", message: "An unexpected error occurred" });
  }
});

export default router;
