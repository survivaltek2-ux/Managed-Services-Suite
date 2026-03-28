import { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { getAuthHeaders } from "@/hooks/use-auth";
import { Search, X, Send, AlertCircle, Clock, CheckCircle2, User, ChevronDown } from "lucide-react";
import { format } from "date-fns";

interface ClientTicket {
  id: number;
  subject: string;
  description: string;
  priority: string;
  status: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  clientName: string | null;
  clientEmail: string | null;
  clientCompany: string | null;
}

interface TicketMessage {
  id: number;
  ticketId: number;
  senderType: string;
  senderName: string;
  message: string;
  createdAt: string;
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    critical: "bg-[#fef2f2] text-[#ea001e] border border-[#ea001e]/20",
    high: "bg-[#fff8f0] text-[#fe9339] border border-[#fe9339]/20",
    medium: "bg-[#f0f8ff] text-[#0176d3] border border-[#0176d3]/20",
    low: "bg-[#f3f3f3] text-[#706e6b] border border-[#706e6b]/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${colors[priority] || colors.medium}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: "bg-[#f0f8ff] text-[#0176d3] border border-[#0176d3]/20",
    in_progress: "bg-[#fff8f0] text-[#fe9339] border border-[#fe9339]/20",
    resolved: "bg-[#f0fff4] text-[#2e844a] border border-[#2e844a]/20",
    closed: "bg-[#f3f3f3] text-[#706e6b] border border-[#706e6b]/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${colors[status] || colors.open}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function TicketDetailPanel({ ticket, onClose, onStatusUpdate }: {
  ticket: ClientTicket;
  onClose: () => void;
  onStatusUpdate: (id: number, status: string) => void;
}) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/partner/admin/client-tickets/${ticket.id}`, { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : { messages: [] })
      .then(data => { setMessages(data.messages || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [ticket.id]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/partner/admin/client-tickets/${ticket.id}/messages`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setNewMessage("");
        if (currentStatus === "open") {
          setCurrentStatus("in_progress");
          onStatusUpdate(ticket.id, "in_progress");
        }
      }
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/partner/admin/client-tickets/${ticket.id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCurrentStatus(newStatus);
        onStatusUpdate(ticket.id, newStatus);
      }
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-end">
      <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col">
        <div className="p-4 border-b border-[#d8dde6] bg-[#fafaf9] flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-bold text-muted-foreground">#{ticket.id}</span>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={currentStatus} />
              </div>
              <h3 className="font-semibold text-sm text-foreground line-clamp-2">{ticket.subject}</h3>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
                <User className="w-3 h-3" />
                <span className="font-medium">{ticket.clientName || "Unknown"}</span>
                {ticket.clientCompany && <span>· {ticket.clientCompany}</span>}
                {ticket.clientEmail && <span>· {ticket.clientEmail}</span>}
              </div>
              <span className="text-[10px] text-muted-foreground">{format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}</span>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground mt-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-medium">Update Status:</span>
            <div className="relative">
              <select
                value={currentStatus}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={statusUpdating}
                className="text-[11px] border border-[#d8dde6] rounded px-2 py-1 pr-6 bg-white appearance-none cursor-pointer focus:outline-none focus:border-[#0176d3]"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="bg-[#fafaf9] border border-[#d8dde6] rounded p-3 text-sm">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">Description</p>
            <p className="whitespace-pre-wrap text-sm">{ticket.description}</p>
          </div>

          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-4">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">No replies yet. Send the first message below.</p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.senderType === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded p-3 text-sm ${msg.senderType === "admin" ? "bg-[#0176d3] text-white" : "bg-[#fafaf9] border border-[#d8dde6] text-foreground"}`}>
                  <p className={`text-[10px] font-semibold mb-1 ${msg.senderType === "admin" ? "text-white/70" : "text-muted-foreground"}`}>
                    {msg.senderName}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${msg.senderType === "admin" ? "text-white/60" : "text-muted-foreground"}`}>
                    {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {currentStatus !== "closed" && (
          <div className="p-3 border-t border-[#d8dde6] bg-[#fafaf9] flex gap-2">
            <input
              className="sf-input flex-1 text-sm"
              placeholder="Reply to client..."
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

export default function ClientTickets() {
  const [tickets, setTickets] = useState<ClientTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<ClientTicket | null>(null);

  const loadTickets = () => {
    fetch("/api/partner/admin/client-tickets", { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setTickets(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadTickets(); }, []);

  const handleStatusUpdate = (id: number, newStatus: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const filtered = tickets.filter(t => {
    const matchesSearch = (
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.clientName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.clientEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.clientCompany || "").toLowerCase().includes(search.toLowerCase())
    );
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCount = tickets.filter(t => t.status === "open").length;
  const progressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

  return (
    <PortalLayout>
      {selectedTicket && (
        <TicketDetailPanel
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">Client Support Tickets</h1>
            <span className="text-xs text-muted-foreground">{tickets.length} total</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="sf-card p-3 flex items-center gap-3 cursor-pointer hover:border-[#0176d3] transition-colors" onClick={() => setStatusFilter(statusFilter === "open" ? "all" : "open")}>
            <AlertCircle className="w-5 h-5 text-[#0176d3]" />
            <div><p className="text-xl font-bold">{openCount}</p><p className="text-[10px] text-muted-foreground uppercase font-medium">Open</p></div>
          </div>
          <div className="sf-card p-3 flex items-center gap-3 cursor-pointer hover:border-[#fe9339] transition-colors" onClick={() => setStatusFilter(statusFilter === "in_progress" ? "all" : "in_progress")}>
            <Clock className="w-5 h-5 text-[#fe9339]" />
            <div><p className="text-xl font-bold">{progressCount}</p><p className="text-[10px] text-muted-foreground uppercase font-medium">In Progress</p></div>
          </div>
          <div className="sf-card p-3 flex items-center gap-3 cursor-pointer hover:border-[#2e844a] transition-colors" onClick={() => setStatusFilter(statusFilter === "resolved" ? "all" : "resolved")}>
            <CheckCircle2 className="w-5 h-5 text-[#2e844a]" />
            <div><p className="text-xl font-bold">{resolvedCount}</p><p className="text-[10px] text-muted-foreground uppercase font-medium">Resolved</p></div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search by subject, client, company..." value={search} onChange={e => setSearch(e.target.value)} className="sf-input pl-8" />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="sf-input w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="sf-card overflow-x-auto">
          <table className="w-full sf-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Client</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                  {search || statusFilter !== "all" ? "No tickets match your filters." : "No client support tickets yet."}
                </td></tr>
              ) : (
                filtered.map(ticket => (
                  <tr key={ticket.id} className="cursor-pointer hover:bg-[#f3f3f3]" onClick={() => setSelectedTicket(ticket)}>
                    <td className="text-[11px] font-bold text-muted-foreground">#{ticket.id}</td>
                    <td>
                      <p className="font-semibold text-sm line-clamp-1">{ticket.subject}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{ticket.description}</p>
                    </td>
                    <td>
                      <p className="text-sm font-medium">{ticket.clientName || "—"}</p>
                      <p className="text-[11px] text-muted-foreground">{ticket.clientCompany || ticket.clientEmail || "—"}</p>
                    </td>
                    <td><span className="text-[11px] capitalize">{ticket.category || "—"}</span></td>
                    <td><PriorityBadge priority={ticket.priority} /></td>
                    <td><StatusBadge status={ticket.status} /></td>
                    <td><span className="text-[11px] text-muted-foreground">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span></td>
                    <td>
                      <button className="sf-btn sf-btn-neutral text-[11px] px-2 py-1">View</button>
                    </td>
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
