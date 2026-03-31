import { Router, Response } from "express";
import { requirePartnerAuth, PartnerRequest } from "../middlewares/partnerAuth.js";

const router = Router();

const NETOMNIA_API_KEY = process.env.NETOMNIA_API_KEY || "";

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

async function tryInternetProvidersAi(formattedAddress: string): Promise<{ success: boolean; data?: ApiResponseData; error?: string }> {
  try {
    const apiUrl = `https://www.internetproviders.ai/api/availability?address=${encodeURIComponent(formattedAddress)}`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SiebertServices/1.0)",
        "Accept": "application/json",
      },
      redirect: "follow",
    });

    let data: any;
    try {
      data = await apiRes.json();
    } catch {
      return { success: false, error: "Failed to parse response" };
    }

    if (!data.success) {
      return { success: false, error: data.error || "Address not found" };
    }

    return { success: true, data: data.data };
  } catch (err: any) {
    console.error("[Service Availability] internetproviders.ai error:", err.message);
    return { success: false, error: err.message };
  }
}

async function tryNetomnia(address: string, city: string, state: string, zip: string): Promise<{ success: boolean; data?: ApiResponseData; error?: string }> {
  if (!NETOMNIA_API_KEY) {
    return { success: false, error: "Netomnia API not configured" };
  }

  try {
    const formattedAddress = [address.trim(), city.trim(), state.trim(), zip.trim()].filter(Boolean).join(" ");
    const apiUrl = `https://api.netomnia.com/v1/checkavailability`;
    
    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NETOMNIA_API_KEY}`,
      },
      body: JSON.stringify({
        address: formattedAddress,
        region: state, // US state code
      }),
    });

    if (!apiRes.ok) {
      return { success: false, error: `Netomnia API returned ${apiRes.status}` };
    }

    let data: any;
    try {
      data = await apiRes.json();
    } catch {
      return { success: false, error: "Failed to parse Netomnia response" };
    }

    if (!data.availability || data.availability.length === 0) {
      return { success: false, error: "No providers found" };
    }

    // Transform Netomnia response to match our format
    const providers: IspProvider[] = data.availability.map((p: any, idx: number) => ({
      providerId: p.provider_id || `netomnia-${idx}`,
      brandName: p.provider_name || "Unknown",
      technology: p.technology || "Other",
      technologyCode: getTechCode(p.technology),
      technologyDetail: p.technology_detail || p.technology || "Unknown",
      maxDownload: p.max_download_speed || 0,
      maxUpload: p.max_upload_speed || 0,
      lowLatency: p.latency < 30,
    }));

    return {
      success: true,
      data: {
        address: {
          input: formattedAddress,
          matched: data.matched_address || formattedAddress,
          components: { streetAddress: address, city, state, zip },
        },
        coordinates: data.coordinates || { lat: 0, lng: 0 },
        providers,
        summary: {
          totalProviders: providers.length,
          totalOptions: providers.length,
          hasFiber: providers.some(p => p.technology.includes("Fiber")),
          hasCable: providers.some(p => p.technology.includes("Cable")),
          hasDSL: providers.some(p => p.technology.includes("DSL")),
          hasFixedWireless: providers.some(p => p.technology.includes("Wireless")),
          hasSatellite: providers.some(p => p.technology.includes("Satellite")),
          maxDownloadSpeed: Math.max(...providers.map(p => p.maxDownload), 0),
          maxUploadSpeed: Math.max(...providers.map(p => p.maxUpload), 0),
          state,
        },
      },
    };
  } catch (err: any) {
    console.error("[Service Availability] Netomnia error:", err.message);
    return { success: false, error: err.message };
  }
}

function getTechCode(tech: string): number {
  const map: Record<string, number> = {
    Fiber: 50,
    Cable: 40,
    DSL: 10,
    "Fixed Wireless": 70,
    Satellite: 60,
  };
  return map[tech] || 0;
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

    // Try primary provider first
    console.log("[Service Availability] Trying internetproviders.ai for:", formattedAddress);
    let result = await tryInternetProvidersAi(formattedAddress);

    // If primary fails with "not found", try failover
    if (!result.success && result.error?.toLowerCase().includes("not find")) {
      console.log("[Service Availability] Primary failed, trying Netomnia failover...");
      result = await tryNetomnia(address, city || "", state, zip || "");
    }

    // Handle final result
    if (!result.success) {
      const msg = result.error || "Address not found";
      if (msg.toLowerCase().includes("not find")) {
        res.status(404).json({
          error: "address_not_found",
          message: "This address could not be found in available databases. Please verify the address and try again.",
        });
      } else {
        res.status(422).json({ error: "lookup_failed", message: msg });
      }
      return;
    }

    const d = result.data!;

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
