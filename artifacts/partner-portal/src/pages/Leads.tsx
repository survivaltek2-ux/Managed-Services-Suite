import { PortalLayout } from "@/components/layout/PortalLayout";
import { useLeads, useUpdateLeadStatus } from "@/hooks/use-leads";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { Mail, Phone, Building } from "lucide-react";

export default function Leads() {
  const { data: leads = [], isLoading } = useLeads();
  const { mutateAsync: updateStatus } = useUpdateLeadStatus();

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">My Assigned Leads</h1>
        <p className="text-muted-foreground mt-1">Leads routed to you by the Siebert Services team.</p>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="text-center p-12 text-muted-foreground">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="text-center p-16 bg-card border border-border/50 rounded-2xl shadow-sm text-muted-foreground">
            No leads assigned yet. Leads are distributed based on tier and specialization.
          </div>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="bg-card border border-border/50 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-foreground">{lead.companyName}</h3>
                      <LeadStatusBadge status={lead.status} />
                    </div>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                      <Building className="w-4 h-4" /> {lead.contactName}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border/30">
                    {lead.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> <a href={`mailto:${lead.email}`} className="hover:text-foreground transition-colors">{lead.email}</a></p>}
                    {lead.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> <a href={`tel:${lead.phone}`} className="hover:text-foreground transition-colors">{lead.phone}</a></p>}
                    <p className="w-full mt-2 text-foreground"><span className="font-semibold mr-2 text-muted-foreground">Interest:</span> {lead.interest}</p>
                  </div>
                </div>

                <div className="w-full md:w-64 shrink-0 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Update Status</p>
                  <select 
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary shadow-sm"
                    value={lead.status}
                    onChange={(e) => updateStatus({ id: lead.id, status: e.target.value })}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted (Won)</option>
                    <option value="lost">Lost</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-auto">
                    Assigned: {format(new Date(lead.assignedAt), 'MMM d, yyyy')}
                  </p>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </PortalLayout>
  );
}

function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: any, l: string }> = {
    new: { v: "default", l: "New Lead" },
    contacted: { v: "secondary", l: "Contacted" },
    qualified: { v: "warning", l: "Qualified" },
    converted: { v: "success", l: "Converted" },
    lost: { v: "destructive", l: "Lost" }
  };
  const config = map[status] || map.new;
  return <Badge variant={config.v} className="shadow-sm">{config.l}</Badge>;
}
