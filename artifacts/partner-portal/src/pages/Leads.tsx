import { PortalLayout } from "@/components/layout/PortalLayout";
import { useLeads, useUpdateLeadStatus } from "@/hooks/use-leads";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Mail, Phone, Building, Search, Filter, ChevronDown, Plus, X } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const LEAD_INTEREST_OPTIONS = [
  "Connectivity (Internet/MPLS)",
  "Voice & UCaaS",
  "Cloud & Hosting",
  "Security",
  "Contact Center",
  "SD-WAN & Networking",
  "Data Center",
  "Mobility & IoT",
  "Collaboration",
  "Managed IT",
  "Expense Management",
  "CPaaS & Messaging",
  "Other",
];

function useSubmitLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${import.meta.env.BASE_URL}api/partner/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit lead");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export default function Leads() {
  const { data: leads = [], isLoading } = useLeads();
  const { mutateAsync: updateStatus } = useUpdateLeadStatus();
  const { user } = useAuth();
  const { mutateAsync: submitLead, isPending: isSubmitting } = useSubmitLead();
  const [search, setSearch] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    interest: "",
    notes: "",
  });

  const filtered = leads.filter(l =>
    l.companyName.toLowerCase().includes(search.toLowerCase()) ||
    l.contactName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitLead(formData);
      setFormData({ companyName: "", contactName: "", email: "", phone: "", interest: "", notes: "" });
      setShowSubmitModal(false);
    } catch (err) {
      console.error("Failed to submit lead:", err);
    }
  };

  return (
    <PortalLayout>
      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">Leads</h1>
            <span className="text-xs text-muted-foreground">{filtered.length} items</span>
          </div>
          <button onClick={() => setShowSubmitModal(true)} className="sf-btn sf-btn-primary">
            <Plus className="w-3.5 h-3.5" /> Submit a Lead
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="sf-input pl-8" />
          </div>
          <button className="sf-btn sf-btn-neutral">
            <Filter className="w-3.5 h-3.5" /> Filters <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="sf-card overflow-x-auto">
          <table className="w-full sf-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Interest</th>
                <th>Status</th>
                <th>Assigned</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No leads assigned yet.</td></tr>
              ) : (
                filtered.map(lead => (
                  <tr key={lead.id}>
                    <td className="font-medium text-[#0176d3]">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-muted-foreground" />
                        {lead.companyName}
                      </div>
                    </td>
                    <td>{lead.contactName}</td>
                    <td>
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="text-[#0176d3] hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {lead.email}
                        </a>
                      )}
                    </td>
                    <td>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </a>
                      )}
                    </td>
                    <td className="text-sm">{lead.interest}</td>
                    <td>
                      <select
                        className="sf-input w-28"
                        value={lead.status}
                        onChange={(e) => updateStatus({ id: lead.id, status: e.target.value })}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td className="text-xs text-muted-foreground">{format(new Date(lead.assignedAt), 'MMM d, yyyy')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Lead Modal */}
      {showSubmitModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          onKeyDown={e => e.key === "Escape" && setShowSubmitModal(false)}
        >
          <div className="bg-white w-full max-w-xl rounded-lg shadow-xl border border-[#d8dde6] flex flex-col">
            <div className="px-6 py-4 border-b border-[#d8dde6] flex justify-between items-center">
              <h2 className="text-lg font-bold text-foreground">Submit a Lead</h2>
              <button onClick={() => setShowSubmitModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Company Name *</label>
                <input
                  className="sf-input"
                  placeholder="Prospect company name"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Contact Name *</label>
                <input
                  className="sf-input"
                  placeholder="Contact person name"
                  value={formData.contactName}
                  onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                  <input
                    className="sf-input"
                    type="email"
                    placeholder="contact@company.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Phone</label>
                  <input
                    className="sf-input"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Interest / Solution *</label>
                <select
                  className="sf-input"
                  value={formData.interest}
                  onChange={e => setFormData({ ...formData, interest: e.target.value })}
                  required
                >
                  <option value="">Select an interest...</option>
                  {LEAD_INTEREST_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Notes</label>
                <textarea
                  className="sf-input min-h-24"
                  placeholder="Any additional context about this lead..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </form>

            <div className="px-6 py-4 border-t border-[#d8dde6] flex justify-end gap-2">
              <button type="button" onClick={() => setShowSubmitModal(false)} className="sf-btn sf-btn-neutral">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="sf-btn sf-btn-primary"
              >
                {isSubmitting ? "Submitting..." : "Submit Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
