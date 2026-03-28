import { useState, useMemo, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useVendors, type Vendor, type VendorProduct } from "@/hooks/use-deals";
import { useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { Search, X, CheckCircle2, BookOpen, Users, Calendar } from "lucide-react";

interface FormState {
  vendorName: string;
  topic: string;
  preferredDate: string;
  attendeeCount: string;
  contactName: string;
  contactEmail: string;
  notes: string;
}

export default function Training() {
  const { user } = useAuth();
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();

  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    vendorName: "",
    topic: "",
    preferredDate: "",
    attendeeCount: "1",
    contactName: user?.contactName || "",
    contactEmail: user?.email || "",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        contactName: prev.contactName || user.contactName || "",
        contactEmail: prev.contactEmail || user.email || "",
      }));
    }
  }, [user]);

  const filteredVendors = useMemo(() => {
    const q = vendorSearch.toLowerCase().trim();
    if (!q) return vendors;
    return vendors.filter(v =>
      v.name.toLowerCase().includes(q) ||
      (v.industry || "").toLowerCase().includes(q)
    );
  }, [vendors, vendorSearch]);

  function setField(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function selectVendor(vendor: Vendor) {
    setField("vendorName", vendor.name);
    setVendorSearch(vendor.name);
    setVendorDropdownOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.vendorName || !form.topic || !form.contactName || !form.contactEmail) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/training-requests", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorName: form.vendorName,
          topic: form.topic,
          preferredDate: form.preferredDate || null,
          attendeeCount: parseInt(form.attendeeCount) || 1,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          notes: form.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit training request");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <PortalLayout>
        <div className="sf-page-header px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-lg font-bold text-foreground">Training</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="sf-card p-10 text-center">
            <div className="w-16 h-16 bg-[#2e844a]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-[#2e844a]" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Request Submitted!</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Your training request has been sent to the Siebert team. We'll reach out to coordinate scheduling with you and the vendor.
            </p>
            <button
              className="sf-btn sf-btn-primary"
              onClick={() => {
                setSubmitted(false);
                setForm({
                  vendorName: "",
                  topic: "",
                  preferredDate: "",
                  attendeeCount: "1",
                  contactName: user?.contactName || "",
                  contactEmail: user?.email || "",
                  notes: "",
                });
                setVendorSearch("");
              }}
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <h1 className="text-lg font-bold text-foreground">Training</h1>
          <span className="text-xs text-muted-foreground">Request a vendor training session</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="sf-card overflow-hidden">
          <div className="sf-card-header flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0176d3]" />
            <span>Training Request</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <p className="text-sm text-muted-foreground -mt-1">
              Use this form to request a vendor-specific training session. The Siebert team will coordinate with the vendor and follow up to confirm scheduling.
            </p>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Vendor Selection */}
            <div>
              <label className="sf-label">
                Vendor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder={vendorsLoading ? "Loading vendors..." : "Search and select a vendor..."}
                    value={vendorSearch}
                    onChange={e => {
                      setVendorSearch(e.target.value);
                      setField("vendorName", e.target.value);
                      setVendorDropdownOpen(true);
                    }}
                    onFocus={() => setVendorDropdownOpen(true)}
                    disabled={vendorsLoading}
                    className="sf-input pl-8 pr-8"
                    autoComplete="off"
                  />
                  {vendorSearch && (
                    <button
                      type="button"
                      onClick={() => { setVendorSearch(""); setField("vendorName", ""); setVendorDropdownOpen(false); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {vendorDropdownOpen && !vendorsLoading && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setVendorDropdownOpen(false)} />
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#d8dde6] rounded shadow-lg max-h-64 overflow-y-auto">
                      {filteredVendors.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-muted-foreground text-center">
                          {vendors.length === 0 ? "No vendors synced yet." : "No vendors match your search."}
                        </div>
                      ) : (
                        filteredVendors.map(v => (
                          <button
                            key={v.externalId}
                            type="button"
                            onClick={() => selectVendor(v)}
                            className="w-full text-left px-3 py-2.5 hover:bg-[#f3f3f3] transition-colors border-b border-[#f0f0f0] last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{v.name}</span>
                              {v.industry && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-[#0176d3]/10 text-[#0176d3] rounded-full">{v.industry}</span>
                              )}
                            </div>
                            {v.products && v.products.length > 0 && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                {v.products.slice(0, 4).map((p: VendorProduct) => p.name).join(" · ")}
                                {v.products.length > 4 && ` · +${v.products.length - 4} more`}
                              </p>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
              {vendors.length === 0 && !vendorsLoading && (
                <p className="text-xs text-muted-foreground mt-1">
                  You can also type any vendor name directly if it's not in the list.
                </p>
              )}
            </div>

            {/* Topic */}
            <div>
              <label className="sf-label">
                Training Topic / Focus Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sales enablement, Technical certification, Product overview..."
                value={form.topic}
                onChange={e => setField("topic", e.target.value)}
                className="sf-input"
                required
              />
            </div>

            {/* Preferred Date & Attendees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="sf-label flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Preferred Date(s)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Week of April 14, any Tuesday in May..."
                  value={form.preferredDate}
                  onChange={e => setField("preferredDate", e.target.value)}
                  className="sf-input"
                />
              </div>
              <div>
                <label className="sf-label flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  Number of Attendees <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={form.attendeeCount}
                  onChange={e => setField("attendeeCount", e.target.value)}
                  className="sf-input"
                  required
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="sf-label">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={e => setField("contactName", e.target.value)}
                  className="sf-input"
                  required
                />
              </div>
              <div>
                <label className="sf-label">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={e => setField("contactEmail", e.target.value)}
                  className="sf-input"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="sf-label">Additional Notes</label>
              <textarea
                placeholder="Any specific topics, prerequisites, format preferences, or other details..."
                value={form.notes}
                onChange={e => setField("notes", e.target.value)}
                className="sf-input resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                type="submit"
                disabled={submitting}
                className="sf-btn sf-btn-primary"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
}
