import React, { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2, CheckCircle, Clock, XCircle, DollarSign,
  ExternalLink, RefreshCw, TrendingUp, Link2, AlertTriangle
} from "lucide-react";

interface Campaign {
  CampaignId: string;
  CampaignName: string;
  AdvertiserId: string;
  AdvertiserName: string;
  AdvertiserUrl: string;
  CampaignUrl: string;
  CampaignDescription: string;
  ContractStatus: string;
  TrackingLink: string;
  CampaignLogoUri: string;
  AllowsDeeplinking: string;
}

interface TrackingLink {
  Id: string;
  CampaignId: string;
  AdvertiserName: string;
  Name: string;
  TrackingLink: string;
  LandingPageUrl: string;
  Status: string;
}

interface ActionEntry {
  CampaignId: string;
  CampaignName: string;
  AdvertiserName: string;
  ActionDate: string;
  Status: string;
  Payout: number;
  SaleAmount: number;
  OrderId: string;
}

interface Summary {
  campaigns: Campaign[];
  trackingLinks: TrackingLink[];
  actions: ActionEntry[];
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    pendingCampaigns: number;
    totalEarnings: number;
    pendingEarnings: number;
    totalActions: number;
  };
}

const STATUS_STYLE: Record<string, string> = {
  Active:      "bg-green-100 text-green-700",
  Pending:     "bg-amber-100 text-amber-700",
  Applied:     "bg-blue-100 text-blue-700",
  Declined:    "bg-red-100 text-red-700",
  Deactivated: "bg-gray-100 text-gray-600",
  APPROVED:    "bg-green-100 text-green-700",
  PENDING:     "bg-amber-100 text-amber-700",
  REVERSED:    "bg-red-100 text-red-700",
};

function statusIcon(s: string) {
  if (s === "Active" || s === "APPROVED") return <CheckCircle className="w-3 h-3" />;
  if (s === "Pending" || s === "Applied" || s === "PENDING") return <Clock className="w-3 h-3" />;
  return <XCircle className="w-3 h-3" />;
}

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AdminImpact() {
  const { user } = useAuth();
  const headers = getAuthHeaders();
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"campaigns" | "links" | "earnings">("campaigns");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/impact/summary", { headers });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to load Impact data");
      }
      setData(await res.json());
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Impact.com</h1>
            <p className="text-sm text-gray-500 mt-1">
              Live affiliate program data from your Impact publisher account.
            </p>
          </div>
          <button
            onClick={load}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-gray-500 py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading from Impact.com…
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Impact API Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <p className="text-xs text-red-400 mt-1">Check that your Account SID and Auth Token are correct.</p>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: "Total Programs", value: data.stats.totalCampaigns, icon: Link2, color: "blue" },
                { label: "Active", value: data.stats.activeCampaigns, icon: CheckCircle, color: "green" },
                { label: "Pending Approval", value: data.stats.pendingCampaigns, icon: Clock, color: "amber" },
                { label: "Approved Earnings (30d)", value: fmt(data.stats.totalEarnings), icon: DollarSign, color: "emerald" },
                { label: "Pending Earnings (30d)", value: fmt(data.stats.pendingEarnings), icon: TrendingUp, color: "purple" },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tab bar */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit text-sm">
              {(["campaigns", "links", "earnings"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 font-medium capitalize transition ${tab === t ? "bg-[#032d60] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  {t === "campaigns" ? `Programs (${data.campaigns.length})` :
                   t === "links" ? `Tracking Links (${data.trackingLinks.length})` :
                   `Earnings (${data.actions.length})`}
                </button>
              ))}
            </div>

            {/* Campaigns tab */}
            {tab === "campaigns" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.campaigns.length === 0 && (
                  <p className="text-sm text-gray-400 col-span-2 text-center py-12">
                    No programs found. Apply to programs in your Impact publisher dashboard.
                  </p>
                )}
                {data.campaigns.map(c => (
                  <Card key={c.CampaignId} className={`border ${c.ContractStatus === "Active" ? "border-green-200 bg-green-50/20" : "border-gray-200"}`}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{c.AdvertiserName}</p>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[c.ContractStatus] ?? "bg-gray-100 text-gray-600"}`}>
                          {statusIcon(c.ContractStatus)} {c.ContractStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{c.CampaignName}</p>
                      {c.CampaignDescription && (
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{c.CampaignDescription}</p>
                      )}
                      {c.TrackingLink && (
                        <div className="flex items-center gap-2 pt-1">
                          <p className="text-xs font-mono text-blue-600 truncate flex-1">{c.TrackingLink}</p>
                          <button
                            onClick={() => navigator.clipboard.writeText(c.TrackingLink)}
                            className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition shrink-0"
                          >
                            Copy
                          </button>
                          <a href={c.TrackingLink} target="_blank" rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-[#032d60] text-white rounded hover:opacity-90 transition">
                            <ExternalLink className="w-3 h-3" /> Open
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Tracking Links tab */}
            {tab === "links" && (
              <div className="space-y-2">
                {data.trackingLinks.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-12">
                    No tracking links yet. Links appear once you're approved for a program.
                  </p>
                )}
                {data.trackingLinks.map(l => (
                  <Card key={l.Id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-gray-900">{l.AdvertiserName}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[l.Status] ?? "bg-gray-100 text-gray-600"}`}>{l.Status}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{l.Name}</p>
                          <p className="text-xs font-mono text-blue-600 mt-1 break-all">{l.TrackingLink}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => navigator.clipboard.writeText(l.TrackingLink)}
                            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
                          >
                            Copy
                          </button>
                          <a href={l.LandingPageUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-[#032d60] text-white rounded hover:opacity-90 transition">
                            <ExternalLink className="w-3 h-3" /> Visit
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Earnings tab */}
            {tab === "earnings" && (
              <div className="space-y-2">
                {data.actions.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-12">
                    No conversions in the last 30 days yet.
                  </p>
                )}
                {data.actions.map((a, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{a.AdvertiserName || a.CampaignName}</p>
                        <p className="text-xs text-gray-500">{a.ActionDate?.split("T")[0]} · Order {a.OrderId || "—"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">{fmt(a.Payout)}</p>
                          {a.SaleAmount > 0 && <p className="text-xs text-gray-400">Sale: {fmt(a.SaleAmount)}</p>}
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[a.Status] ?? "bg-gray-100 text-gray-600"}`}>
                          {a.Status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PortalLayout>
  );
}
