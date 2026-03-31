import { Router, Request, Response } from "express";

const router = Router();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

router.get("/places/autocomplete", async (req: Request, res: Response) => {
  const { input } = req.query as Record<string, string>;

  if (!input?.trim()) {
    res.json({ predictions: [] });
    return;
  }

  if (!GOOGLE_PLACES_API_KEY) {
    res.status(503).json({ error: "Places API not configured" });
    return;
  }

  try {
    const params = new URLSearchParams({
      input: input.trim(),
      key: GOOGLE_PLACES_API_KEY,
      components: "country:us",
      types: "address",
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
    );
    const data = await response.json();

    res.json({
      predictions: (data.predictions || []).map((p: any) => ({
        place_id: p.place_id,
        description: p.description,
        main_text: p.structured_formatting?.main_text || p.description,
        secondary_text: p.structured_formatting?.secondary_text || "",
      })),
      status: data.status,
    });
  } catch (err) {
    console.error("[Places] Autocomplete error:", err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

router.get("/places/details", async (req: Request, res: Response) => {
  const { place_id } = req.query as Record<string, string>;

  if (!place_id) {
    res.status(400).json({ error: "place_id required" });
    return;
  }

  if (!GOOGLE_PLACES_API_KEY) {
    res.status(503).json({ error: "Places API not configured" });
    return;
  }

  try {
    const params = new URLSearchParams({
      place_id,
      key: GOOGLE_PLACES_API_KEY,
      fields: "address_components,geometry",
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`
    );
    const data = await response.json();

    if (data.status !== "OK") {
      res.status(404).json({ error: "Place not found", status: data.status });
      return;
    }

    const components: Array<{ long_name: string; short_name: string; types: string[] }> =
      data.result.address_components || [];

    const get = (type: string, nameType: "long_name" | "short_name" = "long_name") =>
      components.find((c) => c.types.includes(type))?.[nameType] || "";

    res.json({
      address: `${get("street_number")} ${get("route")}`.trim(),
      city: get("locality") || get("sublocality") || get("neighborhood"),
      state: get("administrative_area_level_1", "short_name"),
      zip: get("postal_code"),
      lat: data.result.geometry?.location?.lat || null,
      lng: data.result.geometry?.location?.lng || null,
    });
  } catch (err) {
    console.error("[Places] Details error:", err);
    res.status(500).json({ error: "Failed to fetch place details" });
  }
});

export default router;
