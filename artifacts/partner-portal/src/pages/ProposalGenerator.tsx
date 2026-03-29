import React, { useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Download, Eye, Send, X, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTsdProducts, type TsdProduct } from "@/hooks/use-tsd-products";

interface LineItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  recurring: boolean;
  recurringInterval: string;
}

interface ProposalForm {
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientPhone: string;
  title: string;
  summary: string;
  discount: number;
  discountType: "fixed" | "percent";
  tax: number;
  validUntil: string;
  terms: string;
  lineItems: LineItem[];
}

function ProductPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (product: TsdProduct) => void;
  onClose: () => void;
}) {
  const { data, isLoading } = useTsdProducts();
  const [search, setSearch] = useState("");

  const allProducts = data?.products ?? [];
  const filtered = allProducts.filter(
    (p) =>
      p.active &&
      (search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  const grouped: Record<string, TsdProduct[]> = {};
  for (const p of filtered) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg">Browse Product Catalog</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-6 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading catalog...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {search ? "No products match your search." : "No products in catalog."}
            </p>
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([category, products]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        className="w-full text-left px-3 py-2.5 rounded-md hover:bg-muted transition-colors"
                        onClick={() => {
                          onSelect(product);
                          onClose();
                        }}
                      >
                        <p className="text-sm font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function ProposalGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPickerTargetIdx, setProductPickerTargetIdx] = useState<number | null>(null);
  const [form, setForm] = useState<ProposalForm>({
    clientName: "",
    clientEmail: "",
    clientCompany: "",
    clientPhone: "",
    title: "",
    summary: "",
    discount: 0,
    discountType: "fixed",
    tax: 0,
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    terms: "Payment is due within 30 days of invoice.\nPrices are valid for the duration specified.\nAll services subject to the terms of our Master Service Agreement.",
    lineItems: [{ name: "", description: "", quantity: 1, unitPrice: 0, unit: "each", recurring: false, recurringInterval: "monthly" }],
  });

  const addLineItem = () => {
    setForm(p => ({
      ...p,
      lineItems: [...p.lineItems, { name: "", description: "", quantity: 1, unitPrice: 0, unit: "each", recurring: false, recurringInterval: "monthly" }],
    }));
  };

  const removeLineItem = (idx: number) => {
    setForm(p => ({
      ...p,
      lineItems: p.lineItems.filter((_, i) => i !== idx),
    }));
  };

  const updateLineItem = (idx: number, field: string, value: any) => {
    setForm(p => ({
      ...p,
      lineItems: p.lineItems.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  const openProductPicker = (idx: number | "new") => {
    setProductPickerTargetIdx(idx === "new" ? null : idx);
    setProductPickerOpen(true);
  };

  const handleProductSelect = (product: TsdProduct) => {
    if (productPickerTargetIdx === null) {
      setForm(p => ({
        ...p,
        lineItems: [
          ...p.lineItems,
          { name: product.name, description: product.description ?? "", quantity: 1, unitPrice: 0, unit: "each", recurring: false, recurringInterval: "monthly" },
        ],
      }));
    } else {
      setForm(p => ({
        ...p,
        lineItems: p.lineItems.map((item, i) =>
          i === productPickerTargetIdx
            ? { ...item, name: product.name, description: product.description ?? "" }
            : item
        ),
      }));
    }
    setProductPickerTargetIdx(null);
  };

  const subtotal = form.lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discountAmount = form.discountType === "fixed" ? form.discount : (subtotal * form.discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * form.tax) / 100;
  const total = afterDiscount + taxAmount;

  const handleSave = async () => {
    if (!form.clientName || !form.clientEmail || !form.clientCompany || !form.title) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    if (form.lineItems.some(item => !item.name || item.unitPrice <= 0)) {
      toast({ title: "Please fill in all line items", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("/api/admin/proposals", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("partner_token")}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total: total.toFixed(2),
        }),
      });
      if (res.ok) {
        toast({ title: "Proposal saved successfully" });
        setForm({
          clientName: "", clientEmail: "", clientCompany: "", clientPhone: "", title: "", summary: "",
          discount: 0, discountType: "fixed", tax: 0,
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          terms: "Payment is due within 30 days of invoice.\nPrices are valid for the duration specified.\nAll services subject to the terms of our Master Service Agreement.",
          lineItems: [{ name: "", description: "", quantity: 1, unitPrice: 0, unit: "each", recurring: false, recurringInterval: "monthly" }],
        });
      } else {
        const data = await res.json();
        toast({ title: data.message || "Failed to save proposal", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error saving proposal", variant: "destructive" });
    }
  };

  if (!user) return null;

  return (
    <PortalLayout>
      <div className="px-6 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Generate Proposal</h1>
            <p className="text-sm text-muted-foreground mt-1">Create a preliminary proposal for your client</p>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Info */}
              <Card className="p-6">
                <h2 className="font-bold text-lg mb-4">Client Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Client Name *</Label>
                    <Input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label className="text-xs">Email *</Label>
                    <Input type="email" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} placeholder="john@company.com" />
                  </div>
                  <div>
                    <Label className="text-xs">Company *</Label>
                    <Input value={form.clientCompany} onChange={e => setForm({ ...form, clientCompany: e.target.value })} placeholder="ABC Corporation" />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} placeholder="(555) 123-4567" />
                  </div>
                </div>
              </Card>

              {/* Proposal Details */}
              <Card className="p-6">
                <h2 className="font-bold text-lg mb-4">Proposal Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">Proposal Title *</Label>
                    <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="IT Infrastructure Modernization" />
                  </div>
                  <div>
                    <Label className="text-xs">Summary</Label>
                    <Textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} placeholder="Brief overview of the proposal..." className="min-h-[80px]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Valid Until</Label>
                      <Input type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Tax Rate (%)</Label>
                      <Input type="number" step="0.01" value={form.tax} onChange={e => setForm({ ...form, tax: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Line Items */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg">Services & Items</h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openProductPicker("new")}>
                      <BookOpen className="w-4 h-4 mr-1" />Browse Catalog
                    </Button>
                    <Button size="sm" variant="outline" onClick={addLineItem}>
                      <Plus className="w-4 h-4 mr-1" />Add Item
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {form.lineItems.map((item, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-muted/30">
                      <div className="grid grid-cols-12 gap-3 mb-3">
                        <div className="col-span-6">
                          <div className="flex items-center justify-between mb-1">
                            <Label className="text-xs">Item Name *</Label>
                            <button
                              type="button"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              onClick={() => openProductPicker(idx)}
                            >
                              <BookOpen className="w-3 h-3" />
                              From catalog
                            </button>
                          </div>
                          <Input value={item.name} onChange={e => updateLineItem(idx, "name", e.target.value)} placeholder="e.g., Network Setup" />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Qty</Label>
                          <Input type="number" min="1" value={item.quantity} onChange={e => updateLineItem(idx, "quantity", parseInt(e.target.value) || 1)} />
                        </div>
                        <div className="col-span-3">
                          <Label className="text-xs">Unit Price *</Label>
                          <Input type="number" step="0.01" value={item.unitPrice} onChange={e => updateLineItem(idx, "unitPrice", parseFloat(e.target.value) || 0)} placeholder="0.00" />
                        </div>
                        <div className="col-span-1 flex items-end">
                          {form.lineItems.length > 1 && (
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeLineItem(idx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Unit</Label>
                          <select className="w-full h-9 px-2 rounded border text-xs bg-background" value={item.unit} onChange={e => updateLineItem(idx, "unit", e.target.value)}>
                            <option value="each">Each</option>
                            <option value="hour">Hour</option>
                            <option value="day">Day</option>
                            <option value="month">Month</option>
                            <option value="year">Year</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Input value={item.description} onChange={e => updateLineItem(idx, "description", e.target.value)} placeholder="Optional description" />
                        </div>
                        <div>
                          <Label className="text-xs">Total</Label>
                          <div className="h-9 flex items-center px-2 bg-muted rounded border text-sm font-semibold">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-xs mt-3">
                        <input type="checkbox" checked={item.recurring} onChange={e => updateLineItem(idx, "recurring", e.target.checked)} className="w-4 h-4" />
                        Recurring
                        {item.recurring && (
                          <select className="h-7 px-2 rounded border text-xs bg-background ml-2" value={item.recurringInterval} onChange={e => updateLineItem(idx, "recurringInterval", e.target.value)}>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annually">Annually</option>
                          </select>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Discount */}
              <Card className="p-6">
                <h2 className="font-bold text-lg mb-4">Discount</h2>
                <div className="flex gap-3">
                  <Input type="number" step="0.01" value={form.discount} onChange={e => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })} placeholder="0" className="flex-1" />
                  <select className="h-10 px-3 rounded border text-sm bg-background" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })}>
                    <option value="fixed">$ Fixed</option>
                    <option value="percent">% Percent</option>
                  </select>
                </div>
              </Card>

              {/* Terms */}
              <Card className="p-6">
                <Label className="text-sm font-bold">Terms & Conditions</Label>
                <Textarea value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} className="min-h-[120px] mt-2" />
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={handleSave} className="gap-2"><Send className="w-4 h-4" /> Save Proposal</Button>
                <Button variant="outline" onClick={() => setPreviewOpen(true)} className="gap-2"><Eye className="w-4 h-4" /> Preview</Button>
              </div>
            </div>

            {/* Summary Panel */}
            <div className="sticky top-20 h-fit">
              <Card className="p-6">
                <h2 className="font-bold text-lg mb-6">Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {form.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-green-600">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-muted-foreground">After Discount</span>
                    <span className="font-medium">${afterDiscount.toFixed(2)}</span>
                  </div>
                  {form.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax ({form.tax}%)</span>
                      <span className="font-medium">${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between text-base">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-6 space-y-3 text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold">Items:</span>
                    <p>{form.lineItems.length}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Valid Until:</span>
                    <p>{new Date(form.validUntil).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Preview Modal */}
          {previewOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">{form.title}</h2>
                  <Button variant="ghost" size="icon" onClick={() => setPreviewOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6 text-sm">
                  <div>
                    <h3 className="font-bold mb-2">To:</h3>
                    <p>{form.clientName}</p>
                    <p>{form.clientCompany}</p>
                    {form.clientEmail && <p>{form.clientEmail}</p>}
                  </div>

                  {form.summary && (
                    <div>
                      <h3 className="font-bold mb-2">Overview:</h3>
                      <p className="whitespace-pre-wrap">{form.summary}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold mb-3">Services & Items:</h3>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Description</th>
                          <th className="text-right py-2">Qty</th>
                          <th className="text-right py-2">Unit Price</th>
                          <th className="text-right py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.lineItems.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2">
                              <p className="font-medium">{item.name}</p>
                              {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                            </td>
                            <td className="text-right py-2">{item.quantity}</td>
                            <td className="text-right py-2">${item.unitPrice.toFixed(2)}</td>
                            <td className="text-right py-2 font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-muted p-4 rounded space-y-2 text-right">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {form.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {form.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax ({form.tax}%):</span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {form.terms && (
                    <div>
                      <h3 className="font-bold mb-2">Terms & Conditions:</h3>
                      <p className="whitespace-pre-wrap text-xs">{form.terms}</p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    <p>Valid until: {new Date(form.validUntil).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Product Picker Modal */}
          {productPickerOpen && (
            <ProductPickerModal
              onSelect={handleProductSelect}
              onClose={() => {
                setProductPickerOpen(false);
                setProductPickerTargetIdx(null);
              }}
            />
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
