import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useLogin, useRegister, useListTickets, useCreateTicket, TicketInputPriority, TicketInputCategory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Label, Textarea, Badge } from "@/components/ui";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Lock, LogOut, TicketIcon, PlusCircle, AlertCircle,
  FileText, ClipboardList, ExternalLink, Clock, CheckCircle2, XCircle, Eye, Send, X, ChevronRight, MessageSquare
} from "lucide-react";


const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function getApiUrl(path: string) {
  return `${API_BASE}/api${path}`;
}

function ProposalStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft:    { label: "Draft",    className: "bg-gray-100 text-gray-600" },
    sent:     { label: "Sent",     className: "bg-blue-100 text-blue-700" },
    viewed:   { label: "Viewed",   className: "bg-yellow-100 text-yellow-700" },
    accepted: { label: "Accepted", className: "bg-green-100 text-green-700" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
    expired:  { label: "Expired",  className: "bg-gray-100 text-gray-500" },
  };
  const s = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.className}`}>{s.label}</span>;
}

function QuoteStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:  { label: "Pending Review", className: "bg-yellow-100 text-yellow-700" },
    reviewed: { label: "Reviewed",       className: "bg-blue-100 text-blue-700" },
    quoted:   { label: "Quoted",         className: "bg-violet-100 text-violet-700" },
    closed:   { label: "Closed",         className: "bg-gray-100 text-gray-500" },
  };
  const s = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.className}`}>{s.label}</span>;
}

export default function Portal() {
  const { isAuthenticated, token, user, login, logout } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ssoError, setSsoError] = useState("");
  const [ssoLoading, setSsoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"tickets" | "quotes">("tickets");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  const [myQuotes, setMyQuotes] = useState<any[] | null>(null);
  const [myProposals, setMyProposals] = useState<any[] | null>(null);
  const [quotesLoading, setQuotesLoading] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketDetail, setTicketDetail] = useState<any | null>(null);
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get("sso_token");
    const ssoErr = params.get("sso_error");

    if (ssoToken) {
      setSsoLoading(true);
      fetch(getApiUrl("/auth/me"), { headers: { Authorization: `Bearer ${ssoToken}` } })
        .then(r => r.ok ? r.json() : null)
        .then(userData => {
          if (userData) login(ssoToken, userData);
          window.history.replaceState({}, "", window.location.pathname);
          setSsoLoading(false);
        })
        .catch(() => setSsoLoading(false));
      return;
    }

    if (ssoErr) {
      const messages: Record<string, string> = {
        access_denied: "Sign-in was cancelled.",
        token_failed: "Could not complete sign-in. Please try again.",
        profile_failed: "Could not retrieve your profile.",
        server_error: "An error occurred during sign-in. Please try again.",
        no_email: "Could not retrieve your email.",
      };
      setSsoError(messages[ssoErr] || "Sign-in failed. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [login]);

  useEffect(() => {
    if (isAuthenticated && token && activeTab === "quotes" && myQuotes === null) {
      fetchMyQuotes();
    }
  }, [isAuthenticated, token, activeTab]);

  const fetchMyQuotes = async () => {
    setQuotesLoading(true);
    try {
      const res = await fetch(getApiUrl("/my/quotes"), { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setMyQuotes(data.quotes || []);
        setMyProposals(data.proposals || []);
      }
    } catch { /* silent */ }
    finally { setQuotesLoading(false); }
  };


  const handleTicketClick = async (ticket: any) => {
    setSelectedTicket(ticket);
    setTicketDetail(null);
    setTicketDetailLoading(true);
    try {
      const res = await fetch(getApiUrl(`/tickets/${ticket.id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTicketDetail(data);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch { /* silent */ }
    finally { setTicketDetailLoading(false); }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    setReplyLoading(true);
    try {
      const res = await fetch(getApiUrl(`/tickets/${selectedTicket.id}/messages`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage.trim() })
      });
      if (res.ok) {
        const msg = await res.json();
        setTicketDetail((prev: any) => prev ? { ...prev, messages: [...(prev.messages || []), msg] } : prev);
        setReplyMessage("");
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch { /* silent */ }
    finally { setReplyLoading(false); }
  };

  const { toast } = useToast();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const createTicketMutation = useCreateTicket({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: tickets, refetch: refetchTickets } = useListTickets({
    query: { queryKey: ["tickets"], enabled: isAuthenticated },
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketPriority, setTicketPriority] = useState<TicketInputPriority>(TicketInputPriority.medium);
  const [ticketCat, setTicketCat] = useState<TicketInputCategory>(TicketInputCategory.other);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginMutation.mutateAsync({ data: { email, password } });
      login(res.token, res.user);
      toast({ title: "Welcome back!" });
    } catch {
      toast({ variant: "destructive", title: "Login failed", description: "Invalid credentials." });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await registerMutation.mutateAsync({ data: { name, email, password, company } });
      login(res.token, res.user);
      toast({ title: "Account created successfully!" });
    } catch {
      toast({ variant: "destructive", title: "Registration failed", description: "Please check your inputs." });
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicketMutation.mutateAsync({
        data: { subject: ticketSubject, description: ticketDesc, priority: ticketPriority, category: ticketCat }
      });
      toast({ title: "Ticket created successfully!" });
      setShowNewTicket(false);
      setTicketSubject("");
      setTicketDesc("");
      refetchTickets();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to create ticket." });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  // ── Login / Register screen ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <Lock className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-display font-bold text-navy">Client Portal</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              {isRegistering ? "Create your account" : "Log in to manage your services and tickets"}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            {ssoError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-4 border border-destructive/20 text-center font-medium">
                {ssoError}
              </div>
            )}
            {ssoLoading ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">Completing sign-in…</p>
              </div>
            ) : (
              <>
                <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                  {isRegistering && (
                    <>
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input required value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input required value={company} onChange={e => setCompany(e.target.value)} />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full mt-6 h-12 text-base shadow-primary/20 shadow-lg" disabled={loginMutation.isPending || registerMutation.isPending}>
                    {isRegistering ? "Register Account" : "Sign In"}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">
                    {isRegistering ? "Already have an account?" : "Need portal access?"}
                  </span>{" "}
                  <button onClick={() => setIsRegistering(!isRegistering)} className="text-primary font-bold hover:underline">
                    {isRegistering ? "Sign In" : "Register"}
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Authenticated Dashboard ─────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy">Welcome back, {(user as any)?.name}</h1>
            <p className="text-muted-foreground">{(user as any)?.company}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {activeTab === "tickets" && (
              <Button variant="outline" onClick={() => setShowNewTicket(true)} className="gap-2 border-primary text-primary hover:bg-primary/5">
                <PlusCircle className="w-4 h-4" /> New Ticket
              </Button>
            )}
            {activeTab === "quotes" && (
              <Button variant="outline" onClick={() => window.location.href = "/quote"} className="gap-2 border-primary text-primary hover:bg-primary/5">
                <FileText className="w-4 h-4" /> New Quote Request
              </Button>
            )}
            <Button variant="ghost" onClick={logout} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white border rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "tickets" ? "bg-navy text-white shadow-sm" : "text-muted-foreground hover:text-navy"
            }`}
          >
            <TicketIcon className="w-4 h-4" /> Support Tickets
          </button>
          <button
            onClick={() => {
              setActiveTab("quotes");
              if (myQuotes === null) fetchMyQuotes();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "quotes" ? "bg-navy text-white shadow-sm" : "text-muted-foreground hover:text-navy"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> My Quotes
          </button>
        </div>

        {/* ── Tickets Tab ─────────────────────────────────────────────── */}
        {activeTab === "tickets" && (
          <>
            {showNewTicket && (
              <Card className="mb-8 border-primary/20 shadow-lg">
                <CardHeader className="bg-primary/5 border-b pb-4">
                  <CardTitle className="flex items-center justify-between text-xl">
                    <span>Create Support Ticket</span>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewTicket(false)}>Cancel</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input required value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select
                          className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                          value={ticketCat} onChange={e => setTicketCat(e.target.value as TicketInputCategory)}
                        >
                          {Object.values(TicketInputCategory).map(c => (
                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Priority</Label>
                        <div className="flex flex-wrap gap-4 mt-2">
                          {Object.values(TicketInputPriority).map(p => (
                            <label key={p} className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer ${ticketPriority === p ? "bg-primary/10 border-primary" : ""}`}>
                              <input type="radio" name="priority" checked={ticketPriority === p} onChange={() => setTicketPriority(p)} className="text-primary" />
                              <span className="capitalize font-medium text-sm text-navy">{p}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea required value={ticketDesc} onChange={e => setTicketDesc(e.target.value)} placeholder="Please describe the issue in detail…" />
                      </div>
                    </div>
                    <Button type="submit" className="mt-4" disabled={createTicketMutation.isPending}>
                      {createTicketMutation.isPending ? "Submitting…" : "Submit Ticket"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
              <TicketIcon className="w-5 h-5" /> Recent Tickets
            </h2>

            {!tickets ? (
              <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
            ) : tickets.length === 0 ? (
              <Card className="border-dashed bg-transparent shadow-none">
                <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p>No support tickets found.</p>
                  <Button variant="link" onClick={() => setShowNewTicket(true)}>Open a new ticket</Button>
                </CardContent>
              </Card>
            ) : (
              <>
              <div className="grid grid-cols-1 gap-4">
                {tickets.map(t => (
                  <Card key={t.id} className="hover:shadow-md transition-shadow cursor-pointer border hover:border-primary/30" onClick={() => handleTicketClick(t)}>
                    <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground">#{t.id}</span>
                          <h3 className="font-bold text-navy text-lg">{t.subject}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{t.description}</p>
                        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                          <span className="capitalize bg-gray-100 px-2 py-1 rounded">{t.category}</span>
                          <span>•</span>
                          <span>Opened {format(new Date(t.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
                        <Badge variant={getPriorityColor(t.priority) as any} className="capitalize">{t.priority} Priority</Badge>
                        <Badge variant={t.status === "closed" || t.status === "resolved" ? "secondary" : "outline"} className="capitalize bg-white">{t.status.replace("_", " ")}</Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Ticket Detail Panel */}
              {selectedTicket && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-start sm:justify-end" onClick={e => e.target === e.currentTarget && setSelectedTicket(null)}>
                  <div className="w-full sm:max-w-lg sm:h-full bg-white rounded-t-2xl sm:rounded-none shadow-2xl flex flex-col max-h-[90vh] sm:max-h-full">
                    <div className="p-4 border-b flex items-start justify-between gap-3 bg-gray-50 rounded-t-2xl sm:rounded-none">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold text-muted-foreground">#{selectedTicket.id}</span>
                          <Badge variant={getPriorityColor(selectedTicket.priority) as any} className="capitalize text-xs">{selectedTicket.priority}</Badge>
                          <Badge variant={selectedTicket.status === "closed" || selectedTicket.status === "resolved" ? "secondary" : "outline"} className="capitalize text-xs">{selectedTicket.status.replace("_", " ")}</Badge>
                        </div>
                        <h3 className="font-bold text-navy">{selectedTicket.subject}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(selectedTicket.createdAt), "MMM dd, yyyy")}</p>
                      </div>
                      <button onClick={() => setSelectedTicket(null)} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      <div className="bg-gray-50 border rounded-xl p-3 text-sm">
                        <p className="text-xs text-muted-foreground font-semibold uppercase mb-1.5">Your original message</p>
                        <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                      </div>

                      {ticketDetailLoading ? (
                        <div className="flex justify-center py-6"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
                      ) : ticketDetail?.messages?.length === 0 ? (
                        <div className="text-center py-6 text-sm text-muted-foreground flex flex-col items-center gap-2">
                          <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
                          <p>No replies yet — we'll get back to you soon.</p>
                        </div>
                      ) : (
                        ticketDetail?.messages?.map((msg: any) => (
                          <div key={msg.id} className={`flex ${msg.senderType === "client" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] rounded-xl p-3 text-sm ${msg.senderType === "client" ? "bg-primary text-white" : "bg-gray-100 text-foreground"}`}>
                              <p className={`text-xs font-semibold mb-1 ${msg.senderType === "client" ? "text-white/70" : "text-muted-foreground"}`}>{msg.senderName}</p>
                              <p className="whitespace-pre-wrap">{msg.message}</p>
                              <p className={`text-[10px] mt-1.5 ${msg.senderType === "client" ? "text-white/60" : "text-muted-foreground"}`}>{format(new Date(msg.createdAt), "MMM d, h:mm a")}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {selectedTicket.status !== "closed" && (
                      <div className="p-3 border-t bg-gray-50 flex gap-2">
                        <Input
                          placeholder="Add a reply..."
                          value={replyMessage}
                          onChange={e => setReplyMessage(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleReply()}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleReply} disabled={replyLoading || !replyMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              </>
            )}
          </>
        )}

        {/* ── My Quotes Tab ───────────────────────────────────────────── */}
        {activeTab === "quotes" && (
          <div className="space-y-8">

            {/* Proposals section */}
            <div>
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Proposals from Siebert Services
              </h2>

              {quotesLoading ? (
                <div className="text-center py-10"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
              ) : !myProposals || myProposals.length === 0 ? (
                <Card className="border-dashed bg-transparent shadow-none">
                  <CardContent className="py-10 text-center text-muted-foreground flex flex-col items-center">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="font-medium">No proposals yet</p>
                    <p className="text-sm mt-1">When we prepare a quote proposal, it will appear here for you to review and sign.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {myProposals.map((p: any) => (
                    <Card key={p.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-xs font-bold text-muted-foreground font-mono">{p.proposalNumber}</span>
                              <ProposalStatusBadge status={p.status} />
                            </div>
                            <h3 className="font-bold text-navy text-lg leading-tight">{p.title}</h3>
                            {p.summary && <p className="text-sm text-muted-foreground line-clamp-2">{p.summary}</p>}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                              {p.total && (
                                <span className="font-semibold text-navy text-sm">
                                  Total: ${parseFloat(p.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </span>
                              )}
                              {p.validUntil && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Valid until {format(new Date(p.validUntil), "MMM dd, yyyy")}
                                </span>
                              )}
                              <span>Received {format(new Date(p.createdAt), "MMM dd, yyyy")}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {["accepted", "rejected", "expired"].includes(p.status) ? (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                {p.status === "accepted" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                {p.status === "rejected" && <XCircle className="w-4 h-4 text-red-500" />}
                                <span className="capitalize">{p.status}</span>
                              </div>
                            ) : (
                              <a href={`/proposal/${p.proposalNumber}`} target="_blank" rel="noreferrer">
                                <Button size="sm" className="gap-2">
                                  <ExternalLink className="w-4 h-4" /> View & Sign
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Quote requests section */}
            <div>
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Send className="w-5 h-5" /> My Quote Requests
              </h2>

              {quotesLoading ? (
                <div className="text-center py-10"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
              ) : !myQuotes || myQuotes.length === 0 ? (
                <Card className="border-dashed bg-transparent shadow-none">
                  <CardContent className="py-10 text-center text-muted-foreground flex flex-col items-center">
                    <ClipboardList className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="font-medium">No quote requests yet</p>
                    <p className="text-sm mt-1">Submit a quote request and track its progress here.</p>
                    <Button variant="default" className="mt-4 gap-2" onClick={() => window.location.href = "/quote"}>
                      <FileText className="w-4 h-4" /> Build a Quote Request
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {myQuotes.map((q: any) => (
                    <Card key={q.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-bold text-muted-foreground">#{q.id}</span>
                            <QuoteStatusBadge status={q.status} />
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {(Array.isArray(q.services) ? q.services : [q.services]).map((svc: string) => (
                              <span key={svc} className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">{svc}</span>
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                            {q.budget && <span>Budget: {q.budget}</span>}
                            {q.timeline && <span>Timeline: {q.timeline}</span>}
                            <span>Submitted {format(new Date(q.createdAt), "MMM dd, yyyy")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {q.status === "quoted" && (
                            <span className="text-xs text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" /> Check Proposals tab
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
