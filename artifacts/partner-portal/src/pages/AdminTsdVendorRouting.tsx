import React, { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const TSD_OPTIONS = [
  { id: "telarus", label: "Telarus" },
  { id: "intelisys", label: "Intelisys" },
];

interface VendorMapping {
  id: number;
  productName: string;
  tsdIds: string[];
  active: boolean;
  updatedAt: string;
}

export default function AdminTsdVendorRouting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mappings, setMappings] = useState<VendorMapping[]>([]);
  const [localMappings, setLocalMappings] = useState<VendorMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState("");
  const [adding, setAdding] = useState(false);

  const headers = getAuthHeaders();

  const load = () => {
    setLoading(true);
    fetch("/api/admin/tsd-vendor-mappings", { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setMappings(list);
        setLocalMappings(list);
      })
      .catch(() => toast({ title: "Failed to load mappings", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    setLocalMappings(mappings);
  }, [mappings]);

  const toggleTsd = (mappingId: number, tsdId: string) => {
    setLocalMappings(prev => prev.map(m => {
      if (m.id !== mappingId) return m;
      const has = m.tsdIds.includes(tsdId);
      return { ...m, tsdIds: has ? m.tsdIds.filter(x => x !== tsdId) : [...m.tsdIds, tsdId] };
    }));
  };

  const saveMapping = async (mapping: VendorMapping) => {
    setSaving(mapping.id);
    try {
      const res = await fetch(`/api/admin/tsd-vendor-mappings/${mapping.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ tsdIds: mapping.tsdIds, active: mapping.active }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Saved", description: `Mapping for "${mapping.productName}" updated.` });
      load();
    } catch {
      toast({ title: "Error", description: "Failed to save mapping.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const addMapping = async () => {
    if (!newProduct.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/tsd-vendor-mappings", {
        method: "POST",
        headers,
        body: JSON.stringify({ productName: newProduct.trim(), tsdIds: [] }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add");
      }
      toast({ title: "Added", description: `Mapping for "${newProduct}" created.` });
      setNewProduct("");
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to add mapping.", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const deleteMapping = async (id: number, productName: string) => {
    if (!confirm(`Delete mapping for "${productName}"?`)) return;
    try {
      await fetch(`/api/admin/tsd-vendor-mappings/${id}`, { method: "DELETE", headers });
      toast({ title: "Deleted", description: `Mapping for "${productName}" removed.` });
      load();
    } catch {
      toast({ title: "Error", description: "Failed to delete mapping.", variant: "destructive" });
    }
  };

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
      <div className="px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold">TSD Vendor Routing</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure which Technology Solution Distributors (TSDs) carry each product. When a partner registers a deal, matching TSDs are automatically suggested.</p>
          </div>

          <div className="flex gap-2 items-center">
            <Input
              placeholder="New product name..."
              value={newProduct}
              onChange={e => setNewProduct(e.target.value)}
              className="max-w-xs"
              onKeyDown={e => e.key === "Enter" && addMapping()}
            />
            <Button onClick={addMapping} disabled={adding || !newProduct.trim()} size="sm">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Product
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Product / Vendor</th>
                    {TSD_OPTIONS.map(t => (
                      <th key={t.id} className="text-center px-4 py-3 font-semibold">{t.label}</th>
                    ))}
                    <th className="text-center px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {localMappings.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No mappings configured.</td></tr>
                  ) : localMappings.map(m => (
                    <tr key={m.id} className={`hover:bg-muted/20 ${!m.active ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3 font-medium">{m.productName}</td>
                      {TSD_OPTIONS.map(t => (
                        <td key={t.id} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={m.tsdIds.includes(t.id)}
                            onChange={() => toggleTsd(m.id, t.id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => saveMapping(m)}
                            disabled={saving === m.id}
                          >
                            {saving === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMapping(m.id, m.productName)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
            <strong>How it works:</strong> When a partner selects products during deal registration, the system matches them against this table and pre-selects the appropriate TSD(s). Partners can review and change the selection before submitting. Deals are then pushed to the confirmed TSDs automatically.
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
