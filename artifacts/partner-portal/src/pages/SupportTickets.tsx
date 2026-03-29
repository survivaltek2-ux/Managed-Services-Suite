import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthHeaders } from "@/hooks/use-auth";
import { Search, Plus, MessageSquare, X, Send, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
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

  const openCount = tickets.filter(t => t.status === "open").length;
  const progressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

  return (
    <PortalLayout>
      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">Support Cases</h1>
            <span className="text-xs text-muted-foreground">{tickets.length} total</span>
          </div>
          <button onClick={() => setShowCreate(true)} className="sf-btn sf-btn-primary">
            <Plus className="w-3.5 h-3.5" /> New Case
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="sf-card p-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#0176d3]" />
            <div><p className="text-xl font-bold">{openCount}</p><p className="text-[10px] text-muted-foreground uppercase font-medium">Open</p></div>
          </div>
          <div className="sf-card p-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#fe9339]" />
            <div><p className="text-xl font-bold">{progressCount}</p><p className="text-[10px] text-muted-foreground uppercase font-medium">In Progress</p></div>
          </div>
          <div className="sf-card p-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#2e844a]" />
            <div><p className="text-xl font-bold">{resolvedCount}</p><p className="text-[10px] text-muted-foreground uppercase font-medium">Resolved</p></div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)} className="sf-input pl-8" />
          </div>
        </div>

        <div className="sf-card overflow-x-auto">
          <table className="w-full sf-table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No cases found.</td></tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="cursor-pointer" onClick={() => setSelectedTicket(t)}>
                    <td className="font-medium text-[#0176d3]">CASE-{String(t.id).padStart(5, '0')}</td>
                    <td className="font-medium">{t.subject}</td>
                    <td><span className="sf-badge sf-badge-default capitalize">{t.category || "General"}</span></td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><TicketStatus status={t.status} /></td>
                    <td className="text-xs text-muted-foreground">{format(new Date(t.createdAt), 'MMM d, yyyy')}</td>
                    <td>
                      <button className="sf-btn sf-btn-neutral text-xs h-6 px-2">
                        <MessageSquare className="w-3 h-3" /> View
                      </button>
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

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    low: "sf-badge-default", medium: "sf-badge-info", high: "sf-badge-warning", urgent: "sf-badge-error",
  };
  return <span className={`sf-badge ${map[priority] || 'sf-badge-default'} capitalize`}>{priority}</span>;
}

function TicketStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "sf-badge-info", in_progress: "sf-badge-warning", resolved: "sf-badge-success", closed: "sf-badge-default",
  };
  return <span className={`sf-badge ${map[status] || 'sf-badge-default'} capitalize`}>{status.replace('_', ' ')}</span>;
}

function CreateTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ subject: "", description: "", priority: "medium", category: "general" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/partner/tickets", {
        method: "POST", headers: getAuthHeaders(), body: JSON.stringify(form),
      });
      if (res.ok) {
        onCreated();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to submit ticket. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-16 px-4" role="dialog" aria-modal="true" aria-labelledby="ticket-modal-title" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="bg-white w-full max-w-lg rounded shadow-xl border border-[#d8dde6] flex flex-col max-h-[80vh]">
        <div className="px-4 py-3 border-b border-[#d8dde6] flex justify-between items-center bg-[#fafaf9]">
          <h2 id="ticket-modal-title" className="text-base font-bold">New Support Case</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <form id="ticket-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Subject *</label>
              <input className="sf-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Priority</label>
                <select className="sf-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                <select className="sf-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="general">General</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="sales">Sales</option>
                  <option value="onboarding">Onboarding</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Description *</label>
              <textarea className="sf-input min-h-[100px] py-2 resize-y" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>
          </form>
        </div>
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}
        <div className="px-4 py-3 border-t border-[#d8dde6] bg-[#fafaf9] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="sf-btn sf-btn-neutral">Cancel</button>
          <button type="submit" form="ticket-form" disabled={submitting} className="sf-btn sf-btn-primary">
            {submitting ? "Saving..." : "Save"}
          </button>
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
        method: "POST", headers: getAuthHeaders(), body: JSON.stringify({ message: newMessage }),
      });
      setNewMessage("");
      loadMessages();
    } finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4" role="dialog" aria-modal="true" aria-labelledby="ticket-detail-title" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="bg-white w-full max-w-2xl rounded shadow-xl border border-[#d8dde6] flex flex-col max-h-[85vh]">
        <div className="px-4 py-3 border-b border-[#d8dde6] bg-[#fafaf9]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase">CASE-{String(ticket.id).padStart(5, '0')}</p>
              <h2 id="ticket-detail-title" className="text-base font-bold mt-0.5">{ticket.subject}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <TicketStatus status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <span className="text-[10px] text-muted-foreground">{format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}</span>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="bg-[#fafaf9] border border-[#d8dde6] rounded p-3 text-sm">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">Description</p>
            <p className="whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-4">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">No replies yet.</p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.senderType === "partner" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded p-3 text-sm ${msg.senderType === "partner" ? "bg-[#0176d3] text-white" : "bg-[#fafaf9] border border-[#d8dde6] text-foreground"}`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${msg.senderType === "partner" ? "text-white/60" : "text-muted-foreground"}`}>
                    {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {ticket.status !== "closed" && (
          <div className="p-3 border-t border-[#d8dde6] bg-[#fafaf9] flex gap-2">
            <input
              className="sf-input flex-1"
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <button onClick={handleSend} disabled={sending || !newMessage.trim()} className="sf-btn sf-btn-primary">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
