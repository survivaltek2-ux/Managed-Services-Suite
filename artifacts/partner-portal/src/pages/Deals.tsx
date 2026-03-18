import { useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useDeals, useCreateDeal, type Deal } from "@/hooks/use-deals";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Filter } from "lucide-react";
import { format } from "date-fns";

export default function Deals() {
  const { data: deals = [], isLoading } = useDeals();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const filteredDeals = deals.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) || 
    d.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Deal Registration</h1>
          <p className="text-muted-foreground mt-1">Register and track your opportunities.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="rounded-xl shadow-md gap-2">
          <Plus className="w-4 h-4" /> Register New Deal
        </Button>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-border/50 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search deals..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-950 border-border/50 h-10 rounded-lg shadow-sm"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-lg">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-slate-50/80 dark:bg-slate-900/80 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Deal Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Customer</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Est. Value</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Stage</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">Loading deals...</td></tr>
              ) : filteredDeals.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-12 text-muted-foreground">No deals found. Register your first deal to get started.</td></tr>
              ) : (
                filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 font-medium text-foreground">{deal.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">{deal.customerName}</td>
                    <td className="px-6 py-4 font-semibold text-right text-foreground">{formatCurrency(deal.estimatedValue)}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize bg-white dark:bg-slate-950 shadow-sm">{deal.stage.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={deal.status} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {format(new Date(deal.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <AddDealModal onClose={() => setShowModal(false)} />}
    </PortalLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: any, l: string }> = {
    registered: { v: "default", l: "Registered" },
    in_progress: { v: "warning", l: "In Progress" },
    won: { v: "success", l: "Closed Won" },
    lost: { v: "destructive", l: "Closed Lost" },
    expired: { v: "secondary", l: "Expired" }
  };
  const config = map[status] || map.registered;
  return <Badge variant={config.v}>{config.l}</Badge>;
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
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-3xl">
          <h2 className="text-xl font-display font-bold">Register New Deal</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><Plus className="w-6 h-6 rotate-45" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <form id="deal-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Opportunity Name *</label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Customer Company *</label>
                <Input value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Customer Email</label>
                <Input type="email" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Estimated Value ($) *</label>
              <Input type="number" min="0" step="0.01" value={formData.estimatedValue} onChange={e => setFormData({...formData, estimatedValue: e.target.value})} required />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold">Products of Interest</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {PRODUCTS.map(p => (
                  <label key={p} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary" 
                      checked={formData.products.includes(p)} onChange={() => toggleProduct(p)} />
                    <span className="text-sm font-medium">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 rounded-b-3xl flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button type="submit" form="deal-form" disabled={isPending} className="rounded-xl px-8 shadow-md">
            {isPending ? "Registering..." : "Submit Registration"}
          </Button>
        </div>
      </div>
    </div>
  );
}
