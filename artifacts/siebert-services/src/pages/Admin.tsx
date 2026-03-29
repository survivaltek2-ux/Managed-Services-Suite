import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Settings, Briefcase, MessageSquare, Users, HelpCircle,
  Inbox, FileText, Ticket as TicketIcon, LogOut, Loader2, Plus, Edit2,
  Trash2, Save, Search, Download, Activity, PenTool, Eye, Send, Check,
  X, ChevronDown, BarChart3, BarChart2, Clock, DollarSign, AlertCircle, Mail, KeyRound,
  RefreshCw, CreditCard, TrendingUp, Package
} from "lucide-react";
import {
  Button, Input, Textarea, Label, Card, CardHeader, CardTitle, CardContent, Badge,
} from "@/components/ui";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type TabType = "dashboard" | "settings" | "services" | "testimonials" | "team" | "faq" | "blog" | "users" | "activity" | "tsdIntegrations" | "reporting" | "inquiries" | "invoices";

const TABS: { id: TabType; label: string; icon: React.ReactNode; section?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, section: "Overview" },
  { id: "inquiries", label: "Inquiries", icon: <Inbox size={18} />, section: "Management" },
  { id: "invoices", label: "Invoices", icon: <CreditCard size={18} /> },
  { id: "blog", label: "Blog Posts", icon: <PenTool size={18} />, section: "Content" },
  { id: "services", label: "Services", icon: <Briefcase size={18} /> },
  { id: "testimonials", label: "Testimonials", icon: <MessageSquare size={18} /> },
  { id: "team", label: "Team Members", icon: <Users size={18} /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle size={18} /> },
  { id: "settings", label: "Site Settings", icon: <Settings size={18} /> },
  { id: "tsdIntegrations", label: "TSD Integrations", icon: <RefreshCw size={18} />, section: "Integrations" },
  { id: "users", label: "Users", icon: <Users size={18} />, section: "System" },
  { id: "reporting", label: "Reporting", icon: <BarChart2 size={18} /> },
  { id: "activity", label: "Activity Log", icon: <Activity size={18} /> },
];

export default function Admin() {
  const { user, token, login, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginMode, setLoginMode] = useState<"password" | "code">("password");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, any>>({});

  const isAdmin = user?.role === "admin";
  const headers = () => ({
    "Authorization": `Bearer ${token || localStorage.getItem("siebert_token")}`,
    "Content-Type": "application/json"
  });

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchData(activeTab);
    else setLoading(false);
  }, [isAuthenticated, isAdmin, activeTab]);

  const fetchData = async (tab: TabType) => {
    setLoading(true);
    try {
      const endpoints: Record<string, string> = {
        dashboard: "/api/admin/dashboard/stats",
        settings: "/api/admin/cms/settings",
        smtp: "/api/admin/smtp",
        services: "/api/admin/cms/services",
        testimonials: "/api/admin/cms/testimonials",
        team: "/api/admin/cms/team",
        faq: "/api/admin/cms/faq",
        blog: "/api/admin/cms/blog",
        users: "/api/admin/users",
        activity: "/api/admin/activity",
        tsdIntegrations: "/api/admin/tsd/configs",
        reporting: "/api/admin/reports",
        inquiries: "/api/admin/contacts",
        invoices: "/api/admin/invoices",
      };
      if (tab === "inquiries") {
        const [contactRes, quoteRes, ticketRes] = await Promise.all([
          fetch("/api/admin/contacts", { headers: headers() }),
          fetch("/api/admin/quotes", { headers: headers() }),
          fetch("/api/admin/tickets", { headers: headers() }),
        ]);
        const [contactData, quoteData, ticketData] = await Promise.all([
          contactRes.ok ? contactRes.json() : [],
          quoteRes.ok ? quoteRes.json() : [],
          ticketRes.ok ? ticketRes.json() : [],
        ]);
        setData(prev => ({ ...prev, contacts: contactData, quotes: quoteData, tickets: ticketData }));
        setLoading(false);
        return;
      }
      if (tab === "tsdIntegrations") {
        const [cfgRes, logRes, productRes] = await Promise.all([
          fetch(endpoints["tsdIntegrations"], { headers: headers() }),
          fetch("/api/admin/tsd/logs?limit=50", { headers: headers() }),
          fetch("/api/admin/tsd-products", { headers: headers() }),
        ]);
        const [cfgData, logData, productData] = await Promise.all([
          cfgRes.ok ? cfgRes.json() : [],
          logRes.ok ? logRes.json() : [],
          productRes.ok ? productRes.json() : [],
        ]);
        setData(prev => ({ ...prev, tsdConfigs: cfgData, tsdLogs: logData, tsdProducts: productData }));
        setLoading(false);
        return;
      }
      if (tab === "settings") {
        const [cmsRes, smtpRes] = await Promise.all([
          fetch(endpoints["settings"], { headers: headers() }),
          fetch(endpoints["smtp"], { headers: headers() }),
        ]);
        const [cmsData, smtpData] = await Promise.all([
          cmsRes.ok ? cmsRes.json() : null,
          smtpRes.ok ? smtpRes.json() : null,
        ]);
        setData(prev => ({ ...prev, ...(cmsData ? { settings: cmsData } : {}), ...(smtpData ? { smtp: smtpData } : {}) }));
      } else {
        const res = await fetch(endpoints[tab], { headers: headers() });
        if (res.ok) {
          const result = await res.json();
          setData(prev => ({ ...prev, [tab]: result }));
        }
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const d = await res.json();
      console.log("Login response:", { status: res.status, ok: res.ok, data: d });
      if (res.ok) {
        if (d.user.role === "admin") {
          login(d.token, d.user);
          toast({ title: "Logged in as Admin" });
        } else {
          setLoginError(`Access denied. Your role is '${d.user.role}', admin required.`);
        }
      } else {
        console.error("Login failed:", d);
        setLoginError(d.message || "Invalid credentials");
      }
    } catch (err: any) {
      console.error("Login exception:", err);
      setLoginError(err?.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const exportCSV = async (type: string) => {
    try {
      const res = await fetch(`/api/admin/export/${type}`, { headers: headers() });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: `${type} exported` });
      }
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setLoginError("Please enter your email address."); return; }
    setLoginError("");
    setCodeLoading(true);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), type: "user" }),
      });
      const d = await res.json();
      if (res.ok) setCodeSent(true);
      else setLoginError(d.message || "Failed to send code.");
    } catch { setLoginError("Failed to send code."); }
    finally { setCodeLoading(false); }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setCodeLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code, type: "user" }),
      });
      const d = await res.json();
      if (res.ok) {
        if (d.user.role === "admin") { login(d.token, d.user); toast({ title: "Logged in as Admin" }); }
        else setLoginError(`Access denied. Role '${d.user.role}' is not admin.`);
      } else setLoginError(d.message || "Invalid or expired code.");
    } catch { setLoginError("Failed to verify code."); }
    finally { setCodeLoading(false); }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="text-primary w-6 h-6" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Sign in with your administrator account</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex rounded-lg border overflow-hidden">
              <button type="button" onClick={() => { setLoginMode("password"); setLoginError(""); setCodeSent(false); setCode(""); }} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-colors ${loginMode === "password" ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                <KeyRound className="w-3.5 h-3.5" /> Password
              </button>
              <button type="button" onClick={() => { setLoginMode("code"); setLoginError(""); setCodeSent(false); setCode(""); }} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-colors ${loginMode === "code" ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                <Mail className="w-3.5 h-3.5" /> Email Code
              </button>
            </div>

            {loginError && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{loginError}</div>}

            {loginMode === "password" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Sign In
                </Button>
              </form>
            ) : !codeSent ? (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" />
                </div>
                <Button type="submit" className="w-full" disabled={codeLoading}>
                  <Mail className="w-4 h-4 mr-2" />{codeLoading ? "Sending..." : "Send Login Code"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center text-sm">
                  <p className="text-muted-foreground">Code sent to <strong>{email}</strong></p>
                </div>
                <div className="space-y-2">
                  <Label>6-Digit Code</Label>
                  <Input type="text" required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className="text-center text-xl tracking-widest font-bold" />
                </div>
                <Button type="submit" className="w-full" disabled={codeLoading || code.length !== 6}>
                  {codeLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Verify & Sign In
                </Button>
                <button type="button" onClick={() => { setCodeSent(false); setCode(""); setLoginError(""); }} className="w-full text-sm text-muted-foreground hover:text-foreground">
                  Didn't receive it? Send again
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  let lastSection = "";
  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-60 bg-navy text-white flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="p-5">
          <h2 className="text-lg font-bold font-display tracking-tight text-white/90 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> CMS Admin
          </h2>
        </div>
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {TABS.map((tab) => {
            const showSection = tab.section && tab.section !== lastSection;
            if (tab.section) lastSection = tab.section;
            return (
              <React.Fragment key={tab.id}>
                {showSection && (
                  <div className="text-[10px] uppercase tracking-wider text-white/40 pt-4 pb-1 px-3 font-semibold">
                    {tab.section}
                  </div>
                )}
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.icon}{tab.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 text-xs"
            onClick={() => { logout(); toast({ title: "Logged out" }); }}>
            <LogOut className="w-3.5 h-3.5 mr-2" />Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-navy capitalize tracking-tight">
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="animate-fade-in">
              {activeTab === "dashboard" && <DashboardTab stats={data.dashboard} />}
              {activeTab === "settings" && <SettingsTab data={data.settings} smtp={data.smtp} refresh={() => fetchData("settings")} headers={headers} />}
              {activeTab === "services" && <CrudTab items={data.services || []} refresh={() => fetchData("services")} headers={headers} entity="services" fields={[
                { key: "title", label: "Title", type: "text", required: true },
                { key: "description", label: "Description", type: "textarea", required: true },
                { key: "icon", label: "Icon", type: "text" },
                { key: "category", label: "Category", type: "text" },
                { key: "features", label: "Features (one per line)", type: "features" },
                { key: "sortOrder", label: "Sort Order", type: "number" },
                { key: "active", label: "Active", type: "checkbox" },
              ]} columns={["title", "category", "active"]} />}
              {activeTab === "testimonials" && <CrudTab items={data.testimonials || []} refresh={() => fetchData("testimonials")} headers={headers} entity="testimonials" fields={[
                { key: "name", label: "Name", type: "text", required: true },
                { key: "company", label: "Company", type: "text", required: true },
                { key: "role", label: "Role", type: "text" },
                { key: "content", label: "Content", type: "textarea", required: true },
                { key: "rating", label: "Rating (1-5)", type: "number" },
                { key: "sortOrder", label: "Sort Order", type: "number" },
                { key: "active", label: "Active", type: "checkbox" },
              ]} columns={["name", "company", "rating", "active"]} />}
              {activeTab === "team" && <CrudTab items={data.team || []} refresh={() => fetchData("team")} headers={headers} entity="team" fields={[
                { key: "name", label: "Name", type: "text", required: true },
                { key: "role", label: "Role", type: "text", required: true },
                { key: "bio", label: "Bio", type: "textarea" },
                { key: "imageUrl", label: "Image URL", type: "text" },
                { key: "sortOrder", label: "Sort Order", type: "number" },
                { key: "active", label: "Active", type: "checkbox" },
              ]} columns={["name", "role", "active"]} />}
              {activeTab === "faq" && <CrudTab items={data.faq || []} refresh={() => fetchData("faq")} headers={headers} entity="faq" fields={[
                { key: "question", label: "Question", type: "text", required: true },
                { key: "answer", label: "Answer", type: "textarea", required: true },
                { key: "category", label: "Category", type: "text" },
                { key: "sortOrder", label: "Sort Order", type: "number" },
                { key: "active", label: "Active", type: "checkbox" },
              ]} columns={["question", "category", "active"]} />}
              {activeTab === "blog" && <BlogTab posts={data.blog || []} refresh={() => fetchData("blog")} headers={headers} />}
              {activeTab === "inquiries" && <InquiriesTab contacts={data.contacts || []} quotes={data.quotes || []} tickets={data.tickets || []} headers={headers} refresh={() => fetchData("inquiries")} toast={toast} />}
              {activeTab === "invoices" && <InvoicesTab invoices={data.invoices || []} headers={headers} refresh={() => fetchData("invoices")} />}
              {activeTab === "tsdIntegrations" && <TsdIntegrationsTab configs={data.tsdConfigs || []} logs={data.tsdLogs || []} products={data.tsdProducts || []} headers={headers} refresh={() => fetchData("tsdIntegrations")} toast={toast} />}
              {activeTab === "users" && <UsersTab users={data.users || []} refresh={() => fetchData("users")} headers={headers} currentUserId={user?.id} />}
              {activeTab === "activity" && <ActivityTab activities={data.activity || []} />}
              {activeTab === "reporting" && <ReportingTab data={data.reporting} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, sub }: { title: string; value: string | number; icon: React.ReactNode; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">{icon}</div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-navy">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input className="pl-9 h-9" placeholder={placeholder || "Search..."} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function DashboardTab({ stats }: { stats: any }) {
  if (!stats) return <p className="text-muted-foreground">Loading stats...</p>;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Contacts" value={stats.contacts} icon={<Inbox className="text-blue-500 w-5 h-5" />} />
        <StatCard title="Quotes" value={stats.quotes} icon={<FileText className="text-emerald-500 w-5 h-5" />} />
        <StatCard title="Tickets" value={stats.tickets} icon={<TicketIcon className="text-amber-500 w-5 h-5" />} />
        <StatCard title="Open Tickets" value={stats.openTickets} icon={<AlertCircle className="text-red-500 w-5 h-5" />} />
        <StatCard title="Blog Posts" value={stats.blogPosts} icon={<PenTool className="text-purple-500 w-5 h-5" />} />
        <StatCard title="Users" value={stats.users} icon={<Users className="text-teal-500 w-5 h-5" />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Contacts</CardTitle></CardHeader>
          <CardContent>
            {stats.recentContacts?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentContacts.map((c: any) => (
                  <div key={c.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No contacts yet</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Quote Requests</CardTitle></CardHeader>
          <CardContent>
            {stats.recentQuotes?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentQuotes.map((q: any) => (
                  <div key={q.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">{q.company}</p>
                      <p className="text-xs text-muted-foreground">{q.name} - {q.budget || "No budget"}</p>
                    </div>
                    <Badge variant={q.status === "pending" ? "default" : "secondary"}>{q.status}</Badge>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No quotes yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingsTab({ data, smtp, refresh, headers }: { data: any; smtp: any; refresh: () => void; headers: () => any }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [smtpForm, setSmtpForm] = useState({ mailgun_api_key: "", mailgun_domain: "", smtp_host: "", smtp_port: "587", smtp_user: "", smtp_pass: "", smtp_from_email: "", smtp_from_name: "", notification_email: "" });
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);

  useEffect(() => {
    if (Array.isArray(data)) {
      const m: Record<string, string> = {};
      data.forEach((s: any) => { m[s.key] = s.value; });
      setFormData(m);
    } else if (data && typeof data === "object") {
      setFormData(data);
    }
  }, [data]);

  useEffect(() => {
    if (smtp && typeof smtp === "object") {
      setSmtpForm({
        mailgun_api_key: smtp.mailgunApiKeySet ? "••••••••" : "",
        mailgun_domain: smtp.mailgunDomain || "",
        smtp_host: smtp.host || "",
        smtp_port: String(smtp.port || "587"),
        smtp_user: smtp.user || "",
        smtp_pass: smtp.passSet ? "••••••••" : "",
        smtp_from_email: smtp.fromEmail || "",
        smtp_from_name: smtp.fromName || "",
        notification_email: smtp.notificationEmail || "",
      });
    }
  }, [smtp]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/settings", {
        method: "PUT", headers: headers(), body: JSON.stringify(formData),
      });
      if (res.ok) { toast({ title: "Site settings saved" }); refresh(); }
      else toast({ title: "Failed to save", variant: "destructive" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleSmtpSave = async () => {
    setSmtpSaving(true);
    try {
      const res = await fetch("/api/admin/smtp", {
        method: "PUT", headers: headers(), body: JSON.stringify(smtpForm),
      });
      if (res.ok) { toast({ title: "Email settings saved" }); refresh(); }
      else toast({ title: "Failed to save email settings", variant: "destructive" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSmtpSaving(false); }
  };

  const handleSmtpTest = async () => {
    setSmtpTesting(true);
    try {
      const res = await fetch("/api/admin/smtp/test", { method: "POST", headers: headers() });
      const d = await res.json();
      if (d.ok) {
        const provider = d.provider === "mailgun" ? "Mailgun API" : "SMTP";
        toast({ title: "Connection successful", description: `${provider} is configured and working.` });
      } else {
        toast({ title: "Connection failed", description: d.error || "Check your email settings.", variant: "destructive" });
      }
    } catch { toast({ title: "Test failed", variant: "destructive" }); }
    finally { setSmtpTesting(false); }
  };

  const textareas = ["hero_description", "about_story", "zoom_partner_description"];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4" /> Email Configuration</CardTitle>
            {smtp?.activeProvider === "mailgun" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium"><Check className="w-3 h-3" />Mailgun Active</span>}
            {smtp?.activeProvider === "smtp" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"><Check className="w-3 h-3" />SMTP Active</span>}
            {smtp?.activeProvider === "none" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium"><AlertCircle className="w-3 h-3" />Not Configured</span>}
          </div>
          <p className="text-xs text-muted-foreground">Configure outbound email for notifications and login codes. Mailgun API is recommended — SMTP is a fallback.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold">Mailgun API</span>
              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">Recommended</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">API Key</Label>
                <Input
                  type="password"
                  value={smtpForm.mailgun_api_key}
                  onChange={e => setSmtpForm(p => ({ ...p, mailgun_api_key: e.target.value }))}
                  placeholder={smtp?.mailgunApiKeySet ? "Leave blank to keep current" : "key-xxxxxxxxxxxxxxxx"}
                />
                <p className="text-xs text-muted-foreground">Found in Mailgun → Account → API Keys</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sending Domain</Label>
                <Input
                  value={smtpForm.mailgun_domain}
                  onChange={e => setSmtpForm(p => ({ ...p, mailgun_domain: e.target.value }))}
                  placeholder="mg.siebertrservices.com"
                />
                <p className="text-xs text-muted-foreground">The domain verified in your Mailgun account</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-3">SMTP Fallback <span className="text-xs font-normal text-muted-foreground">(used only if Mailgun is not configured)</span></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">SMTP Host</Label>
                <Input value={smtpForm.smtp_host} onChange={e => setSmtpForm(p => ({ ...p, smtp_host: e.target.value }))} placeholder="smtp.mailgun.org" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">SMTP Port</Label>
                <Input value={smtpForm.smtp_port} onChange={e => setSmtpForm(p => ({ ...p, smtp_port: e.target.value }))} placeholder="587" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Username</Label>
                <Input value={smtpForm.smtp_user} onChange={e => setSmtpForm(p => ({ ...p, smtp_user: e.target.value }))} placeholder="postmaster@mg.yourdomain.com" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Password</Label>
                <Input type="password" value={smtpForm.smtp_pass} onChange={e => setSmtpForm(p => ({ ...p, smtp_pass: e.target.value }))} placeholder={smtp?.passSet ? "Leave blank to keep current" : "SMTP password"} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-3">Sender &amp; Notifications</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">From Email</Label>
                <Input value={smtpForm.smtp_from_email} onChange={e => setSmtpForm(p => ({ ...p, smtp_from_email: e.target.value }))} placeholder="notifications@siebertrservices.com" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">From Name</Label>
                <Input value={smtpForm.smtp_from_name} onChange={e => setSmtpForm(p => ({ ...p, smtp_from_name: e.target.value }))} placeholder="Siebert Services" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-xs">Admin Notification Email</Label>
                <Input value={smtpForm.notification_email} onChange={e => setSmtpForm(p => ({ ...p, notification_email: e.target.value }))} placeholder="sales@siebertrservices.com" />
                <p className="text-xs text-muted-foreground">Contact forms, quotes, and deal registrations are sent here.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t">
            <Button onClick={handleSmtpSave} disabled={smtpSaving}>
              {smtpSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save Email Settings
            </Button>
            <Button variant="outline" onClick={handleSmtpTest} disabled={smtpTesting}>
              {smtpTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4" /> Site Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className={textareas.includes(key) ? "md:col-span-2 space-y-1" : "space-y-1"}>
                <Label className="text-xs capitalize">{key.replace(/_/g, " ")}</Label>
                {textareas.includes(key)
                  ? <Textarea value={value} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} className="min-h-[80px]" />
                  : <Input value={value} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} />}
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save Site Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface FieldDef { key: string; label: string; type: "text" | "textarea" | "number" | "checkbox" | "features" | "select"; required?: boolean; options?: string[] }

function CrudTab({ items, refresh, headers, entity, fields, columns }: {
  items: any[]; refresh: () => void; headers: () => any; entity: string;
  fields: FieldDef[]; columns: string[];
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const filtered = useMemo(() => {
    if (!search) return items;
    const s = search.toLowerCase();
    return items.filter(i => columns.some(c => String(i[c] ?? "").toLowerCase().includes(s)));
  }, [items, search, columns]);

  const openAdd = () => {
    setEditing(null);
    const init: Record<string, any> = {};
    fields.forEach(f => {
      if (f.type === "checkbox") init[f.key] = true;
      else if (f.type === "number") init[f.key] = 0;
      else init[f.key] = "";
    });
    setForm(init);
    setOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    const init: Record<string, any> = {};
    fields.forEach(f => {
      if (f.type === "features") init[f.key] = Array.isArray(item[f.key]) ? item[f.key].join("\n") : (item[f.key] || "");
      else init[f.key] = item[f.key] ?? "";
    });
    setForm(init);
    setOpen(true);
  };

  const handleSave = async () => {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/admin/cms/${entity}/${editing.id}` : `/api/admin/cms/${entity}`;
    const payload = { ...form };
    fields.forEach(f => {
      if (f.type === "features") payload[f.key] = form[f.key].split("\n").map((s: string) => s.trim()).filter(Boolean);
      if (f.type === "number") payload[f.key] = Number(form[f.key]);
    });
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(payload) });
      if (res.ok) { toast({ title: "Saved" }); setOpen(false); refresh(); }
      else toast({ title: "Failed", variant: "destructive" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`/api/admin/cms/${entity}/${id}`, { method: "DELETE", headers: headers() });
      if (res.ok) { toast({ title: "Deleted" }); refresh(); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1.5" />Add</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                {columns.map(c => <th key={c} className="px-5 py-3 text-left">{c}</th>)}
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                  {columns.map(c => (
                    <td key={c} className="px-5 py-3">
                      {typeof item[c] === "boolean" ? <Badge variant={item[c] ? "default" : "secondary"}>{item[c] ? "Yes" : "No"}</Badge>
                       : String(item[c] ?? "").slice(0, 60)}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No items found.</div>}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            {fields.map(f => (
              <div key={f.key} className="space-y-1">
                {f.type === "checkbox" ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.checked }))} className="w-4 h-4" />
                    {f.label}
                  </label>
                ) : (
                  <>
                    <Label className="text-xs">{f.label}</Label>
                    {f.type === "textarea" || f.type === "features"
                      ? <Textarea value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="min-h-[80px]" />
                      : <Input type={f.type === "number" ? "number" : "text"} value={form[f.key] ?? ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />}
                  </>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BlogTab({ posts, refresh, headers }: { posts: any[]; refresh: () => void; headers: () => any }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", coverImage: "", author: "Siebert Services", category: "general", tags: "", status: "draft", featured: false });

  const filtered = useMemo(() => {
    if (!search) return posts;
    const s = search.toLowerCase();
    return posts.filter(p => p.title.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
  }, [posts, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", slug: "", excerpt: "", content: "", coverImage: "", author: "Siebert Services", category: "general", tags: "", status: "draft", featured: false });
    setOpen(true);
  };

  const openEdit = (post: any) => {
    setEditing(post);
    setForm({
      ...post,
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/admin/cms/blog/${editing.id}` : "/api/admin/cms/blog";
    const payload = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(payload) });
      if (res.ok) { toast({ title: "Saved" }); setOpen(false); refresh(); }
      else toast({ title: "Failed", variant: "destructive" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/admin/cms/blog/${id}`, { method: "DELETE", headers: headers() });
      if (res.ok) { toast({ title: "Deleted" }); refresh(); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1.5" />New Post</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => (
                <tr key={post.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3 font-medium">{post.title}{post.featured && <Badge className="ml-2" variant="default">Featured</Badge>}</td>
                  <td className="px-5 py-3">{post.category}</td>
                  <td className="px-5 py-3">
                    <Badge variant={post.status === "published" ? "default" : post.status === "draft" ? "secondary" : "outline"}>{post.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(post)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(post.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No blog posts yet.</div>}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Slug</Label><Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated" /></div>
              <div className="space-y-1"><Label className="text-xs">Category</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Author</Label><Input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Cover Image URL</Label><Input value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Tags (comma separated)</Label><Input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Excerpt</Label><Textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} className="min-h-[60px]" /></div>
            <div className="space-y-1"><Label className="text-xs">Content (Markdown/HTML)</Label><Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="min-h-[200px] font-mono text-xs" /></div>
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <select className="h-9 px-3 rounded-md border text-sm bg-background" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm pt-5">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4" />Featured
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsersTab({ users, refresh, headers, currentUserId }: { users: any[]; refresh: () => void; headers: () => any; currentUserId?: number }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", phone: "", role: "client" });
  const [isCreating, setIsCreating] = useState(false);
  
  const filtered = useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }, [users, search]);

  const updateRole = async (id: number, role: string) => {
    try {
      await fetch(`/api/admin/users/${id}/role`, { method: "PUT", headers: headers(), body: JSON.stringify({ role }) });
      toast({ title: `Role updated to ${role}` }); refresh();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    if (id === currentUserId) { toast({ title: "Cannot delete your own account", variant: "destructive" }); return; }
    if (!confirm("Delete this user?")) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE", headers: headers() });
      toast({ title: "Deleted" }); refresh();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const createUser = async () => {
    if (!form.name || !form.email || !form.password || !form.company) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: "User created successfully" });
        setCreateOpen(false);
        setForm({ name: "", email: "", password: "", company: "", phone: "", role: "client" });
        refresh();
      } else {
        const data = await res.json();
        toast({ title: data.message || "Failed to create user", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error creating user", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> New User</Button>
      </div>

      {createOpen && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="user@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input placeholder="Company name" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select className="h-9 px-3 rounded-md border text-sm bg-background w-full" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={createUser} disabled={isCreating}>{isCreating ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Company</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3 font-medium">{u.name}</td>
                  <td className="px-5 py-3">{u.email}</td>
                  <td className="px-5 py-3">{u.company}</td>
                  <td className="px-5 py-3">
                    <select className="h-7 px-2 rounded border text-xs bg-background" value={u.role}
                      onChange={e => updateRole(u.id, e.target.value)} disabled={u.id === currentUserId}>
                      <option value="client">Client</option><option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    {u.id !== currentUserId && <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(u.id)}><Trash2 className="w-4 h-4" /></Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No users found.</div>}
        </div>
      </Card>
    </div>
  );
}

function ActivityTab({ activities }: { activities: any[] }) {
  const actionColors: Record<string, string> = { create: "text-emerald-600", update: "text-blue-600", delete: "text-red-600" };
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {activities.map((a: any) => (
            <div key={a.id} className="px-5 py-3 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${a.action === "create" ? "bg-emerald-500" : a.action === "delete" ? "bg-red-500" : "bg-blue-500"}`} />
              <div className="flex-1">
                <p className="text-sm">
                  <span className={`font-medium ${actionColors[a.action] || ""}`}>{a.action}</span>
                  {" "}<span className="text-muted-foreground">{a.entity}</span>
                  {a.entityId && <span className="text-muted-foreground"> #{a.entityId}</span>}
                </p>
                {a.details && <p className="text-xs text-muted-foreground">{a.details}</p>}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {activities.length === 0 && <div className="p-8 text-center text-muted-foreground">No activity logged yet.</div>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── TSD Product Catalog Section ─────────────────────────────────────────────

const TSD_PROVIDERS_LIST = ["telarus", "intelisys"];
const TSD_PROVIDER_DISPLAY: Record<string, string> = {
  telarus: "Telarus",
  intelisys: "Intelisys",
};

const EMPTY_PRODUCT_FORM = {
  category: "", name: "", description: "",
  availableAt: [] as string[], active: true, sortOrder: 0,
};

function ProductCatalogSection({
  products, headers, refresh, toast,
}: {
  products: any[];
  headers: () => any;
  refresh: () => void;
  toast: any;
}) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT_FORM });
  const [saving, setSaving] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const filteredProducts = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const grouped: Record<string, any[]> = {};
  for (const p of filteredProducts) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }
  const categories = Object.keys(grouped).sort();

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const openCreate = () => {
    setForm({ ...EMPTY_PRODUCT_FORM });
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEdit = (product: any) => {
    setForm({
      category: product.category,
      name: product.name,
      description: product.description || "",
      availableAt: Array.isArray(product.availableAt) ? product.availableAt : [],
      active: product.active,
      sortOrder: product.sortOrder || 0,
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.category.trim() || !form.name.trim()) {
      toast({ title: "Category and name are required", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const url = editingProduct ? `/api/admin/tsd-products/${editingProduct.id}` : "/api/admin/tsd-products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
      if (res.ok) {
        toast({ title: editingProduct ? "Product updated" : "Product created" });
        setShowForm(false);
        refresh();
      } else {
        const err = await res.json();
        toast({ title: err.message || "Failed to save", variant: "destructive" });
      }
    } catch { toast({ title: "Error saving product", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (product: any) => {
    try {
      const res = await fetch(`/api/admin/tsd-products/${product.id}`, {
        method: "PUT", headers: headers(), body: JSON.stringify({ active: !product.active }),
      });
      if (res.ok) { refresh(); toast({ title: product.active ? "Product disabled" : "Product enabled" }); }
      else toast({ title: "Failed to update", variant: "destructive" });
    } catch { toast({ title: "Error updating product", variant: "destructive" }); }
  };

  const handleDelete = async (product: any) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/tsd-products/${product.id}`, { method: "DELETE", headers: headers() });
      if (res.ok) { refresh(); toast({ title: "Product deleted" }); }
      else toast({ title: "Failed to delete", variant: "destructive" });
    } catch { toast({ title: "Error deleting product", variant: "destructive" }); }
  };

  const toggleProvider = (provider: string) => {
    setForm(prev => ({
      ...prev,
      availableAt: prev.availableAt.includes(provider)
        ? prev.availableAt.filter(p => p !== provider)
        : [...prev.availableAt, provider],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Product Catalog</h3>
          <p className="text-sm text-muted-foreground">Manage the product and service catalog shown on the deal registration form.</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus size={14} className="mr-1" />Add Product</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{editingProduct ? "Edit Product" : "New Product"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Category *</Label>
                <Input
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. UCaaS, CCaaS, SD-WAN"
                  list="existing-categories"
                />
                <datalist id="existing-categories">
                  {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Product Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Product or service name"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Brief description (optional)"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Available at TSDs</Label>
              <div className="flex gap-3">
                {TSD_PROVIDERS_LIST.map(provider => (
                  <label key={provider} className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={form.availableAt.includes(provider)}
                      onChange={() => toggleProvider(provider)}
                      className="w-4 h-4 rounded"
                    />
                    {TSD_PROVIDER_DISPLAY[provider]}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Sort Order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="product-active"
                  checked={form.active}
                  onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <Label htmlFor="product-active" className="text-sm cursor-pointer">Active (visible to partners)</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search catalog..."
          className="pl-8"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {search ? "No products match your search." : "No products in catalog."}
            </div>
          ) : (
            <div className="divide-y">
              {categories.map(cat => {
                const items = grouped[cat];
                const isExpanded = !!search || expandedCats.has(cat);
                const activeCount = items.filter(p => p.active).length;
                return (
                  <div key={cat}>
                    <button
                      type="button"
                      onClick={() => !search && toggleCat(cat)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors ${search ? "cursor-default" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        {!search && (
                          <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                        )}
                        <span className="font-medium text-sm">{cat}</span>
                        <Badge className="text-xs bg-muted text-muted-foreground border-0">
                          {activeCount}/{items.length} active
                        </Badge>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t divide-y bg-muted/10">
                        {items.map((product: any) => (
                          <div key={product.id} className={`flex items-center justify-between px-6 py-2.5 ${!product.active ? "opacity-50" : ""}`}>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{product.name}</span>
                                {!product.active && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">inactive</span>
                                )}
                              </div>
                              {product.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{product.description}</p>
                              )}
                              <div className="flex gap-1 mt-1">
                                {(Array.isArray(product.availableAt) ? product.availableAt : []).map((tsd: string) => (
                                  <span key={tsd} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                                    {TSD_PROVIDER_DISPLAY[tsd] || tsd}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                              <button
                                onClick={() => handleToggleActive(product)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${product.active ? "bg-green-500" : "bg-gray-200"}`}
                                title={product.active ? "Disable" : "Enable"}
                              >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${product.active ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                              </button>
                              <Button size="sm" variant="ghost" onClick={() => openEdit(product)} className="h-7 w-7 p-0">
                                <Edit2 size={12} />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(product)} className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TSD Integrations Tab ────────────────────────────────────────────────────

const TSD_PROVIDER_LABELS: Record<string, string> = {
  telarus: "Telarus",
  intelisys: "Intelisys",
};

const TSD_STATUS_COLORS: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  failure: "bg-red-100 text-red-700",
  partial: "bg-yellow-100 text-yellow-700",
};

function TsdIntegrationsTab({
  configs, logs, products, headers, refresh, toast,
}: {
  configs: any[];
  logs: any[];
  products: any[];
  headers: () => any;
  refresh: () => void;
  toast: any;
}) {
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [securityTokenInput, setSecurityTokenInput] = useState("");
  const [webhookInput, setWebhookInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const allProviders = ["telarus", "intelisys"];

  const getConfig = (p: string) => configs.find((c: any) => c.provider === p) || { provider: p, enabled: false };

  const handleToggle = async (provider: string, enabled: boolean) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tsd/configs/${provider}`, {
        method: "PUT", headers: headers(),
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) { refresh(); toast({ title: `${TSD_PROVIDER_LABELS[provider]} ${enabled ? "enabled" : "disabled"}` }); }
      else toast({ title: "Failed to update", variant: "destructive" });
    } catch { toast({ title: "Error updating config", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleSaveCreds = async (provider: string) => {
    setSaving(true);
    try {
      const body: any = {};
      if (usernameInput && !usernameInput.includes("****")) body.username = usernameInput;
      if (passwordInput && !passwordInput.includes("****")) body.password = passwordInput;
      if (provider === "telarus" && securityTokenInput && !securityTokenInput.includes("****")) body.securityToken = securityTokenInput;
      if (webhookInput && !webhookInput.includes("****")) body.webhookSecret = webhookInput;
      const res = await fetch(`/api/admin/tsd/configs/${provider}`, {
        method: "PUT", headers: headers(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        refresh();
        setEditingProvider(null);
        setUsernameInput("");
        setPasswordInput("");
        setSecurityTokenInput("");
        setWebhookInput("");
        toast({ title: "Credentials saved" });
      } else {
        toast({ title: "Failed to save credentials", variant: "destructive" });
      }
    } catch { toast({ title: "Error saving credentials", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleTest = async (provider: string) => {
    setTesting(provider);
    try {
      const res = await fetch(`/api/admin/tsd/configs/${provider}/test`, { method: "POST", headers: headers() });
      const data = await res.json();
      if (data.ok) toast({ title: `${TSD_PROVIDER_LABELS[provider]}: Connection successful` });
      else toast({ title: `Connection failed: ${data.error || "Unknown error"}`, variant: "destructive" });
    } catch { toast({ title: "Test connection error", variant: "destructive" }); }
    finally { setTesting(null); }
  };

  const handleSync = async (provider: string, type: "leads" | "commissions") => {
    setSyncing(`${provider}:${type}`);
    try {
      const res = await fetch(`/api/admin/tsd/sync/${provider}/${type}`, { method: "POST", headers: headers() });
      if (res.ok) {
        toast({ title: `${TSD_PROVIDER_LABELS[provider]} ${type} sync triggered` });
        setTimeout(() => { refresh(); setSyncing(null); }, 2000);
      } else {
        toast({ title: "Failed to trigger sync", variant: "destructive" });
        setSyncing(null);
      }
    } catch { toast({ title: "Error triggering sync", variant: "destructive" }); setSyncing(null); }
  };

  const handleTelarusSync = async (entity: string) => {
    setSyncing(`telarus:${entity}`);
    try {
      const res = await fetch(`/api/admin/telarus/sync/${entity}`, { method: "POST", headers: headers() });
      if (res.ok) {
        toast({ title: `Telarus ${entity} sync triggered` });
        setTimeout(() => { refresh(); setSyncing(null); }, 2000);
      } else {
        toast({ title: "Failed to trigger sync", variant: "destructive" });
        setSyncing(null);
      }
    } catch { toast({ title: "Error triggering sync", variant: "destructive" }); setSyncing(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">TSD Integrations</h2>
        <p className="text-sm text-muted-foreground">Manage two-way integrations with Technology Solution Distributors. Deals are automatically pushed to enabled TSDs when registered.</p>
      </div>

      <div className="grid gap-4">
        {allProviders.map((provider) => {
          const cfg = getConfig(provider);
          const isEditingThis = editingProvider === provider;
          return (
            <Card key={provider}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${cfg.enabled ? "bg-green-500" : "bg-gray-300"}`} />
                    <div>
                      <p className="font-semibold">{TSD_PROVIDER_LABELS[provider]}</p>
                      <p className="text-xs text-muted-foreground capitalize">{provider}</p>
                    </div>
                    {cfg.hasCredential ? (
                      <Badge className="text-xs bg-green-50 text-green-700 border border-green-200">
                        Credentials set
                      </Badge>
                    ) : (
                      <Badge className="text-xs bg-amber-50 text-amber-700 border border-amber-200">
                        No credentials
                      </Badge>
                    )}
                    {provider === "telarus" && cfg.hasSecurityToken && (
                      <Badge className="text-xs bg-blue-50 text-blue-700 border border-blue-200">Security token set</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(provider, !cfg.enabled)}
                      disabled={saving}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cfg.enabled ? "bg-green-500" : "bg-gray-200"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${cfg.enabled ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Button size="sm" variant="outline" onClick={() => handleTest(provider)} disabled={testing === provider}>
                    {testing === provider ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Activity size={14} className="mr-1" />}
                    Test Connection
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSync(provider, "leads")} disabled={!!syncing}>
                    {syncing === `${provider}:leads` ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCw size={14} className="mr-1" />}
                    Sync Leads
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSync(provider, "commissions")} disabled={!!syncing}>
                    {syncing === `${provider}:commissions` ? <Loader2 size={14} className="mr-1 animate-spin" /> : <DollarSign size={14} className="mr-1" />}
                    Sync Commissions
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingProvider(isEditingThis ? null : provider);
                    setUsernameInput("");
                    setPasswordInput("");
                    setSecurityTokenInput("");
                    setWebhookInput("");
                  }}>
                    <KeyRound size={14} className="mr-1" />
                    {isEditingThis ? "Cancel" : "Edit Credentials"}
                  </Button>
                </div>

                {!cfg.hasCredential && (
                  <div className="mb-3 p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    {provider === "telarus"
                      ? <>No credentials configured. Enter your Telarus/Salesforce username, password, and security token below.</>
                      : <>No credentials configured. Enter your {TSD_PROVIDER_LABELS[provider]} username and password below, or set <code className="font-mono bg-amber-100 px-1 rounded">{provider.toUpperCase()}_USERNAME</code> / <code className="font-mono bg-amber-100 px-1 rounded">{provider.toUpperCase()}_PASSWORD</code> environment variables (env vars take precedence).</>
                    }
                  </div>
                )}

                {isEditingThis && (
                  <div className="bg-muted/40 rounded-lg p-4 space-y-3 border">
                    <p className="text-xs text-muted-foreground font-medium">
                      Credentials are encrypted and masked after saving and never shown again.
                      {cfg.credentialSource === "env" && " Currently using env var — DB value would be overridden by env var."}
                    </p>

                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">{TSD_PROVIDER_LABELS[provider]} Username (email)</Label>
                        <Input
                          type="email"
                          placeholder={cfg.hasDbCredential ? "Leave blank to keep existing" : "yourname@company.com"}
                          value={usernameInput}
                          onChange={e => setUsernameInput(e.target.value)}
                          className="text-sm"
                          autoComplete="new-password"
                        />
                        <p className="text-xs text-muted-foreground">
                          Env var <code className="font-mono text-xs">{provider.toUpperCase()}_USERNAME</code> takes precedence.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{TSD_PROVIDER_LABELS[provider]} Password</Label>
                        <Input
                          type="password"
                          placeholder={cfg.hasDbCredential ? "Leave blank to keep existing" : "Enter password"}
                          value={passwordInput}
                          onChange={e => setPasswordInput(e.target.value)}
                          className="font-mono text-sm"
                          autoComplete="new-password"
                        />
                        <p className="text-xs text-muted-foreground">
                          Env var <code className="font-mono text-xs">{provider.toUpperCase()}_PASSWORD</code> takes precedence.
                        </p>
                      </div>
                      {provider === "telarus" && (
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Salesforce Security Token
                            <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
                            {cfg.hasSecurityToken && <span className="ml-2 text-green-600 font-normal">(already set)</span>}
                          </Label>
                          <Input
                            type="password"
                            placeholder={cfg.hasSecurityToken ? "Leave blank to keep existing" : "Leave blank if not required"}
                            value={securityTokenInput}
                            onChange={e => setSecurityTokenInput(e.target.value)}
                            className="font-mono text-sm"
                            autoComplete="new-password"
                          />
                          <p className="text-xs text-muted-foreground">
                            Only needed if your Salesforce org requires it for API access. Env var <code className="font-mono text-xs">TELARUS_SECURITY_TOKEN</code> takes precedence.
                          </p>
                        </div>
                      )}
                    </>

                    <div className="space-y-1">
                      <Label className="text-xs">Webhook Secret (for signature verification)</Label>
                      <Input
                        type="password"
                        placeholder={cfg.hasWebhookSecret ? "Enter new value to replace (leave blank to keep existing)" : "Enter webhook secret"}
                        value={webhookInput}
                        onChange={e => setWebhookInput(e.target.value)}
                        className="font-mono text-sm"
                        autoComplete="new-password"
                      />
                      <p className="text-xs text-muted-foreground">
                        Env var <code className="font-mono text-xs">{provider.toUpperCase()}_WEBHOOK_SECRET</code> takes precedence.
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">Webhook URL: <code className="bg-muted px-1 rounded text-xs">/api/webhooks/tsd/{provider}</code></p>
                    <Button
                      size="sm"
                      onClick={() => handleSaveCreds(provider)}
                      disabled={saving || (
                        provider === "telarus"
                          ? (!usernameInput && !passwordInput && !securityTokenInput && !webhookInput)
                          : (!usernameInput && !passwordInput && !webhookInput)
                      )}
                    >
                      {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
                      Save Credentials
                    </Button>
                  </div>
                )}

                {(cfg.lastLeadSyncAt || cfg.lastCommissionSyncAt) && (
                  <div className="text-xs text-muted-foreground mt-3 flex flex-wrap gap-4">
                    {cfg.lastLeadSyncAt && <span>Last lead sync: {new Date(cfg.lastLeadSyncAt).toLocaleString()}</span>}
                    {cfg.lastCommissionSyncAt && <span>Last commission sync: {new Date(cfg.lastCommissionSyncAt).toLocaleString()}</span>}
                  </div>
                )}

                {provider === "telarus" && cfg.enabled && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">Salesforce Data Sync</p>
                      <Button size="sm" variant="outline" disabled={syncing === "telarus:all"} onClick={() => handleTelarusSync("all")}>
                        {syncing === "telarus:all" ? <Loader2 size={13} className="mr-1 animate-spin" /> : <RefreshCw size={13} className="mr-1" />}
                        Sync All
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: "opportunities", label: "Opportunities", ts: cfg.lastOpportunitySyncAt },
                        { key: "accounts",      label: "Accounts",      ts: cfg.lastAccountSyncAt },
                        { key: "contacts",      label: "Contacts",      ts: cfg.lastContactSyncAt },
                        { key: "orders",        label: "Orders",        ts: cfg.lastOrderSyncAt },
                        { key: "quotes",        label: "Quotes",        ts: cfg.lastQuoteSyncAt },
                        { key: "activities",    label: "Activities",    ts: cfg.lastActivitySyncAt },
                        { key: "tasks",         label: "Tasks",         ts: cfg.lastTaskSyncAt },
                        { key: "vendors",       label: "Vendors",       ts: cfg.lastVendorSyncAt },
                      ].map(({ key, label, ts }) => (
                        <div key={key} className="flex items-center justify-between bg-muted/30 rounded px-2 py-1.5">
                          <div>
                            <span className="font-medium">{label}</span>
                            <span className="block text-muted-foreground">{ts ? new Date(ts).toLocaleString() : "Never synced"}</span>
                          </div>
                          <button
                            disabled={syncing === `telarus:${key}`}
                            onClick={() => handleTelarusSync(key)}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50 ml-2"
                            title={`Sync ${label}`}
                          >
                            {syncing === `telarus:${key}` ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ProductCatalogSection products={products} headers={headers} refresh={refresh} toast={toast} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Sync History</h3>
          <Button size="sm" variant="outline" onClick={refresh}><RefreshCw size={14} className="mr-1" />Refresh</Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-2 text-left font-medium">Provider</th>
                    <th className="px-4 py-2 text-left font-medium">Direction</th>
                    <th className="px-4 py-2 text-left font-medium">Entity</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Records</th>
                    <th className="px-4 py-2 text-left font-medium">Timestamp</th>
                    <th className="px-4 py-2 text-left font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log: any) => (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2 font-medium capitalize">{TSD_PROVIDER_LABELS[log.provider] || log.provider}</td>
                        <td className="px-4 py-2 capitalize">{log.direction}</td>
                        <td className="px-4 py-2 capitalize">{log.entityType}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TSD_STATUS_COLORS[log.status] || "bg-gray-100 text-gray-700"}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">{log.recordsAffected}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-2">
                          {(log.errorMessage || log.payloadSummary) && (
                            <button onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} className="text-xs text-blue-600 hover:underline">
                              {expandedLog === log.id ? "Hide" : "Show"}
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedLog === log.id && (
                        <tr>
                          <td colSpan={7} className="px-4 py-2 bg-muted/30">
                            {log.errorMessage && (
                              <div className="text-xs text-red-600 mb-1"><strong>Error:</strong> {log.errorMessage}</div>
                            )}
                            {log.payloadSummary && (
                              <div className="text-xs text-muted-foreground"><strong>Payload:</strong> {log.payloadSummary}</div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No sync events recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// ─── ReportingTab ─────────────────────────────────────────────────────────────
function ReportingTab({ data }: { data: any }) {
  if (!data) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const invByStatus: Record<string, { count: number; total: number }> = {};
  for (const row of data.invoiceSummary || []) {
    invByStatus[row.status] = { count: parseInt(row.count), total: parseFloat(row.total) };
  }
  const totalInvRevenue = Object.entries(invByStatus).filter(([s]) => s === "paid").reduce((s,[,v]) => s + v.total, 0);

  const ov = data.overview ?? {};
  const kpis = [
    { label: "Total Clients", value: ov.totalUsers ?? 0, icon: <Users className="w-5 h-5 text-blue-500" />, sub: "registered accounts" },
    { label: "Total Tickets", value: ov.totalTickets ?? 0, icon: <TicketIcon className="w-5 h-5 text-orange-500" />, sub: `${ov.openTickets ?? 0} open` },
    { label: "Quote Requests", value: ov.totalQuotes ?? 0, icon: <FileText className="w-5 h-5 text-violet-500" />, sub: "all time" },
    { label: "Proposals Sent", value: ov.totalProposals ?? 0, icon: <Send className="w-5 h-5 text-teal-500" />, sub: `${ov.acceptedProposals ?? 0} accepted` },
    { label: "Invoice Revenue", value: `$${totalInvRevenue.toLocaleString("en-US",{minimumFractionDigits:2})}`, icon: <DollarSign className="w-5 h-5 text-green-500" />, sub: "paid invoices" },
  ];

  const tierColors: Record<string, string> = { bronze: "bg-orange-100 text-orange-700", silver: "bg-gray-100 text-gray-600", gold: "bg-yellow-100 text-yellow-700", platinum: "bg-violet-100 text-violet-700" };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map(k => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">{k.icon}<span className="text-xs text-muted-foreground font-medium">{k.label}</span></div>
              <div className="text-2xl font-bold text-navy">{k.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Status Breakdown */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Invoice Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {INVOICE_STATUSES.map(s => {
                const d = invByStatus[s] || { count: 0, total: 0 };
                const meta = invStatusMeta[s];
                return (
                  <div key={s} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${meta.cls}`}>{meta.label}</span>
                      <span className="text-sm text-muted-foreground">× {d.count}</span>
                    </div>
                    <span className="font-semibold text-sm text-navy">${d.total.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Partners */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Top Partners by Revenue</CardTitle></CardHeader>
          <CardContent>
            {(!data.topPartners || data.topPartners.length === 0) ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No partner data yet</p>
            ) : (
              <div className="space-y-3">
                {data.topPartners.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{i+1}</span>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-navy truncate">{p.company}</div>
                        <div className="text-xs text-muted-foreground">{p.totalDeals ?? 0} deals</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm text-navy">${parseFloat(p.totalRevenue || 0).toLocaleString("en-US",{minimumFractionDigits:0})}</div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${tierColors[p.tier] || "bg-gray-100 text-gray-600"}`}>{p.tier}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Proposals */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4" /> Recent Proposals</CardTitle></CardHeader>
        <CardContent>
          {(!data.recentProposals || data.recentProposals.length === 0) ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No proposals yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  {["Proposal","Title","Status","Total","Created"].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y">
                  {data.recentProposals.map((p: any) => {
                    const statusCls: Record<string,string> = { draft:"bg-gray-100 text-gray-600", sent:"bg-blue-100 text-blue-700", viewed:"bg-yellow-100 text-yellow-700", accepted:"bg-green-100 text-green-700", rejected:"bg-red-100 text-red-700", expired:"bg-gray-200 text-gray-500" };
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{p.proposalNumber}</td>
                        <td className="px-3 py-2 font-medium">{p.title}</td>
                        <td className="px-3 py-2"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusCls[p.status] || "bg-gray-100"}`}>{p.status}</span></td>
                        <td className="px-3 py-2 font-semibold">{p.total ? `$${parseFloat(p.total).toLocaleString("en-US",{minimumFractionDigits:2})}` : "—"}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InquiriesTab({ contacts, quotes, tickets, headers, refresh, toast }: { contacts: any[]; quotes: any[]; tickets: any[]; headers: () => any; refresh: () => void; toast: any }) {
  const [activeSubTab, setActiveSubTab] = React.useState<"contacts" | "quotes" | "tickets">("contacts");

  const deleteItem = async (type: string, id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, { method: "DELETE", headers: headers() });
      if (res.ok) {
        toast({ title: `${type} deleted` });
        refresh();
      } else {
        toast({ title: `Failed to delete ${type}`, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        {["contacts", "quotes", "tickets"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab as any)}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeSubTab === tab ? "border-blue-500 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeSubTab === "contacts" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Contacts</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  {["Name", "Email", "Company", "Date", "Actions"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y">
                  {contacts.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{c.name}</td>
                      <td className="px-3 py-2 text-sm">{c.email}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{c.company}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2"><Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => deleteItem("contacts", c.id)}><Trash2 size={16} /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contacts.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No contacts</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {activeSubTab === "quotes" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Quotes</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  {["Name", "Email", "Services", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y">
                  {quotes.map(q => (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{q.name}</td>
                      <td className="px-3 py-2 text-sm">{q.email}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{typeof q.services === "string" ? q.services.slice(0, 30) : "—"}</td>
                      <td className="px-3 py-2"><Badge variant="outline">{q.status}</Badge></td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2"><Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => deleteItem("quotes", q.id)}><Trash2 size={16} /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {quotes.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No quotes</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {activeSubTab === "tickets" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Tickets</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  {["Title", "Status", "Priority", "Created", "Actions"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y">
                  {tickets.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{t.title}</td>
                      <td className="px-3 py-2"><Badge variant="outline">{t.status}</Badge></td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{t.priority}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2"><Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => deleteItem("tickets", t.id)}><Trash2 size={16} /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tickets.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No tickets</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InvoicesTab({ invoices, headers, refresh }: { invoices: any[]; headers: () => any; refresh: () => void }) {
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Client Invoices</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              {["Invoice", "Client", "Status", "Total", "Due Date", "Created"].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs">{inv.invoiceNumber}</td>
                  <td className="px-3 py-2 font-medium text-sm">{inv.userName || "N/A"}</td>
                  <td className="px-3 py-2">
                    <Badge variant={inv.status === "paid" ? "default" : "outline"}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 font-semibold">${parseFloat(inv.total || 0).toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No invoices</p>}
        </div>
      </CardContent>
    </Card>
  );
}

