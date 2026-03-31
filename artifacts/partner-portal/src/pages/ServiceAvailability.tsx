import { useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthHeaders } from "@/hooks/use-auth";
import { MapPin, Search, AlertCircle, CheckCircle, Loader2, ExternalLink, Map, Navigation } from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
];

interface AvailabilityResult {
  location: { address: string; latitude: number; longitude: number };
  fccMapUrl: string;
  fccLocationUrl: string;
  googleMapsUrl: string;
}

export default function ServiceAvailability() {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !state) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams({ address: address.trim(), state });
      if (city.trim()) params.set("city", city.trim());
      if (zip.trim()) params.set("zip", zip.trim());

      const res = await fetch(`/api/service-availability?${params}`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to retrieve availability data");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#032d60]/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#032d60]" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Service Availability</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Check which internet providers serve a customer's address using FCC broadband data.
          </p>
        </div>

        {/* Search Form */}
        <div className="sf-card p-5 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Street Address *</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. 123 Main St"
                required
                className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#0176d3]/30 focus:border-[#0176d3]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Phoenix"
                  className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#0176d3]/30 focus:border-[#0176d3]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">State *</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  required
                  className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#0176d3]/30 focus:border-[#0176d3]"
                >
                  <option value="">Select state</option>
                  {US_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">ZIP Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  placeholder="e.g. 85001"
                  maxLength={10}
                  className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#0176d3]/30 focus:border-[#0176d3]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !address.trim() || !state}
                className="sf-btn sf-btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
                ) : (
                  <><Search className="w-4 h-4" /> Check Availability</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="sf-card p-4 border-red-200 bg-red-50 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Location confirmed */}
            <div className="sf-card p-4 flex items-center gap-3 border-emerald-200 bg-emerald-50">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-800 mb-0.5">Address Verified</p>
                <p className="text-sm font-medium text-emerald-900 truncate">{result.location.address}</p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  {result.location.latitude.toFixed(5)}, {result.location.longitude.toFixed(5)}
                </p>
              </div>
            </div>

            {/* FCC map links */}
            <div className="sf-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <p className="font-semibold text-sm text-foreground">View Broadband Availability</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Open the FCC National Broadband Map to see all ISPs and speeds at this address.
                </p>
              </div>
              <div className="p-4 space-y-2.5">
                <a
                  href={result.fccLocationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-[#032d60] text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-[#032d60]/90 transition"
                >
                  <span className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    FCC Broadband Map — Location Detail
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
                <a
                  href={result.fccMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-white text-[#032d60] border border-[#032d60]/20 px-4 py-3 rounded-lg text-sm font-medium hover:bg-[#032d60]/5 transition"
                >
                  <span className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    FCC Broadband Map — Area View
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
                <a
                  href={result.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-white text-muted-foreground border border-border px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted/30 transition"
                >
                  <span className="flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    View on Google Maps
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center pb-2">
              FCC broadband data is updated periodically. The map shows all ISPs serving this address along with available speeds and technology types.
            </p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
