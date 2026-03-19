import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthHeaders } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, X, Send } from "lucide-react";
import { format } from "date-fns";

interface Ticket {
  id: number;
  subject: string;
  description: string;
  priority: string;
  status: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: number;
  ticketId: number;
  senderType: string;
  message: string;
  createdAt: string;
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const loadTickets = () => {
    fetch("/api/partner/tickets", { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(data => setTickets(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTickets(); }, []);

  const filtered = tickets.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    (t.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Get help from the Siebert Services team.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="rounded-xl shadow-md gap-2">
          <Plus className="w-4 h-4" /> New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Open" count={tickets.filter(t => t.status === "open").length} icon={AlertCircle} color="text-blue-500" />
        <StatCard label="In Progress" count={tickets.filter(t => t.status === "in_progress").length} icon={Clock} color="text-amber-500" />
        <StatCard label="Resolved" count={tickets.filter(t => t.status === "resolved" || t.status === "closed").length} icon={CheckCircle2} color="text-emerald-500" />
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-border/50 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-950 border-border/50 h-10 rounded-lg shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-slate-50/80 dark:bg-slate-900/80 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Subject</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Category</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Priority</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Created</th>
                <th className="px-6 py-4 font-semibold tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">Loading tickets...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-12 text-muted-foreground">No tickets found. Create one if you need help.</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer" onClick={() => setSelectedTicket(t)}>
                    <td className="px-6 py-4 font-medium text-foreground">{t.subject}</td>
                    <td className="px-6 py-4 text-muted-foreground capitalize">{t.category || "General"}</td>
                    <td className="px-6 py-4"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-6 py-4"><TicketStatus status={t.status} /></td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{format(new Date(t.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="rounded-lg gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} onCreated={loadTickets} />}
      {selectedTicket && <TicketDetail ticket={selectedTicket} onClose={() => { setSelectedTicket(null); loadTickets(); }} />}
    </PortalLayout>
  );
}

function StatCard({ label, count, icon: Icon, color }: { label: string; count: number; icon: any; color: string }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex items-center gap-4">
      <Icon className={`w-5 h-5 ${color}`} />
      <div>
        <p className="text-2xl font-bold text-foreground">{count}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, any> = {
    low: "secondary", medium: "default", high: "warning", urgent: "destructive",
  };
  return <Badge variant={map[priority] || "secondary"} className="capitalize">{priority}</Badge>;
}

function TicketStatus({ status }: { status: string }) {
  const map: Record<string, { variant: any; label: string }> = {
    open: { variant: "default", label: "Open" },
    in_progress: { variant: "warning", label: "In Progress" },
    resolved: { variant: "success", label: "Resolved" },
    closed: { variant: "secondary", label: "Closed" },
  };
  const config = map[status] || { variant: "secondary", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function CreateTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ subject: "", description: "", priority: "medium", category: "general" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/partner/tickets", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onCreated();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-3xl">
          <h2 className="text-xl font-display font-bold">Create Support Ticket</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <form id="ticket-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Subject *</label>
              <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Priority</label>
                <select className="w-full h-10 px-3 rounded-lg border border-border bg-white dark:bg-slate-950 text-sm" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Category</label>
                <select className="w-full h-10 px-3 rounded-lg border border-border bg-white dark:bg-slate-950 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="general">General</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="sales">Sales</option>
                  <option value="onboarding">Onboarding</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Description *</label>
              <textarea className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-950 text-sm resize-y" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 rounded-b-3xl flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button type="submit" form="ticket-form" disabled={submitting} className="rounded-xl px-8 shadow-md">
            {submitting ? "Creating..." : "Submit Ticket"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TicketDetail({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMessages = () => {
    fetch(`/api/partner/tickets/${ticket.id}`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => setMessages(data.messages || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMessages(); }, [ticket.id]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/partner/tickets/${ticket.id}/messages`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: newMessage }),
      });
      setNewMessage("");
      loadMessages();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-display font-bold">{ticket.subject}</h2>
              <div className="flex items-center gap-2 mt-2">
                <TicketStatus status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <span className="text-xs text-muted-foreground">{format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-sm">
            <p className="text-muted-foreground text-xs mb-1 font-semibold uppercase">Original Description</p>
            <p className="text-foreground whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground text-sm py-4">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">No replies yet.</p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.senderType === "partner" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.senderType === "partner" ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-slate-800 text-foreground"}`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-xs mt-1 ${msg.senderType === "partner" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {ticket.status !== "closed" && (
          <div className="p-4 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 rounded-b-3xl">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="bg-white dark:bg-slate-950 rounded-xl"
              />
              <Button onClick={handleSend} disabled={sending || !newMessage.trim()} className="rounded-xl px-4 shadow-md">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
