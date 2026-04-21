import React, { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Star,
  Zap,
  Info,
  Check,
  ArrowUp,
  ArrowDown,
  Minus,
  Layers,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FeatureRow =
  | { id: string; kind: "feature"; value: string }
  | { id: string; kind: "divider"; mode: "parent"; parentSlug: string | null }
  | { id: string; kind: "divider"; mode: "custom"; label: string };

const DIVIDER_PREFIX = "__divider__:";

let _rowSeq = 0;
const makeRowId = () => `r${++_rowSeq}`;

function parseFeaturesToRows(
  features: string[],
  allTiers: { slug: string; name: string }[]
): FeatureRow[] {
  return (features || []).map<FeatureRow>((f) => {
    if (f.startsWith(DIVIDER_PREFIX)) {
      const label = f.slice(DIVIDER_PREFIX.length);
      const m = label.match(/^Everything in (.+), plus:$/i);
      if (m) {
        const parentName = m[1].trim();
        const parent = allTiers.find(
          (t) => t.name.toLowerCase() === parentName.toLowerCase()
        );
        if (parent) {
          return {
            id: makeRowId(),
            kind: "divider",
            mode: "parent",
            parentSlug: parent.slug,
          };
        }
      }
      return { id: makeRowId(), kind: "divider", mode: "custom", label };
    }
    return { id: makeRowId(), kind: "feature", value: f };
  });
}

function serializeRows(
  rows: FeatureRow[],
  allTiers: { slug: string; name: string }[]
): string[] {
  const out: string[] = [];
  for (const row of rows) {
    if (row.kind === "feature") {
      const v = row.value.trim();
      if (v) out.push(v);
    } else if (row.mode === "parent") {
      const parent = allTiers.find((t) => t.slug === row.parentSlug);
      if (parent) {
        out.push(`${DIVIDER_PREFIX}Everything in ${parent.name}, plus:`);
      }
    } else {
      const v = row.label.trim();
      if (v) out.push(`${DIVIDER_PREFIX}${v}`);
    }
  }
  return out;
}

interface PricingTier {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  startingPrice: string;
  annualPrice: string;
  priceUnit: string;
  pricePrefix: string;
  mostPopular: boolean;
  features: string[];
  excludedFeatures: string[];
  ctaLabel: string;
  ctaLink: string;
  sortOrder: number;
  active: boolean;
  autoActivate: boolean;
  stripeProductId: string | null;
  stripeMonthlyPriceId: string | null;
  stripeAnnualPriceId: string | null;
}

const EMPTY_FORM: Omit<PricingTier, "id"> = {
  slug: "",
  name: "",
  tagline: "",
  startingPrice: "",
  annualPrice: "",
  priceUnit: "per user / month",
  pricePrefix: "Starting at",
  mostPopular: false,
  features: [],
  excludedFeatures: [],
  ctaLabel: "Get Started",
  ctaLink: "/quote",
  sortOrder: 0,
  active: true,
  autoActivate: false,
  stripeProductId: null,
  stripeMonthlyPriceId: null,
  stripeAnnualPriceId: null,
};

export default function AdminPricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const headers = getAuthHeaders();

  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<PricingTier, "id">>(EMPTY_FORM);
  const [featureRows, setFeatureRows] = useState<FeatureRow[]>([]);
  const [excludedText, setExcludedText] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/pricing-tiers", { headers });
      if (res.ok) setTiers(await res.json());
    } catch {
      toast({ title: "Failed to load pricing tiers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFeatureRows([]);
    setExcludedText("");
    setDialogOpen(true);
  };

  const openEdit = (tier: PricingTier) => {
    setEditingId(tier.id);
    setForm({
      slug: tier.slug,
      name: tier.name,
      tagline: tier.tagline,
      startingPrice: tier.startingPrice,
      annualPrice: tier.annualPrice,
      priceUnit: tier.priceUnit,
      pricePrefix: tier.pricePrefix,
      mostPopular: tier.mostPopular,
      features: tier.features,
      excludedFeatures: tier.excludedFeatures,
      ctaLabel: tier.ctaLabel,
      ctaLink: tier.ctaLink,
      sortOrder: tier.sortOrder,
      active: tier.active,
      autoActivate: tier.autoActivate,
      stripeProductId: tier.stripeProductId,
      stripeMonthlyPriceId: tier.stripeMonthlyPriceId,
      stripeAnnualPriceId: tier.stripeAnnualPriceId,
    });
    setFeatureRows(parseFeaturesToRows(tier.features || [], tiers));
    setExcludedText(
      Array.isArray(tier.excludedFeatures) ? tier.excludedFeatures.join("\n") : ""
    );
    setDialogOpen(true);
  };

  const otherTiers = tiers.filter((t) => t.id !== editingId);

  const updateRow = (id: string, patch: Partial<FeatureRow>) =>
    setFeatureRows((rows) =>
      rows.map((r) => (r.id === id ? ({ ...r, ...patch } as FeatureRow) : r))
    );
  const removeRow = (id: string) =>
    setFeatureRows((rows) => rows.filter((r) => r.id !== id));
  const moveRow = (id: string, dir: -1 | 1) =>
    setFeatureRows((rows) => {
      const idx = rows.findIndex((r) => r.id === id);
      if (idx < 0) return rows;
      const j = idx + dir;
      if (j < 0 || j >= rows.length) return rows;
      const next = rows.slice();
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  const addFeatureRow = () =>
    setFeatureRows((rows) => [
      ...rows,
      { id: makeRowId(), kind: "feature", value: "" },
    ]);
  const addDividerRow = () =>
    setFeatureRows((rows) => {
      const firstParent = otherTiers[0]?.slug ?? null;
      return [
        ...rows,
        firstParent
          ? {
              id: makeRowId(),
              kind: "divider",
              mode: "parent",
              parentSlug: firstParent,
            }
          : {
              id: makeRowId(),
              kind: "divider",
              mode: "custom",
              label: "Everything above, plus:",
            },
      ];
    });

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: "Plan name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        features: serializeRows(featureRows, tiers),
        excludedFeatures: excludedText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
      };

      const url = editingId
        ? `/api/admin/cms/pricing-tiers/${editingId}`
        : "/api/admin/cms/pricing-tiers";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({ title: editingId ? "Pricing tier updated" : "Pricing tier created" });
        setDialogOpen(false);
        load();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({
          title: err.message || "Failed to save pricing tier",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Error saving pricing tier", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteTier = async (id: number) => {
    if (!window.confirm("Delete this pricing tier? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/cms/pricing-tiers/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        toast({ title: "Pricing tier deleted" });
        load();
      } else {
        toast({ title: "Failed to delete pricing tier", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error deleting pricing tier", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const set = (key: keyof Omit<PricingTier, "id">, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

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
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Pricing Tiers</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage subscription plans and activation behavior
              </p>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" /> New Tier
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : tiers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                No pricing tiers yet. Create one to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tiers.map((tier) => (
                <Card key={tier.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base">{tier.name}</span>
                          {tier.mostPopular && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <Star className="w-3 h-3" /> Most Popular
                            </span>
                          )}
                          {tier.autoActivate ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                              <Zap className="w-3 h-3" /> Auto-activate
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Approval required
                            </span>
                          )}
                          {!tier.active && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Inactive
                            </span>
                          )}
                        </div>
                        {tier.tagline && (
                          <p className="text-sm text-muted-foreground mt-0.5">{tier.tagline}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>
                            <span className="text-muted-foreground">Monthly: </span>
                            <span className="font-medium">{tier.startingPrice || "—"}</span>
                          </span>
                          {tier.annualPrice && (
                            <span>
                              <span className="text-muted-foreground">Annual: </span>
                              <span className="font-medium">{tier.annualPrice}</span>
                            </span>
                          )}
                          <span className="text-muted-foreground text-xs">
                            Sort: {tier.sortOrder}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Array.isArray(tier.features) &&
                            tier.features.slice(0, 4).map((f, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"
                              >
                                <Check className="w-3 h-3 text-emerald-500" /> {f}
                              </span>
                            ))}
                          {Array.isArray(tier.features) && tier.features.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{tier.features.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => openEdit(tier)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          onClick={() => deleteTier(tier.id)}
                          disabled={deletingId === tier.id}
                        >
                          {deletingId === tier.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pricing Tier" : "New Pricing Tier"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Plan Name *</Label>
                <Input
                  className="mt-1"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Professional"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  className="mt-1"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="auto-generated from name"
                />
              </div>
            </div>

            <div>
              <Label>Tagline</Label>
              <Input
                className="mt-1"
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                placeholder="Short description shown under the plan name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Monthly Price</Label>
                <Input
                  className="mt-1"
                  value={form.startingPrice}
                  onChange={(e) => set("startingPrice", e.target.value)}
                  placeholder="e.g. $99"
                />
              </div>
              <div>
                <Label>Annual Price</Label>
                <Input
                  className="mt-1"
                  value={form.annualPrice}
                  onChange={(e) => set("annualPrice", e.target.value)}
                  placeholder="e.g. $79"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price Prefix</Label>
                <Input
                  className="mt-1"
                  value={form.pricePrefix}
                  onChange={(e) => set("pricePrefix", e.target.value)}
                  placeholder="Starting at"
                />
              </div>
              <div>
                <Label>Price Unit</Label>
                <Input
                  className="mt-1"
                  value={form.priceUnit}
                  onChange={(e) => set("priceUnit", e.target.value)}
                  placeholder="per user / month"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>CTA Label</Label>
                <Input
                  className="mt-1"
                  value={form.ctaLabel}
                  onChange={(e) => set("ctaLabel", e.target.value)}
                  placeholder="Get Started"
                />
              </div>
              <div>
                <Label>CTA Link</Label>
                <Input
                  className="mt-1"
                  value={form.ctaLink}
                  onChange={(e) => set("ctaLink", e.target.value)}
                  placeholder="/quote"
                />
              </div>
            </div>

            <div>
              <Label>Sort Order</Label>
              <Input
                className="mt-1 w-24"
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Features</Label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={addFeatureRow}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Feature
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={addDividerRow}
                  >
                    <Layers className="w-3 h-3 mr-1" /> Section divider
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Add features one at a time. Use a section divider (e.g.{" "}
                <span className="font-medium">"Everything in Essentials, plus:"</span>) to mark
                where features inherited from another tier end and new features begin.
              </p>

              <div className="mt-2 space-y-1.5">
                {featureRows.length === 0 && (
                  <div className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                    No features yet. Click <span className="font-medium">Feature</span> to
                    add the first one.
                  </div>
                )}
                {featureRows.map((row, idx) => (
                  <div
                    key={row.id}
                    className={
                      row.kind === "divider"
                        ? "flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-2 py-1.5"
                        : "flex items-center gap-1.5 rounded-md border px-2 py-1.5"
                    }
                  >
                    <div className="flex flex-col">
                      <button
                        type="button"
                        className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                        onClick={() => moveRow(row.id, -1)}
                        disabled={idx === 0}
                        aria-label="Move up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                        onClick={() => moveRow(row.id, 1)}
                        disabled={idx === featureRows.length - 1}
                        aria-label="Move down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    {row.kind === "feature" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <Input
                          className="h-8 flex-1"
                          value={row.value}
                          onChange={(e) =>
                            updateRow(row.id, { value: e.target.value })
                          }
                          placeholder="Feature description"
                        />
                      </>
                    ) : (
                      <>
                        <Minus className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider shrink-0">
                          Section
                        </span>
                        {row.mode === "parent" ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="text-xs text-muted-foreground shrink-0">
                              Everything in
                            </span>
                            <Select
                              value={row.parentSlug ?? ""}
                              onValueChange={(v) =>
                                updateRow(row.id, { parentSlug: v })
                              }
                            >
                              <SelectTrigger className="h-8 flex-1 min-w-[120px]">
                                <SelectValue placeholder="Choose tier…" />
                              </SelectTrigger>
                              <SelectContent>
                                {otherTiers.length === 0 ? (
                                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                    No other tiers available
                                  </div>
                                ) : (
                                  otherTiers.map((t) => (
                                    <SelectItem key={t.slug} value={t.slug}>
                                      {t.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <span className="text-xs text-muted-foreground shrink-0">
                              , plus:
                            </span>
                            <button
                              type="button"
                              className="text-[10px] text-muted-foreground hover:text-foreground underline"
                              onClick={() =>
                                updateRow(row.id, {
                                  mode: "custom",
                                  label:
                                    (otherTiers.find(
                                      (t) => t.slug === row.parentSlug
                                    )?.name &&
                                      `Everything in ${
                                        otherTiers.find(
                                          (t) => t.slug === row.parentSlug
                                        )!.name
                                      }, plus:`) ||
                                    "Everything above, plus:",
                                })
                              }
                            >
                              custom
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-1">
                            <Input
                              className="h-8 flex-1"
                              value={row.label}
                              onChange={(e) =>
                                updateRow(row.id, { label: e.target.value })
                              }
                              placeholder="e.g. Everything in Essentials, plus:"
                            />
                            {otherTiers.length > 0 && (
                              <button
                                type="button"
                                className="text-[10px] text-muted-foreground hover:text-foreground underline shrink-0"
                                onClick={() =>
                                  updateRow(row.id, {
                                    mode: "parent",
                                    parentSlug: otherTiers[0].slug,
                                  })
                                }
                              >
                                use tier
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-red-600 shrink-0"
                      onClick={() => removeRow(row.id)}
                      aria-label="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Excluded Features (one per line)</Label>
              <textarea
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm resize-y min-h-[60px] focus:outline-none focus:ring-2 focus:ring-ring"
                value={excludedText}
                onChange={(e) => setExcludedText(e.target.value)}
                placeholder={"Custom integrations\nDedicated account manager"}
              />
            </div>

            {/* Stripe IDs */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Stripe Product ID</Label>
                <Input
                  className="mt-1 font-mono text-xs"
                  value={form.stripeProductId ?? ""}
                  onChange={(e) => set("stripeProductId", e.target.value || null)}
                  placeholder="prod_..."
                />
              </div>
              <div>
                <Label>Monthly Price ID</Label>
                <Input
                  className="mt-1 font-mono text-xs"
                  value={form.stripeMonthlyPriceId ?? ""}
                  onChange={(e) =>
                    set("stripeMonthlyPriceId", e.target.value || null)
                  }
                  placeholder="price_..."
                />
              </div>
              <div>
                <Label>Annual Price ID</Label>
                <Input
                  className="mt-1 font-mono text-xs"
                  value={form.stripeAnnualPriceId ?? ""}
                  onChange={(e) =>
                    set("stripeAnnualPriceId", e.target.value || null)
                  }
                  placeholder="price_..."
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-1 border-t">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="mostPopular"
                  checked={form.mostPopular}
                  onCheckedChange={(v) => set("mostPopular", !!v)}
                />
                <Label htmlFor="mostPopular" className="cursor-pointer font-normal">
                  Mark as "Most Popular"
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="active"
                  checked={form.active}
                  onCheckedChange={(v) => set("active", !!v)}
                />
                <Label htmlFor="active" className="cursor-pointer font-normal">
                  Active (visible to customers)
                </Label>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
                <Checkbox
                  id="autoActivate"
                  checked={form.autoActivate}
                  onCheckedChange={(v) => set("autoActivate", !!v)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Label
                      htmlFor="autoActivate"
                      className="cursor-pointer font-medium text-sky-900"
                    >
                      Auto-activate on payment — skips admin approval
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-sky-500 cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs leading-relaxed">
                        When enabled, a partner's subscription is activated
                        immediately after their payment is confirmed — no admin
                        review step. Turn this off to hold each new signup in a
                        "pending approval" queue so an admin can verify the
                        account before it goes live.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-sky-700 mt-0.5">
                    {form.autoActivate
                      ? "Payment confirmation activates the account instantly."
                      : "New signups will wait in the approval queue before activation."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <DollarSign className="w-4 h-4 mr-1" />
              )}
              {editingId ? "Save Changes" : "Create Tier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
