import { useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { MapPin, Search, Wifi, Zap, Radio, Satellite, Globe, AlertCircle, CheckCircle, ArrowDownUp, Loader2 } from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
];

const TECH_ICONS: Record<string, any> = {
  "Fiber": Zap,
  "Cable": Wifi,
  "DSL": Globe,
  "Fixed Wireless": Radio,
  "Licensed Fixed Wireless": Radio,
  "Satellite": Satellite,
  "Licensed Satellite": Satellite,
};

const TECH_COLORS: Record<string, string> = {
  "Fiber": "bg-emerald-50 border-emerald-200 text-emerald-700",
  "Cable": "bg-orange-50 border-orange-200 text-orange-700",
  "DSL": "bg-blue-50 border-blue-200 text-blue-700",
  "Fixed Wireless": "bg-purple-50 border-purple-200 text-purple-700",
  "Licensed Fixed Wireless": "bg-purple-50 border-purple-200 text-purple-700",
  "Satellite": "bg-slate-50 border-slate-200 text-slate-700",
  "Licensed Satellite": "bg-slate-50 border-slate-200 text-slate-700",
};

const TECH_BADGE: Record<string, string> = {
  "Fiber": "bg-emerald-100 text-emerald-800",
  "Cable": "bg-orange-100 text-orange-800",
  "DSL": "bg-blue-100 text-blue-800",
  "Fixed Wireless": "bg-purple-100 text-purple-800",
  "Licensed Fixed Wireless": "bg-purple-100 text-purple-800",
  "Satellite": "bg-slate-100 text-slate-700",
  "Licensed Satellite": "bg-slate-100 text-slate-700",
};

function formatSpeed(mbps: number | null | undefined): string {
  if (!mbps) return "N/A";
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(1)} Gbps`;
  return `${mbps} Mbps`;
}

interface Provider {
  providerName: string;
  technology: string;
  technologyCode: number;
  maxDownloadSpeed: number;
  maxUploadSpeed: number;
  lowLatency: boolean;
}

interface AvailabilityResult {
  location: { address: string; locationId: string; latitude: number; longitude: number };
  providers: Provider[];
  total: number;
}

export default function ServiceAvailability() {
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !state) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setNotConfigured(false);

    try {
      const params = new URLSearchParams({ address: address.trim(), state });
      if (city.trim()) params.set("city", city.trim());
      if (zip.trim()) params.set("zip", zip.trim());

      const res = await fetch(`/api/service-availability?${params}`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "fcc_not_configured") {
          setNotConfigured(true);
        } else {
          setError(data.message || "Failed to retrieve availability data");
        }
        return;
      }

      setResult(data);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const techGroups = result
    ? result.providers.reduce((acc: Record<string, Provider[]>, p) => {
        if (!acc[p.technology]) acc[p.technology] = [];
        acc[p.technology].push(p);
        return acc;
      }, {})
    : {};

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

        {/* Not Configured Notice */}
        {notConfigured && (
          <div className="sf-card p-5 border-amber-200 bg-amber-50">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-amber-800 mb-1">FCC API Credentials Required</p>
                <p className="text-sm text-amber-700 mb-3">
                  To use this feature, you need a free FCC broadband account and API token.
                </p>
                <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside mb-3">
                  <li>Register for a free account at <a href="https://broadbandmap.fcc.gov" target="_blank" rel="noreferrer" className="underline font-medium">broadbandmap.fcc.gov</a></li>
                  <li>Log in → click your username → <strong>Manage API Access</strong> → Generate token</li>
                  <li>Add <code className="bg-amber-100 px-1 rounded text-xs">FCC_USERNAME</code> (your email) and <code className="bg-amber-100 px-1 rounded text-xs">FCC_API_TOKEN</code> to your environment settings</li>
                </ol>
                <p className="text-xs text-amber-600">The FCC API is free and covers all 50 US states with data updated every ~6 months.</p>
              </div>
            </div>
          </div>
        )}

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
            <div className="sf-card p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{result.location.address}</p>
                <p className="text-xs text-muted-foreground">FCC Location ID: {result.location.locationId}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-[#032d60]">{result.total}</p>
                <p className="text-xs text-muted-foreground">provider{result.total !== 1 ? "s" : ""} found</p>
              </div>
            </div>

            {result.total === 0 ? (
              <div className="sf-card p-8 text-center">
                <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">No providers found</p>
                <p className="text-sm text-muted-foreground">No broadband providers reported serving this location in the FCC database.</p>
              </div>
            ) : (
              Object.entries(techGroups).map(([tech, providers]) => {
                const Icon = TECH_ICONS[tech] || Globe;
                const cardClass = TECH_COLORS[tech] || "bg-slate-50 border-slate-200 text-slate-700";
                const badgeClass = TECH_BADGE[tech] || "bg-slate-100 text-slate-700";
                return (
                  <div key={tech} className={`sf-card overflow-hidden border ${cardClass.split(" ")[1]}`}>
                    <div className={`px-4 py-3 flex items-center gap-2 border-b ${cardClass.split(" ")[1]} ${cardClass.split(" ")[0]}`}>
                      <Icon className={`w-4 h-4 ${cardClass.split(" ")[2]}`} />
                      <span className={`text-sm font-semibold ${cardClass.split(" ")[2]}`}>{tech}</span>
                      <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
                        {providers.length} provider{providers.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="divide-y divide-[#e5e7eb]">
                      {providers.map((p, i) => (
                        <div key={i} className="px-4 py-3 bg-white flex flex-wrap items-center gap-x-6 gap-y-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{p.providerName}</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ArrowDownUp className="w-3 h-3" />
                              <span className="font-medium text-foreground">{formatSpeed(p.maxDownloadSpeed)}</span>
                              <span>↓</span>
                              <span className="font-medium text-foreground">{formatSpeed(p.maxUploadSpeed)}</span>
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

            <p className="text-xs text-muted-foreground text-center pb-2">
              Data sourced from the FCC Broadband Data Collection (BDC) — updated approximately every 6 months.
            </p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
