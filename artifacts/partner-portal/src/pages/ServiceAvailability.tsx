import { useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthHeaders } from "@/hooks/use-auth";
import {
  MapPin, Search, AlertCircle, CheckCircle, Loader2,
  ExternalLink, Map, Wifi, Zap, Radio, Satellite, Globe, ArrowDownUp
} from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
];

const TECH_CONFIG: Record<string, { icon: any; cardBg: string; cardBorder: string; labelText: string; badge: string; iconColor: string }> = {
  Fiber:              { icon: Zap,     cardBg: "bg-emerald-50",  cardBorder: "border-emerald-200", labelText: "text-emerald-700", badge: "bg-emerald-100 text-emerald-800", iconColor: "text-emerald-600" },
  Cable:              { icon: Wifi,    cardBg: "bg-orange-50",   cardBorder: "border-orange-200",  labelText: "text-orange-700",  badge: "bg-orange-100 text-orange-800",  iconColor: "text-orange-600"  },
  DSL:                { icon: Globe,   cardBg: "bg-blue-50",     cardBorder: "border-blue-200",    labelText: "text-blue-700",    badge: "bg-blue-100 text-blue-800",      iconColor: "text-blue-600"    },
  "Fixed Wireless":   { icon: Radio,   cardBg: "bg-purple-50",   cardBorder: "border-purple-200",  labelText: "text-purple-700",  badge: "bg-purple-100 text-purple-800",  iconColor: "text-purple-600"  },
  Satellite:          { icon: Satellite,cardBg: "bg-slate-50",   cardBorder: "border-slate-200",   labelText: "text-slate-600",   badge: "bg-slate-100 text-slate-700",    iconColor: "text-slate-500"   },
};

function fallbackConfig(tech: string) {
  return TECH_CONFIG[tech] ?? { icon: Globe, cardBg: "bg-slate-50", cardBorder: "border-slate-200", labelText: "text-slate-600", badge: "bg-slate-100 text-slate-700", iconColor: "text-slate-500" };
}

function formatSpeed(mbps: number | null | undefined): string {
  if (!mbps) return "N/A";
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(mbps % 1000 === 0 ? 0 : 1)} Gbps`;
  return `${mbps} Mbps`;
}

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

interface AvailabilityResult {
  location: { address: string; latitude: number; longitude: number };
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
  fccMapUrl: string;
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

  // Group providers by technology
  const techGroups: Record<string, IspProvider[]> = {};
  if (result) {
    for (const p of result.providers) {
      if (!techGroups[p.technology]) techGroups[p.technology] = [];
      techGroups[p.technology].push(p);
    }
  }

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
            Check which internet providers serve a customer's address.
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
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Phoenix"
                  required
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
                disabled={loading || !address.trim() || !city.trim() || !state}
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
          <div className="sf-card p-4 border-red-200 bg-red-50 flex gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Address confirmed + summary */}
            <div className="sf-card p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{result.location.address}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.summary.hasFiber && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><Zap className="w-3 h-3" /> Fiber</span>}
                    {result.summary.hasCable && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><Wifi className="w-3 h-3" /> Cable</span>}
                    {result.summary.hasDSL && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Globe className="w-3 h-3" /> DSL</span>}
                    {result.summary.hasFixedWireless && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><Radio className="w-3 h-3" /> Fixed Wireless</span>}
                    {result.summary.hasSatellite && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"><Satellite className="w-3 h-3" /> Satellite</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-[#032d60]">{result.summary.totalProviders}</p>
                  <p className="text-xs text-muted-foreground">provider{result.summary.totalProviders !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>

            {/* Provider groups by technology */}
            {result.summary.totalProviders === 0 ? (
              <div className="sf-card p-8 text-center">
                <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">No providers found</p>
                <p className="text-sm text-muted-foreground">No broadband providers were found for this address.</p>
              </div>
            ) : (
              Object.entries(techGroups).map(([tech, providers]) => {
                const cfg = fallbackConfig(tech);
                const Icon = cfg.icon;
                return (
                  <div key={tech} className={`sf-card overflow-hidden border ${cfg.cardBorder}`}>
                    <div className={`px-4 py-3 flex items-center gap-2 border-b ${cfg.cardBorder} ${cfg.cardBg}`}>
                      <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                      <span className={`text-sm font-semibold ${cfg.labelText}`}>{tech}</span>
                      <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {providers.length} provider{providers.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="divide-y divide-[#e5e7eb]">
                      {providers.map((p) => (
                        <div key={`${p.providerId}-${p.technology}`} className="px-4 py-3 bg-white flex flex-wrap items-center gap-x-6 gap-y-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{p.brandName}</p>
                            <p className="text-xs text-muted-foreground">{p.technologyDetail}</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                            <span className="flex items-center gap-1">
                              <ArrowDownUp className="w-3 h-3" />
                              <span className="font-medium text-foreground">{formatSpeed(p.maxDownload)}</span>
                              <span>↓</span>
                              <span className="font-medium text-foreground">{formatSpeed(p.maxUpload)}</span>
                              <span>↑</span>
                            </span>
                            {p.lowLatency && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">Low Latency</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {/* FCC map link */}
            <div className="flex gap-2">
              <a
                href={result.fccMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition px-3 py-2 border border-border rounded-lg bg-white"
              >
                <Map className="w-3.5 h-3.5" />
                View on FCC Broadband Map
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
              <a
                href={result.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition px-3 py-2 border border-border rounded-lg bg-white"
              >
                <MapPin className="w-3.5 h-3.5" />
                View on Google Maps
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>

            <p className="text-xs text-muted-foreground text-center pb-2">
              Broadband availability data sourced from FCC BDC filings. Updated regularly.
            </p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
