import { PortalLayout } from "@/components/layout/PortalLayout";
import { useLeads, useUpdateLeadStatus } from "@/hooks/use-leads";
import { format } from "date-fns";
import { Mail, Phone, Building, Search, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Leads() {
  const { data: leads = [], isLoading } = useLeads();
  const { mutateAsync: updateStatus } = useUpdateLeadStatus();
  const [search, setSearch] = useState("");

  const filtered = leads.filter(l =>
    l.companyName.toLowerCase().includes(search.toLowerCase()) ||
    l.contactName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalLayout>
      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">Leads</h1>
            <span className="text-xs text-muted-foreground">{filtered.length} items</span>
          </div>
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
    </PortalLayout>
  );
}
