import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
  Loader2, CheckCircle, XCircle, RefreshCw, AlertTriangle, Link2, Webhook, Key,
} from "lucide-react";
import { format } from "date-fns";

interface Status {
  configured: boolean;
  webhookConfigured: boolean;
  connection: {
    ok: boolean;
    reachable: boolean;
    accountHint: string | null;
    sampleSize: number;
    error: string | null;
  };
  config: {
    lastPushAt: string | null;
    lastPullAt: string | null;
    lastError: string | null;
    lastErrorAt: string | null;
    totalPartnersSynced: number;
    totalCommissionsSynced: number;
  };
  syncedPartnerCount: number;
}

interface SyncLogEntry {
  id: number;
  direction: string;
  kind: string;
  success: boolean;
  partnerCount: number;
  transactionCount: number;
  message: string | null;
  ranAt: string;
}

interface SyncedPartner {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  status: string;
  partnerstackKey: string | null;
  partnerstackSyncedAt: string | null;
}

interface WebhookEvent {
  id: number;
  eventId: string;
  eventType: string;
  status: string;
  error: string | null;
  receivedAt: string;
  processedAt: string | null;
}

function authHeaders(): Record<string, string> {
  const t = localStorage.getItem("partner_token");
  return t ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

function fmtTs(s: string | null): string {
  if (!s) return "Never";
  try { return format(new Date(s), "MMM d, yyyy h:mm a"); } catch { return s; }
}

export default function AdminPartnerstack() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [status, setStatus] = useState<Status | null>(null);
  const [partners, setPartners] = useState<SyncedPartner[]>([]);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [syncLog, setSyncLog] = useState<SyncLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Admin guard (mirrors AdminPlans pattern)
  useEffect(() => {
    if (!isLoading && user && !user.isAdmin) {
      setLocation("/dashboard");
    }
  }, [isLoading, user, setLocation]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, e, l] = await Promise.all([
        fetch(`/api/admin/partnerstack/status`, { headers: authHeaders() }).then(r => r.json()),
        fetch(`/api/admin/partnerstack/partners`, { headers: authHeaders() }).then(r => r.json()),
        fetch(`/api/admin/partnerstack/webhook-events`, { headers: authHeaders() }).then(r => r.json()),
        fetch(`/api/admin/partnerstack/sync-log`, { headers: authHeaders() }).then(r => r.json()),
      ]);
      setStatus(s);
      setPartners(p.partners || []);
      setEvents(e.events || []);
      setSyncLog(l.entries || []);
    } catch (err: any) {
      toast({ title: "Failed to load", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user?.isAdmin) loadAll();
  }, [user, loadAll]);

  async function runSync() {
    setSyncing(true);
    try {
      const res = await fetch(`/api/admin/partnerstack/sync`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Sync failed");
      toast({
        title: "Sync complete",
        description: `Pulled ${data.partnersPulled} partners, ${data.transactionsPulled} transactions`,
      });
      await loadAll();
    } catch (err: any) {
      toast({ title: "Sync failed", description: err.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  }

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!user.isAdmin) return null;

  return (
    <PortalLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">PartnerStack Sync</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Two-way sync between internal partners and PartnerStack
            </p>
          </div>
          <Button onClick={runSync} disabled={syncing || !status?.configured}>
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sync Now
          </Button>
        </div>

        {loading && !status ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
          </div>
        ) : status ? (
          <>
            {/* Connection status banner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5" /> Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!status.configured ? (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-900">Not configured</div>
                      <div className="text-sm text-amber-800 mt-1">
                        Add the <code className="px-1 bg-white rounded">PARTNERSTACK_PUBLIC_KEY</code> and{" "}
                        <code className="px-1 bg-white rounded">PARTNERSTACK_SECRET_KEY</code> secrets to enable sync.
                      </div>
                    </div>
                  </div>
                ) : status.connection.ok ? (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-green-900">
                        Connected
                        {status.connection.accountHint && (
                          <span className="ml-2 text-xs font-normal text-green-700">
                            (account: <code className="font-mono">{status.connection.accountHint}</code>)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-green-800 mt-1">
                        PartnerStack API is reachable (sampled {status.connection.sampleSize} partners). Webhook secret:{" "}
                        {status.webhookConfigured ? (
                          <span className="font-medium">configured</span>
                        ) : (
                          <span className="font-medium text-amber-700">missing — incoming webhooks will be rejected for security</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-red-900">Connection failed</div>
                      <div className="text-sm text-red-800 mt-1 break-all">
                        {status.connection.error || "Unknown error"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Synced Partners" value={String(status.syncedPartnerCount)} icon={<Key className="w-5 h-5" />} />
              <StatCard label="Last Push" value={fmtTs(status.config.lastPushAt)} />
              <StatCard label="Last Pull" value={fmtTs(status.config.lastPullAt)} />
              <StatCard label="Total Events" value={String(events.length)} icon={<Webhook className="w-5 h-5" />} />
            </div>

            {status.config.lastError && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-red-900">Last error · {fmtTs(status.config.lastErrorAt)}</div>
                      <div className="text-sm text-red-800 mt-1 break-all">{status.config.lastError}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Synced partners */}
            <Card>
              <CardHeader>
                <CardTitle>Synced Partners</CardTitle>
              </CardHeader>
              <CardContent>
                {partners.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center">No partners loaded.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                        <tr>
                          <th className="py-2 pr-3">Company</th>
                          <th className="py-2 pr-3">Contact</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2 pr-3">PartnerStack Key</th>
                          <th className="py-2 pr-3">Last Synced</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partners.slice(0, 50).map(p => (
                          <tr key={p.id} className="border-b last:border-0">
                            <td className="py-2 pr-3 font-medium">{p.companyName}</td>
                            <td className="py-2 pr-3">{p.contactName}<br /><span className="text-xs text-muted-foreground">{p.email}</span></td>
                            <td className="py-2 pr-3 capitalize">{p.status}</td>
                            <td className="py-2 pr-3 font-mono text-xs">
                              {p.partnerstackKey ? (
                                <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded">{p.partnerstackKey.slice(0, 16)}…</span>
                              ) : (
                                <span className="text-muted-foreground">— not synced —</span>
                              )}
                            </td>
                            <td className="py-2 pr-3 text-xs text-muted-foreground">{fmtTs(p.partnerstackSyncedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sync log */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sync Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {syncLog.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center">
                    No sync activity yet. Push or pull operations will appear here.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                        <tr>
                          <th className="py-2 pr-3">When</th>
                          <th className="py-2 pr-3">Direction</th>
                          <th className="py-2 pr-3">Kind</th>
                          <th className="py-2 pr-3">Result</th>
                          <th className="py-2 pr-3">Counts</th>
                          <th className="py-2 pr-3">Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {syncLog.map(s => (
                          <tr key={s.id} className="border-b last:border-0">
                            <td className="py-2 pr-3 text-xs">{fmtTs(s.ranAt)}</td>
                            <td className="py-2 pr-3 capitalize">{s.direction}</td>
                            <td className="py-2 pr-3">{s.kind}</td>
                            <td className="py-2 pr-3">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${s.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {s.success ? "ok" : "failed"}
                              </span>
                            </td>
                            <td className="py-2 pr-3 text-xs text-muted-foreground">
                              {s.partnerCount > 0 && `${s.partnerCount}p `}
                              {s.transactionCount > 0 && `${s.transactionCount}t`}
                            </td>
                            <td className="py-2 pr-3 text-xs max-w-md truncate">{s.message || ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Webhook events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Webhook Events</CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center">
                    No webhook events received yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                        <tr>
                          <th className="py-2 pr-3">Type</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2 pr-3">Received</th>
                          <th className="py-2 pr-3">Processed</th>
                          <th className="py-2 pr-3">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map(e => (
                          <tr key={e.id} className="border-b last:border-0">
                            <td className="py-2 pr-3 font-medium">{e.eventType}</td>
                            <td className="py-2 pr-3">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                e.status === "processed" ? "bg-green-100 text-green-800" :
                                e.status === "failed" ? "bg-red-100 text-red-800" :
                                "bg-blue-100 text-blue-800"
                              }`}>{e.status}</span>
                            </td>
                            <td className="py-2 pr-3 text-xs">{fmtTs(e.receivedAt)}</td>
                            <td className="py-2 pr-3 text-xs">{fmtTs(e.processedAt)}</td>
                            <td className="py-2 pr-3 text-xs text-red-700 max-w-xs truncate">{e.error || ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </PortalLayout>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase text-muted-foreground">{label}</div>
            <div className="text-lg font-semibold mt-1">{value}</div>
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
