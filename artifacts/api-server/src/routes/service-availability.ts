import { Router, Response } from "express";
import { requirePartnerAuth, PartnerRequest } from "../middlewares/partnerAuth.js";

const router = Router();

const TECH_ORDER: Record<string, number> = {
  Fiber: 0,
  Cable: 1,
  DSL: 2,
  "Fixed Wireless": 3,
  "Licensed Fixed Wireless": 3,
  Satellite: 4,
  Other: 5,
};

interface IspProvider {
  providerId: string;
  brandName: string;
  technology: string;
  technologyCode: number;
  technologyDetail: string;
  maxDownload: number;
  maxUpload: number;
  lowLatency: boolean;
  locationCount?: number;
}

interface ApiResponseData {
  address: {
    input: string;
    matched: string;
    components: { streetAddress: string; city: string; state: string; zip: string };
  };
  coordinates: { lat: number; lng: number };
  providers: IspProvider[];
  summary: {
    totalProviders: number;
    totalOptions: number;
    hasFiber: boolean;
    hasCable: boolean;
    hasDSL: boolean;
    hasFixedWireless: boolean;
    hasSatellite: boolean;
    maxDownloadSpeed: number;
    maxUploadSpeed: number;
    state: string;
  };
}

router.get("/service-availability", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const { address, city, state, zip } = req.query as Record<string, string>;

    if (!address || !state) {
      res.status(400).json({ error: "validation_error", message: "Address and state are required." });
      return;
    }

    // Build formatted address string (city is strongly recommended)
    const parts = [address.trim()];
    if (city?.trim()) parts.push(city.trim());
    parts.push(state.trim());
    if (zip?.trim()) parts.push(zip.trim());
    const formattedAddress = parts.join(", ");

    const apiUrl = `https://www.internetproviders.ai/api/availability?address=${encodeURIComponent(formattedAddress)}`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SiebertServices/1.0)",
        "Accept": "application/json",
      },
      redirect: "follow",
    });

    if (!apiRes.ok) {
      console.error("[Service Availability] External API error:", apiRes.status);
      res.status(502).json({ error: "upstream_error", message: "Could not reach the broadband data service. Please try again." });
      return;
    }

    const data = await apiRes.json();

    if (!data.success) {
      const msg = data.error || "Address not found";
      if (msg.toLowerCase().includes("not find") || msg.toLowerCase().includes("valid")) {
        res.status(404).json({
          error: "address_not_found",
          message: "This address could not be found. Please include city and state (e.g., 123 Main St, Nashville, TN).",
        });
      } else {
        res.status(422).json({ error: "lookup_failed", message: msg });
      }
      return;
    }

    const d: ApiResponseData = data.data;

    // Deduplicate providers (same brand + technology → keep highest speeds)
    const seen = new Map<string, IspProvider>();
    for (const p of (d.providers || [])) {
      const key = `${p.providerId}-${p.technology}`;
      const existing = seen.get(key);
      if (!existing || p.maxDownload > existing.maxDownload) {
        seen.set(key, p);
      }
    }

    const providers = Array.from(seen.values()).sort((a, b) => {
      const ao = TECH_ORDER[a.technology] ?? 5;
      const bo = TECH_ORDER[b.technology] ?? 5;
      if (ao !== bo) return ao - bo;
      return b.maxDownload - a.maxDownload;
    });

    res.json({
      location: {
        address: d.address.matched,
        latitude: d.coordinates.lat,
        longitude: d.coordinates.lng,
      },
      providers,
      summary: d.summary,
      fccMapUrl: `https://broadbandmap.fcc.gov/home?addr=${encodeURIComponent(d.address.matched)}&lat=${d.coordinates.lat.toFixed(6)}&lon=${d.coordinates.lng.toFixed(6)}&unit=ft&speed=25&tech=300&zoom=14`,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${d.coordinates.lat},${d.coordinates.lng}`,
    });
  } catch (err: any) {
    console.error("[Service Availability] Error:", err);
    res.status(500).json({ error: "server_error", message: "An unexpected error occurred." });
  }
});

export default router;
