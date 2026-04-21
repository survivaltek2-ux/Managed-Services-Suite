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
} from "lucide-react";
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
  const [featuresText, setFeaturesText] = useState("");
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
    setFeaturesText("");
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
    setFeaturesText(Array.isArray(tier.features) ? tier.features.join("\n") : "");
    setExcludedText(
      Array.isArray(tier.excludedFeatures) ? tier.excludedFeatures.join("\n") : ""
    );
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: "Plan name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        features: featuresText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
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
              <Label>Features (one per line)</Label>
              <textarea
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder={"Unlimited users\nPriority support\nAdvanced reporting"}
              />
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
