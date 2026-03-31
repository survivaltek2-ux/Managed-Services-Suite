import { Router, Response } from "express";
import { requirePartnerAuth, PartnerRequest } from "../middlewares/partnerAuth.js";

const router = Router();

const TECH_CODES: Record<number, { label: string; color: string }> = {
  10: { label: "DSL", color: "blue" },
  40: { label: "Cable", color: "orange" },
  50: { label: "Fiber", color: "green" },
  70: { label: "Fixed Wireless", color: "purple" },
  71: { label: "Fixed Wireless", color: "purple" },
  300: { label: "Licensed Fixed Wireless", color: "purple" },
  301: { label: "Licensed Fixed Wireless", color: "purple" },
  400: { label: "Fixed Wireless", color: "purple" },
  500: { label: "Licensed Satellite", color: "gray" },
  600: { label: "Satellite", color: "gray" },
  700: { label: "Other", color: "gray" },
};

router.get("/service-availability", requirePartnerAuth, async (req: PartnerRequest, res: Response) => {
  try {
    const { address, city, state, zip } = req.query as Record<string, string>;

    if (!address || !state) {
      res.status(400).json({ error: "validation_error", message: "address and state are required" });
      return;
    }

    const username = process.env.FCC_USERNAME;
    const hashValue = process.env.FCC_API_TOKEN;

    if (!username || !hashValue) {
      res.status(503).json({
        error: "fcc_not_configured",
        message: "FCC broadband API credentials are not yet configured. Please set FCC_USERNAME and FCC_API_TOKEN in your environment settings.",
      });
      return;
    }

    const fccHeaders = { username, hash_value: hashValue };

    const locationParams = new URLSearchParams();
    locationParams.set("address", address);
    if (city) locationParams.set("city", city);
    locationParams.set("state", state);
    if (zip) locationParams.set("zip", zip);
    locationParams.set("unit", "ft");
    locationParams.set("radius", "500");
    locationParams.set("limit", "5");

    const locationRes = await fetch(
      `https://broadbandmap.fcc.gov/api/public/map/listLocations?${locationParams}`,
      { headers: fccHeaders }
    );

    if (!locationRes.ok) {
      const errText = await locationRes.text();
      console.error("[Service Availability] FCC location error:", locationRes.status, errText);
      res.status(502).json({ error: "fcc_location_error", message: "Failed to locate address in FCC database" });
      return;
    }

    const locationData = await locationRes.json();

    if (!locationData.data || locationData.data.length === 0) {
      res.status(404).json({
        error: "location_not_found",
        message: "This address could not be found in the FCC broadband database. Try adjusting the address or zip code.",
      });
      return;
    }

    const location = locationData.data[0];
    const locationId = location.location_id;

    const availRes = await fetch(
      `https://broadbandmap.fcc.gov/api/public/map/listAvailability?location_id=${locationId}`,
      { headers: fccHeaders }
    );

    if (!availRes.ok) {
      const errText = await availRes.text();
      console.error("[Service Availability] FCC availability error:", availRes.status, errText);
      res.status(502).json({ error: "fcc_availability_error", message: "Failed to retrieve availability data" });
      return;
    }

    const availData = await availRes.json();

    const providers = (availData.data || []).map((p: any) => ({
      providerName: p.provider_name || p.doing_business_as_name || "Unknown Provider",
      technology: TECH_CODES[p.technology_code]?.label ?? `Tech ${p.technology_code}`,
      technologyCode: Number(p.technology_code),
      maxDownloadSpeed: p.max_advertised_download_speed,
      maxUploadSpeed: p.max_advertised_upload_speed,
      lowLatency: p.low_latency === true || p.low_latency === 1,
    }));

    providers.sort((a: any, b: any) => {
      const order = [50, 40, 70, 300, 301, 400, 10, 500, 600, 700, 71];
      return (order.indexOf(a.technologyCode) ?? 99) - (order.indexOf(b.technologyCode) ?? 99);
    });

    res.json({
      location: {
        address: location.address_primary || `${address}${city ? `, ${city}` : ""}, ${state}${zip ? ` ${zip}` : ""}`,
        locationId,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      providers,
      total: providers.length,
    });
  } catch (err: any) {
    console.error("[Service Availability] Error:", err);
    res.status(500).json({ error: "server_error", message: "An unexpected error occurred" });
  }
});

export default router;
