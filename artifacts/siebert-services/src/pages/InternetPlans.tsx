import { useState } from "react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import {
  MapPin, Search, AlertCircle, CheckCircle, Loader2,
  ExternalLink, Map, Wifi, Zap, Radio, Satellite, Globe, ArrowDownUp, Server
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
  affiliateUrl?: string;
  affiliateButtonLabel?: string;
  minPlanPrice?: { amount_cents: number; currency: string };
}

interface AvailabilityResult {
  location: { address: string; latitude: number; longitude: number };
  providers: IspProvider[];
  summary: {
    totalProviders: number;
    maxDownloadSpeed: number;
    state: string;
  };
  fccMapUrl: string;
}

export default function InternetPlans() {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [userType, setUserType] = useState<"business" | "home" | null>(null);

  const handleAddressSelect = (result: { address: string; city: string; state: string; zip: string; lat: number; lng: number }) => {
    setAddress(result.address);
    setCity(result.city);
    setState(result.state);
    setZip(result.zip);
  };

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

      const res = await fetch(`/api/service-availability?${params}`);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#032d60] to-[#0176d3] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Find Internet Providers Near You</h1>
          <p className="text-lg text-blue-100">Compare speeds, technologies, and plans available at your address</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
              <AddressAutocomplete
                value={address}
                onChange={setAddress}
                onAddressSelect={handleAddressSelect}
                placeholder="Enter your street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="City"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0176d3]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0176d3]"
                >
                  <option value="">Select state</option>
                  {US_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  placeholder="ZIP code"
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0176d3]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !address.trim() || !city.trim() || !state}
              className="w-full bg-[#0176d3] hover:bg-[#0160b0] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</>
              ) : (
                <><Search className="w-5 h-5" /> Find Available Providers</>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Address Confirmation */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-900">{result.location.address}</p>
                  <p className="text-sm text-green-700 mt-1">Confirmed location</p>
                </div>
                <button
                  onClick={() => {
                    setResult(null);
                    setUserType(null);
                    setAddress("");
                    setCity("");
                    setState("");
                    setZip("");
                  }}
                  className="text-sm text-green-600 hover:text-green-800 font-semibold"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Business vs Home Chooser - Show if userType not selected */}
            {!userType ? (
              <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Is this location for a business or home?</h3>
                <p className="text-center text-gray-600 mb-8">We'll show you the right options based on your needs.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Option */}
                  <button
                    onClick={() => setUserType("business")}
                    className="p-8 border-2 border-gray-300 rounded-lg hover:border-[#032d60] hover:bg-[#032d60]/5 transition group"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#032d60]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#032d60]/20 transition">
                        <Server className="w-8 h-8 text-[#032d60]" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Business / Office</h4>
                      <p className="text-sm text-gray-600">High-speed business fiber, dedicated circuits, and enterprise-grade support</p>
                    </div>
                  </button>

                  {/* Home Option */}
                  <button
                    onClick={() => setUserType("home")}
                    className="p-8 border-2 border-gray-300 rounded-lg hover:border-[#0176d3] hover:bg-[#0176d3]/5 transition group"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#0176d3]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0176d3]/20 transition">
                        <Wifi className="w-8 h-8 text-[#0176d3]" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Home / Residential</h4>
                      <p className="text-sm text-gray-600">Broadband options for home use, gaming, streaming, and remote work</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : userType === "business" ? (
              /* BUSINESS FLOW - Show business-grade providers */
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  <p className="font-semibold mb-1">Affiliate Disclosure</p>
                  <p>We may receive a referral commission when you order service through links on this page. This helps support our website at no additional cost to you. We can also manage installation and security setup for your business.</p>
                </div>

                {(() => {
                  // Filter providers for business: prioritize Fiber and high-speed options
                  const businessProviders = result.providers.filter(
                    p => ["Fiber", "Fixed Wireless", "Cable"].includes(p.technology) && p.maxDownload >= 25
                  );
                  
                  // Group by technology
                  const businessTechGroups: Record<string, typeof result.providers> = {};
                  for (const p of businessProviders) {
                    if (!businessTechGroups[p.technology]) businessTechGroups[p.technology] = [];
                    businessTechGroups[p.technology].push(p);
                  }

                  return (
                    <>
                      <p className="text-gray-600 font-semibold">
                        {businessProviders.length} business-grade provider{businessProviders.length !== 1 ? 's' : ''} available
                      </p>

                      {businessProviders.length === 0 ? (
                        <div className="text-center py-12">
                          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-lg font-semibold text-gray-700">No business-grade providers found</p>
                          <p className="text-gray-600 mt-2">Unfortunately, there are no qualifying business internet providers available for this address. Please contact us for custom solutions.</p>
                          <a
                            href="/contact"
                            className="inline-block mt-4 bg-[#032d60] hover:bg-[#0160b0] text-white font-semibold py-2 px-6 rounded-lg transition"
                          >
                            Contact Our Team
                          </a>
                        </div>
                      ) : (
                        Object.entries(businessTechGroups).map(([tech, providers]) => {
                          const cfg = fallbackConfig(tech);
                          const Icon = cfg.icon;
                          return (
                            <div key={tech} className={`border rounded-lg overflow-hidden ${cfg.cardBorder}`}>
                              <div className={`px-4 py-3 flex items-center gap-2 ${cfg.cardBg}`}>
                                <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                                <h3 className={`text-lg font-semibold ${cfg.labelText}`}>{tech}</h3>
                                <span className={`ml-auto text-sm font-medium px-3 py-1 rounded-full ${cfg.badge}`}>
                                  {providers.length}
                                </span>
                              </div>
                              <div className="divide-y divide-gray-200">
                                {providers.map((p) => (
                                  <div key={`${p.providerId}-${p.technology}`} className="px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                      <h4 className="text-lg font-semibold text-gray-900">{p.brandName}</h4>
                                      <p className="text-sm text-gray-600">{p.technologyDetail}</p>
                                      {p.minPlanPrice && (
                                        <p className="text-sm font-semibold text-emerald-600 mt-1">
                                          From ${(p.minPlanPrice.amount_cents / 100).toFixed(2)}/mo
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                      <div className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-900">{formatSpeed(p.maxDownload)}</span>
                                        <span> down / </span>
                                        <span className="font-semibold text-gray-900">{formatSpeed(p.maxUpload)}</span>
                                        <span> up</span>
                                        {p.lowLatency && (
                                          <span className="ml-3 inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-1 rounded">Low Latency</span>
                                        )}
                                      </div>
                                      {p.affiliateUrl && (
                                        <a
                                          href={p.affiliateUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="bg-[#032d60] hover:bg-[#0160b0] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm whitespace-nowrap"
                                        >
                                          {p.affiliateButtonLabel || "Get Started"}
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}

                      {/* Links */}
                      <div className="flex gap-3 justify-center">
                        <a
                          href={result.fccMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#032d60] hover:text-[#0160b0] font-semibold flex items-center gap-2"
                        >
                          <Map className="w-4 h-4" />
                          View on FCC Map
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </>
                  );
                })()}
              </>
            ) : (
              /* HOME FLOW - Show consumer ISP results */
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  <p className="font-semibold mb-1">Affiliate Disclosure</p>
                  <p>We may receive a referral commission when you order service through links on this page. This helps support our website at no additional cost to you.</p>
                </div>

                <p className="text-gray-600 font-semibold">
                  {result.summary.totalProviders} provider{result.summary.totalProviders !== 1 ? 's' : ''} available • Max speed: {formatSpeed(result.summary.maxDownloadSpeed)}
                </p>

                {/* Providers Grid by Technology */}
                {result.summary.totalProviders === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-gray-700">No providers found</p>
                    <p className="text-gray-600 mt-2">Unfortunately, there are no broadband providers available for this address.</p>
                  </div>
                ) : (
                  Object.entries(techGroups).map(([tech, providers]) => {
                    const cfg = fallbackConfig(tech);
                    const Icon = cfg.icon;
                    return (
                      <div key={tech} className={`border rounded-lg overflow-hidden ${cfg.cardBorder}`}>
                        <div className={`px-4 py-3 flex items-center gap-2 ${cfg.cardBg}`}>
                          <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                          <h3 className={`text-lg font-semibold ${cfg.labelText}`}>{tech}</h3>
                          <span className={`ml-auto text-sm font-medium px-3 py-1 rounded-full ${cfg.badge}`}>
                            {providers.length}
                          </span>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {providers.map((p) => (
                            <div key={`${p.providerId}-${p.technology}`} className="px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">{p.brandName}</h4>
                                <p className="text-sm text-gray-600">{p.technologyDetail}</p>
                                {p.minPlanPrice && (
                                  <p className="text-sm font-semibold text-emerald-600 mt-1">
                                    From ${(p.minPlanPrice.amount_cents / 100).toFixed(2)}/mo
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="text-sm text-gray-600">
                                  <span className="font-semibold text-gray-900">{formatSpeed(p.maxDownload)}</span>
                                  <span> down / </span>
                                  <span className="font-semibold text-gray-900">{formatSpeed(p.maxUpload)}</span>
                                  <span> up</span>
                                  {p.lowLatency && (
                                    <span className="ml-3 inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-1 rounded">Low Latency</span>
                                  )}
                                </div>
                                {p.affiliateUrl && (
                                  <a
                                    href={p.affiliateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#0176d3] hover:bg-[#0160b0] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm whitespace-nowrap"
                                  >
                                    {p.affiliateButtonLabel || "Get Started"}
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Links */}
                <div className="flex gap-3 justify-center">
                  <a
                    href={result.fccMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0176d3] hover:text-[#0160b0] font-semibold flex items-center gap-2"
                  >
                    <Map className="w-4 h-4" />
                    View on FCC Map
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-12 px-4 mt-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-gray-900">What speeds do I need?</summary>
              <p className="text-gray-600 mt-3">For most households: 25-100 Mbps is adequate for streaming and browsing. For heavy use or multiple devices, 100+ Mbps is recommended.</p>
            </details>
            <details className="bg-white rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-gray-900">What's the difference between technologies?</summary>
              <p className="text-gray-600 mt-3">
                <strong>Fiber:</strong> Fastest and most reliable. <br/>
                <strong>Cable:</strong> Good speeds, widely available. <br/>
                <strong>DSL:</strong> Slower, but available in many areas. <br/>
                <strong>Fixed Wireless:</strong> Good alternative when wired options unavailable.
              </p>
            </details>
            <details className="bg-white rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-gray-900">Is this data accurate?</summary>
              <p className="text-gray-600 mt-3">We query multiple sources to provide the most comprehensive and current provider data available. However, availability can change, so we recommend confirming with providers directly.</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
