import { useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import {
  useDeals, useCreateDeal, useResolveTsdMatches, useDealTsdLogs, useRetryTsdPush,
  type Deal, type TsdMatch, type TsdSyncLog,
} from "@/hooks/use-deals";
import { formatCurrency } from "@/lib/utils";
import {
  Plus, Search, List, Columns3, X, ChevronDown, Filter, ChevronRight,
  RefreshCw, CheckCircle, AlertCircle, Clock, ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

const STAGES = ["prospect", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"];
const STAGE_COLORS: Record<string, string> = {
  prospect: "#0176d3",
  qualification: "#1b96ff",
  proposal: "#fe9339",
  negotiation: "#9050e9",
  closed_won: "#2e844a",
  closed_lost: "#ea001e",
};

const TSD_LABELS: Record<string, string> = {
  avant: "Avant",
  telarus: "Telarus",
  intelisys: "Intelisys",
};

export default function Deals() {
  const { data: deals = [], isLoading } = useDeals();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [expandedDealId, setExpandedDealId] = useState<number | null>(null);

  const filteredDeals = deals.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalLayout>
      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">Deals</h1>
            <span className="text-xs text-muted-foreground">{filteredDeals.length} items</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-border rounded overflow-hidden">
              <button onClick={() => setView("list")} aria-label="List view" className={`p-1.5 ${view === "list" ? "bg-[#0176d3] text-white" : "bg-white text-muted-foreground hover:bg-[#f3f3f3]"}`}>
                <List className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setView("kanban")} aria-label="Kanban view" className={`p-1.5 ${view === "kanban" ? "bg-[#0176d3] text-white" : "bg-white text-muted-foreground hover:bg-[#f3f3f3]"}`}>
                <Columns3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <button onClick={() => setShowModal(true)} className="sf-btn sf-btn-primary">
              <Plus className="w-3.5 h-3.5" /> New Deal
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sf-input pl-8"
            />
          </div>
          <button className="sf-btn sf-btn-neutral">
            <Filter className="w-3.5 h-3.5" /> Filters <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {view === "list" ? (
          <div className="sf-card overflow-x-auto">
            <table className="w-full sf-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Deal Name</th>
                  <th>Customer</th>
                  <th className="text-right">Est. Value</th>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>TSD Routing</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                ) : filteredDeals.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No deals found. Register your first deal to get started.</td></tr>
                ) : (
                  filteredDeals.map((deal) => (
                    <>
                      <tr
                        key={deal.id}
                        className="cursor-pointer hover:bg-[#f3f3f3]"
                        onClick={() => setExpandedDealId(expandedDealId === deal.id ? null : deal.id)}
                      >
                        <td className="w-6">
                          <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expandedDealId === deal.id ? "rotate-90" : ""}`} />
                        </td>
                        <td className="font-medium text-[#0176d3]">{deal.title}</td>
                        <td>{deal.customerName}</td>
                        <td className="text-right font-semibold">{formatCurrency(deal.estimatedValue)}</td>
                        <td>
                          <span className="sf-badge capitalize" style={{ backgroundColor: `${STAGE_COLORS[deal.stage] || '#706e6b'}15`, color: STAGE_COLORS[deal.stage] || '#706e6b' }}>
                            {deal.stage.replace('_', ' ')}
                          </span>
                        </td>
                        <td><StatusBadge status={deal.status} /></td>
                        <td><TsdRoutingBadges tsdTargets={deal.tsdTargets} /></td>
                        <td className="text-muted-foreground text-xs">{format(new Date(deal.createdAt), 'MMM d, yyyy')}</td>
                      </tr>
                      {expandedDealId === deal.id && (
                        <tr key={`${deal.id}-detail`}>
                          <td colSpan={8} className="p-0">
                            <DealTsdDetail dealId={deal.id} tsdTargets={deal.tsdTargets} />
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGES.map(stage => {
              const stageDeals = filteredDeals.filter(d => d.stage === stage);
              const stageTotal = stageDeals.reduce((s, d) => s + parseFloat(String(d.estimatedValue) || "0"), 0);
              return (
                <div key={stage} className="min-w-[260px] flex-1">
                  <div className="rounded-t px-3 py-2 flex items-center justify-between" style={{ backgroundColor: `${STAGE_COLORS[stage]}15`, borderBottom: `2px solid ${STAGE_COLORS[stage]}` }}>
                    <span className="text-xs font-bold uppercase tracking-wider capitalize" style={{ color: STAGE_COLORS[stage] }}>{stage.replace('_', ' ')}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground">{stageDeals.length} &middot; {formatCurrency(stageTotal)}</span>
                  </div>
                  <div className="space-y-2 mt-2 min-h-[200px]">
                    {stageDeals.map(deal => (
                      <div
                        key={deal.id}
                        className="sf-card p-3 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setExpandedDealId(expandedDealId === deal.id ? null : deal.id)}
                      >
                        <p className="font-medium text-sm text-[#0176d3] mb-1">{deal.title}</p>
                        <p className="text-xs text-muted-foreground mb-2">{deal.customerName}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold">{formatCurrency(deal.estimatedValue)}</span>
                          <StatusBadge status={deal.status} />
                        </div>
                        {deal.tsdTargets && deal.tsdTargets.length > 0 && (
                          <TsdRoutingBadges tsdTargets={deal.tsdTargets} />
                        )}
                        {expandedDealId === deal.id && (
                          <div className="mt-2 border-t pt-2">
                            <DealTsdDetail dealId={deal.id} tsdTargets={deal.tsdTargets} />
                          </div>
                        )}
                      </div>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-xs text-muted-foreground">No deals</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && <AddDealModal onClose={() => setShowModal(false)} />}
    </PortalLayout>
  );
}

function TsdRoutingBadges({ tsdTargets }: { tsdTargets: string[] }) {
  if (!tsdTargets || tsdTargets.length === 0) {
    return <span className="text-xs text-muted-foreground italic">None</span>;
  }
  return (
    <div className="flex gap-1 flex-wrap">
      {tsdTargets.map(id => (
        <span key={id} className="sf-badge sf-badge-info text-[10px]">{TSD_LABELS[id] || id}</span>
      ))}
    </div>
  );
}

function DealTsdDetail({ dealId, tsdTargets }: { dealId: number; tsdTargets: string[] }) {
  const { data: logs = [], isLoading, refetch } = useDealTsdLogs(dealId);
  const { mutateAsync: retryPush, isPending: isRetrying } = useRetryTsdPush();

  const hasFailed = logs.some(l => l.status === "failed");

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await retryPush(dealId);
    refetch();
  };

  return (
    <div className="bg-[#f8f8f8] border-t border-[#e5e5e5] px-6 py-3" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">TSD Push Status</span>
        {hasFailed && (
          <button
            className="sf-btn sf-btn-neutral text-xs py-0.5 px-2"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Retrying..." : "Retry Failed"}
          </button>
        )}
      </div>
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          {tsdTargets && tsdTargets.length > 0
            ? "Push in progress..."
            : "No TSD push configured for this deal."}
        </p>
      ) : (
        <div className="space-y-1.5">
          {logs.map(log => (
            <TsdLogRow key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}

function TsdLogRow({ log }: { log: TsdSyncLog }) {
  const label = TSD_LABELS[log.tsdId] || log.tsdId;
  if (log.status === "success") {
    return (
      <div className="flex items-center gap-2 text-xs">
        <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">— Successfully submitted</span>
        {log.payload && (() => {
          try {
            const p = JSON.parse(log.payload);
            return p.externalId ? <span className="text-muted-foreground">({p.externalId})</span> : null;
          } catch { return null; }
        })()}
      </div>
    );
  }
  if (log.status === "failed") {
    return (
      <div className="flex items-start gap-2 text-xs">
        <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground ml-1">— Push failed</span>
          {log.errorMessage && <p className="text-red-500 mt-0.5">{log.errorMessage}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-xs">
      <Clock className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">— Pending</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    registered: "sf-badge-info",
    in_progress: "sf-badge-warning",
    won: "sf-badge-success",
    lost: "sf-badge-error",
    expired: "sf-badge-default",
  };
  return <span className={`sf-badge ${map[status] || 'sf-badge-default'} capitalize`}>{status.replace('_', ' ')}</span>;
}

const PRODUCTS = ["Zoom Meetings", "Zoom Phone", "Zoom Rooms", "Microsoft 365", "Cybersecurity Suite", "Network Hardware"];

type ModalStep = "details" | "tsd-confirm";

function AddDealModal({ onClose }: { onClose: () => void }) {
  const { mutateAsync: createDeal, isPending } = useCreateDeal();
  const { mutateAsync: resolveTsdMatches, isPending: isResolving } = useResolveTsdMatches();
  const [step, setStep] = useState<ModalStep>("details");
  const [formData, setFormData] = useState({
    title: "", customerName: "", customerEmail: "", estimatedValue: "", products: [] as string[],
  });
  const [tsdMatches, setTsdMatches] = useState<TsdMatch[]>([]);
  const [selectedTsds, setSelectedTsds] = useState<string[]>([]);

  const toggleProduct = (p: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(p) ? prev.products.filter(x => x !== p) : [...prev.products, p],
    }));
  };

  const toggleTsd = (id: string) => {
    setSelectedTsds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await resolveTsdMatches(formData.products);
    const matches = result.matches || [];
    setTsdMatches(matches);
    if (matches.length === 1) {
      setSelectedTsds([matches[0].id]);
    } else if (matches.length > 1) {
      setSelectedTsds([matches[0].id]);
    } else {
      setSelectedTsds([]);
    }
    setStep("tsd-confirm");
  };

  const handleSubmit = async () => {
    await createDeal({
      ...formData,
      products: formData.products,
      estimatedValue: parseFloat(formData.estimatedValue) || 0,
      tsdTargets: selectedTsds,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-16 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deal-modal-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="bg-white w-full max-w-xl rounded shadow-xl border border-[#d8dde6] flex flex-col max-h-[85vh]">
        <div className="px-4 py-3 border-b border-[#d8dde6] flex justify-between items-center bg-[#fafaf9]">
          <div className="flex items-center gap-2">
            {step === "tsd-confirm" && (
              <button onClick={() => setStep("details")} className="text-muted-foreground hover:text-foreground mr-1">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 id="deal-modal-title" className="text-base font-bold">
              {step === "details" ? "New Deal Registration" : "Confirm TSD Routing"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <StepIndicator current={step} />
            <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {step === "details" ? (
            <form id="deal-form" onSubmit={handleNext} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Opportunity Name *</label>
                <input className="sf-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Customer Company *</label>
                  <input className="sf-input" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Customer Email</label>
                  <input className="sf-input" type="email" value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Estimated Value ($) *</label>
                <input className="sf-input" type="number" min="0" step="0.01" value={formData.estimatedValue} onChange={e => setFormData({ ...formData, estimatedValue: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Products of Interest</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRODUCTS.map(p => (
                    <label key={p} className="flex items-center gap-2 p-2 border border-border rounded hover:bg-[#f3f3f3] cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded text-[#0176d3] focus:ring-[#0176d3]"
                        checked={formData.products.includes(p)}
                        onChange={() => toggleProduct(p)}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <TsdConfirmStep
              tsdMatches={tsdMatches}
              selectedTsds={selectedTsds}
              onToggle={toggleTsd}
              products={formData.products}
            />
          )}
        </div>

        <div className="px-4 py-3 border-t border-[#d8dde6] bg-[#fafaf9] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="sf-btn sf-btn-neutral">Cancel</button>
          {step === "details" ? (
            <button type="submit" form="deal-form" disabled={isResolving} className="sf-btn sf-btn-primary">
              {isResolving ? "Loading..." : "Next: TSD Routing"}
              {!isResolving && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isPending} className="sf-btn sf-btn-primary">
              {isPending ? "Saving..." : "Submit Deal"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: ModalStep }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${current === "details" ? "bg-[#0176d3] text-white" : "bg-green-100 text-green-700"}`}>
        {current === "details" ? "1" : <CheckCircle className="w-3 h-3" />}
      </span>
      <span className="w-4 h-px bg-border" />
      <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${current === "tsd-confirm" ? "bg-[#0176d3] text-white" : "bg-[#f0f0f0] text-muted-foreground"}`}>
        2
      </span>
    </div>
  );
}

function TsdConfirmStep({
  tsdMatches,
  selectedTsds,
  onToggle,
  products,
}: {
  tsdMatches: TsdMatch[];
  selectedTsds: string[];
  onToggle: (id: string) => void;
  products: string[];
}) {
  const ALL_TSDS: TsdMatch[] = [
    { id: "avant", label: "Avant" },
    { id: "telarus", label: "Telarus" },
    { id: "intelisys", label: "Intelisys" },
  ];

  const isMatch = (id: string) => tsdMatches.some(m => m.id === id);

  return (
    <div className="space-y-4">
      <div className="bg-[#f0f7ff] border border-[#d0e7ff] rounded p-3">
        <p className="text-sm font-semibold text-[#0176d3] mb-1">Matched TSDs for your products</p>
        <p className="text-xs text-muted-foreground">
          {products.length > 0
            ? `Based on your selected products (${products.join(", ")}), the following distributors are recommended.`
            : "Select TSD distributors to push this deal to."}
        </p>
        {tsdMatches.length === 1 && (
          <p className="text-xs text-[#0176d3] mt-1 font-medium">One TSD matched — pre-selected below. You can override this.</p>
        )}
        {tsdMatches.length > 1 && (
          <p className="text-xs text-[#0176d3] mt-1 font-medium">Multiple TSDs match — select one or more below.</p>
        )}
        {tsdMatches.length === 0 && (
          <p className="text-xs text-yellow-700 mt-1 font-medium">No specific TSD mapping found — all options shown. You may skip or pick manually.</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase">Select TSD(s) to push this deal to</label>
        {ALL_TSDS.map(tsd => {
          const matched = isMatch(tsd.id);
          const selected = selectedTsds.includes(tsd.id);
          return (
            <label
              key={tsd.id}
              className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${selected ? "border-[#0176d3] bg-[#f0f7ff]" : "border-border hover:bg-[#f3f3f3]"}`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(tsd.id)}
                className="w-4 h-4 rounded text-[#0176d3] focus:ring-[#0176d3]"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{tsd.label}</p>
                {matched ? (
                  <p className="text-xs text-[#0176d3]">Recommended — carries your selected products</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not matched to your products</p>
                )}
              </div>
              {matched && <span className="sf-badge sf-badge-info text-[10px]">Matched</span>}
            </label>
          );
        })}
      </div>

      {selectedTsds.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No TSDs selected — deal will save without a push. You can retry later from the deal detail view.</p>
      )}
    </div>
  );
}
