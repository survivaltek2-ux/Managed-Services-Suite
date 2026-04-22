import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Search,
  FileText,
  FileSignature,
  Download,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CustomerSummary = {
  key: string;
  name: string;
  documentCount: number;
  planCount: number;
  totalCount: number;
  lastActivityAt: string | null;
};

type CustomerDoc = {
  id: number;
  name: string;
  description: string | null;
  filename: string;
  mimeType: string;
  size: number;
  category: string;
  customerCompany: string;
  tags: string;
  createdAt: string;
};

type CustomerPlan = {
  id: number;
  planNumber: string;
  version: number;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  status: string;
  sentAt: string | null;
  approvedAt: string | null;
  createdAt: string;
};

type CustomerDetail = {
  key: string;
  name: string;
  documents: CustomerDoc[];
  plans: CustomerPlan[];
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const PLAN_STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  call_requested: "bg-purple-100 text-purple-800",
};

function CustomerListView() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/customers", { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setCustomers(data.customers || []);
      } catch (err) {
        if (!cancelled) {
          toast({ variant: "destructive", title: "Failed to load customers" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.name.toLowerCase().includes(q));
  }, [customers, search]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Every company that has a generated MSA, an uploaded document, or a written plan on file.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers…"
                className="pl-9"
                data-testid="input-customer-search"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "customer" : "customers"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
              Loading customers…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {customers.length === 0
                ? "No customers yet. Generate an MSA or written plan to populate this list."
                : "No customers match that search."}
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((c) => (
                <Link
                  key={c.key}
                  href={`/admin/customers/${encodeURIComponent(c.key)}`}
                  data-testid={`link-customer-${c.key}`}
                >
                  <a className="flex items-center justify-between py-3 px-2 -mx-2 rounded hover:bg-muted/40 cursor-pointer">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>
                          {c.documentCount} {c.documentCount === 1 ? "document" : "documents"}
                        </span>
                        <span>
                          {c.planCount} {c.planCount === 1 ? "written plan" : "written plans"}
                        </span>
                        {c.lastActivityAt && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Last activity {formatDate(c.lastActivityAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </a>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CustomerDetailView({ customerKey }: { customerKey: string }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/customers/${encodeURIComponent(customerKey)}`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) toast({ variant: "destructive", title: "Failed to load customer" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customerKey, toast]);

  const downloadDoc = async (doc: CustomerDoc) => {
    setDownloading(doc.id);
    try {
      const res = await fetch(`/api/admin/documents/${doc.id}/download`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ variant: "destructive", title: "Download failed" });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <button
          onClick={() => navigate("/admin/customers")}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"
          data-testid="button-back-customers"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all customers
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-customer-name">
              {loading ? "…" : data?.name || customerKey}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              All MSAs, contracts, and written plans on file for this customer.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
          Loading…
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                Documents ({data?.documents.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.documents.length ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No documents on file. Generate an MSA at{" "}
                  <Link href="/admin/msa-generator">
                    <a className="text-blue-700 hover:underline">MSA Generator</a>
                  </Link>{" "}
                  to add one.
                </p>
              ) : (
                <div className="divide-y">
                  {data.documents.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between py-3"
                      data-testid={`row-document-${d.id}`}
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{d.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                          <span className="capitalize">{d.category}</span>
                          <span>{formatBytes(d.size)}</span>
                          <span>{formatDate(d.createdAt)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDoc(d)}
                        disabled={downloading === d.id}
                        data-testid={`button-download-${d.id}`}
                      >
                        {downloading === d.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSignature className="w-4 h-4" />
                Written Plans ({data?.plans.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.plans.length ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No written plans on file. Create one at{" "}
                  <Link href="/admin/plans">
                    <a className="text-blue-700 hover:underline">Written Plans</a>
                  </Link>
                  .
                </p>
              ) : (
                <div className="divide-y">
                  {data.plans.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between py-3"
                      data-testid={`row-plan-${p.id}`}
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {p.planNumber}
                          {p.version > 1 && (
                            <span className="text-muted-foreground"> v{p.version}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>{p.clientName}</span>
                          <span>{p.clientEmail}</span>
                          <span>Created {formatDate(p.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            PLAN_STATUS_COLOR[p.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {p.status.replace("_", " ")}
                        </span>
                        <Link href="/admin/plans">
                          <a
                            className="text-xs text-blue-700 hover:underline"
                            data-testid={`link-plan-${p.id}`}
                          >
                            Open
                          </a>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function AdminCustomers() {
  const { user } = useAuth();
  const [match, params] = useRoute<{ key: string }>("/admin/customers/:key");

  if (!user || !user.isAdmin) {
    return (
      <PortalLayout>
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      {match && params?.key ? (
        <CustomerDetailView customerKey={decodeURIComponent(params.key)} />
      ) : (
        <CustomerListView />
      )}
    </PortalLayout>
  );
}
