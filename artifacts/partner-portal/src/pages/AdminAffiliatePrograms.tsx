import React, { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink, CheckCircle, Clock, DollarSign } from "lucide-react";

interface AffiliateProgram {
  slug: string;
  category: string;
  rateUsd: number;
  percentRate: string | null;
  commissionType: string;
  network: string;
  affiliateSignupUrl: string;
  isLive: boolean;
  notes: string;
}

interface ProgramData {
  programs: AffiliateProgram[];
  totalLive: number;
  totalPending: number;
}

const CATEGORY_ORDER = [
  "Residential ISP",
  "Business Connectivity",
  "VoIP & Communications",
  "Cybersecurity",
  "VPN & Network Security",
  "Password Management",
  "Backup & Storage",
  "Home Security",
  "Consumer Antivirus",
  "Identity Protection",
  "Cloud Productivity",
  "Web Hosting & Domains",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Residential ISP":        "bg-blue-100 text-blue-800",
  "Business Connectivity":  "bg-indigo-100 text-indigo-800",
  "VoIP & Communications":  "bg-green-100 text-green-800",
  "Cybersecurity":          "bg-red-100 text-red-800",
  "VPN & Network Security": "bg-purple-100 text-purple-800",
  "Password Management":    "bg-amber-100 text-amber-800",
  "Backup & Storage":       "bg-slate-100 text-slate-700",
  "Home Security":          "bg-orange-100 text-orange-800",
  "Consumer Antivirus":     "bg-rose-100 text-rose-800",
  "Identity Protection":    "bg-teal-100 text-teal-800",
  "Cloud Productivity":     "bg-sky-100 text-sky-800",
  "Web Hosting & Domains":  "bg-lime-100 text-lime-800",
};

function commissionLabel(p: AffiliateProgram): string {
  if (p.commissionType === "negotiated") return "Negotiated";
  if (p.commissionType === "percent_sale" && p.percentRate) return `${p.percentRate} per sale`;
  if (p.commissionType === "per_lead") return `$${p.rateUsd}/lead`;
  if (p.rateUsd > 0) return `$${p.rateUsd}/sale`;
  return "—";
}

export default function AdminAffiliatePrograms() {
  const { user } = useAuth();
  const headers = getAuthHeaders();
  const [data, setData] = useState<ProgramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "live" | "pending">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/affiliate/programs", { headers })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setError("Failed to load program catalog."))
      .finally(() => setLoading(false));
  }, []);

  const grouped = React.useMemo(() => {
    if (!data) return {};
    const programs = data.programs.filter(p => {
      if (filter === "live" && !p.isLive) return false;
      if (filter === "pending" && p.isLive) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      return true;
    });
    const map: Record<string, AffiliateProgram[]> = {};
    for (const p of programs) {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    }
    return map;
  }, [data, filter, categoryFilter]);

  const totalFiltered = Object.values(grouped).flat().length;

  return (
    <PortalLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Program Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">
            All affiliate programs tracked by Siebert Services. Pending = link not yet activated; click the sign-up link to apply.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading programs…
          </div>
        )}
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>}

        {data && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Live Programs</p>
                    <p className="text-2xl font-bold text-gray-900">{data.totalLive}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-amber-100 p-3 rounded-full"><Clock className="w-5 h-5 text-amber-600" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Sign-up</p>
                    <p className="text-2xl font-bold text-gray-900">{data.totalPending}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full"><DollarSign className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Total Programs</p>
                    <p className="text-2xl font-bold text-gray-900">{data.programs.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
                {(["all", "live", "pending"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 font-medium transition capitalize ${filter === f ? "bg-[#032d60] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white"
              >
                <option value="all">All Categories</option>
                {CATEGORY_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-sm text-gray-400">{totalFiltered} program{totalFiltered !== 1 ? "s" : ""}</span>
            </div>

            {/* Programs grouped by category */}
            {CATEGORY_ORDER.filter(cat => grouped[cat]?.length > 0).map(cat => (
              <div key={cat}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{cat}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {grouped[cat].map(p => (
                    <Card key={p.slug} className={`border ${p.isLive ? "border-green-200 bg-green-50/30" : "border-gray-200"}`}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 capitalize">{p.slug.replace(/-/g, " ")}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[p.category] ?? "bg-gray-100 text-gray-600"}`}>
                              {p.category}
                            </span>
                          </div>
                          <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${p.isLive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {p.isLive ? <><CheckCircle className="w-3 h-3" /> Live</> : <><Clock className="w-3 h-3" /> Pending</>}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium text-blue-700">{commissionLabel(p)}</span>
                          <span className="text-gray-400">via {p.network}</span>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed">{p.notes}</p>

                        {!p.isLive && (
                          <a
                            href={p.affiliateSignupUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#032d60] hover:underline mt-1"
                          >
                            Apply Now <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {totalFiltered === 0 && (
              <p className="text-sm text-gray-400 text-center py-12">No programs match the current filters.</p>
            )}
          </>
        )}
      </div>
    </PortalLayout>
  );
}
