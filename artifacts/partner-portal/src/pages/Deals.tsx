import { useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useDeals, useCreateDeal, type Deal } from "@/hooks/use-deals";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, List, Columns3, X, ChevronDown, Filter } from "lucide-react";
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

export default function Deals() {
  const { data: deals = [], isLoading } = useDeals();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");

  const filteredDeals = deals.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalLayout>
      {/* Page Header */}
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
        {/* Search & Filter Bar */}
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
                  <th>Deal Name</th>
                  <th>Customer</th>
                  <th className="text-right">Est. Value</th>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                ) : filteredDeals.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No deals found. Register your first deal to get started.</td></tr>
                ) : (
                  filteredDeals.map((deal) => (
                    <tr key={deal.id} className="cursor-pointer">
                      <td className="font-medium text-[#0176d3]">{deal.title}</td>
                      <td>{deal.customerName}</td>
                      <td className="text-right font-semibold">{formatCurrency(deal.estimatedValue)}</td>
                      <td>
                        <span className="sf-badge capitalize" style={{ backgroundColor: `${STAGE_COLORS[deal.stage] || '#706e6b'}15`, color: STAGE_COLORS[deal.stage] || '#706e6b' }}>
                          {deal.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td><StatusBadge status={deal.status} /></td>
                      <td className="text-muted-foreground text-xs">{format(new Date(deal.createdAt), 'MMM d, yyyy')}</td>
                    </tr>
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
                      <div key={deal.id} className="sf-card p-3 cursor-pointer hover:shadow-md transition-shadow">
                        <p className="font-medium text-sm text-[#0176d3] mb-1">{deal.title}</p>
                        <p className="text-xs text-muted-foreground mb-2">{deal.customerName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold">{formatCurrency(deal.estimatedValue)}</span>
                          <StatusBadge status={deal.status} />
                        </div>
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

function AddDealModal({ onClose }: { onClose: () => void }) {
  const { mutateAsync: createDeal, isPending } = useCreateDeal();
  const [formData, setFormData] = useState({
    title: "", customerName: "", customerEmail: "", estimatedValue: "", products: [] as string[]
  });

  const PRODUCTS = ["Zoom Meetings", "Zoom Phone", "Zoom Rooms", "Microsoft 365", "Cybersecurity Suite", "Network Hardware"];

  const toggleProduct = (p: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(p) ? prev.products.filter(x => x !== p) : [...prev.products, p]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDeal({
      ...formData,
      products: JSON.stringify(formData.products),
      estimatedValue: parseFloat(formData.estimatedValue) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-16 px-4" role="dialog" aria-modal="true" aria-labelledby="deal-modal-title" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="bg-white w-full max-w-xl rounded shadow-xl border border-[#d8dde6] flex flex-col max-h-[80vh]">
        <div className="px-4 py-3 border-b border-[#d8dde6] flex justify-between items-center bg-[#fafaf9]">
          <h2 id="deal-modal-title" className="text-base font-bold">New Deal Registration</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <form id="deal-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Opportunity Name *</label>
              <input className="sf-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Customer Company *</label>
                <input className="sf-input" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Customer Email</label>
                <input className="sf-input" type="email" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Estimated Value ($) *</label>
              <input className="sf-input" type="number" min="0" step="0.01" value={formData.estimatedValue} onChange={e => setFormData({...formData, estimatedValue: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Products of Interest</label>
              <div className="grid grid-cols-2 gap-2">
                {PRODUCTS.map(p => (
                  <label key={p} className="flex items-center gap-2 p-2 border border-border rounded hover:bg-[#f3f3f3] cursor-pointer text-sm">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-[#0176d3] focus:ring-[#0176d3]"
                      checked={formData.products.includes(p)} onChange={() => toggleProduct(p)} />
                    {p}
                  </label>
                ))}
              </div>
            </div>
          </form>
        </div>
        <div className="px-4 py-3 border-t border-[#d8dde6] bg-[#fafaf9] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="sf-btn sf-btn-neutral">Cancel</button>
          <button type="submit" form="deal-form" disabled={isPending} className="sf-btn sf-btn-primary">
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
