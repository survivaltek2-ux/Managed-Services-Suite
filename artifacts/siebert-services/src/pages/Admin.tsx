import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Settings, Briefcase, MessageSquare, Users, HelpCircle,
  Inbox, FileText, Ticket as TicketIcon, LogOut, Loader2, Plus, Edit2,
  Trash2, Save, Search, Download, Activity, PenTool, Eye, Send, Check,
  X, ChevronDown, BarChart3, Clock, DollarSign, AlertCircle
} from "lucide-react";
import {
  Button, Input, Textarea, Label, Card, CardHeader, CardTitle, CardContent, Badge,
} from "@/components/ui";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type TabType = "dashboard" | "settings" | "services" | "testimonials" | "team" | "faq" | "blog" | "contacts" | "quotes" | "proposals" | "tickets" | "users" | "activity" | "partnerCommissions";

const TABS: { id: TabType; label: string; icon: React.ReactNode; section?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, section: "Overview" },
  { id: "blog", label: "Blog Posts", icon: <PenTool size={18} />, section: "Content" },
  { id: "services", label: "Services", icon: <Briefcase size={18} /> },
  { id: "testimonials", label: "Testimonials", icon: <MessageSquare size={18} /> },
  { id: "team", label: "Team Members", icon: <Users size={18} /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle size={18} /> },
  { id: "settings", label: "Site Settings", icon: <Settings size={18} /> },
  { id: "contacts", label: "Contacts", icon: <Inbox size={18} />, section: "Inquiries" },
  { id: "quotes", label: "Quote Requests", icon: <FileText size={18} /> },
  { id: "proposals", label: "Proposals", icon: <DollarSign size={18} /> },
  { id: "tickets", label: "Tickets", icon: <TicketIcon size={18} /> },
  { id: "partnerCommissions", label: "Partner Commissions", icon: <DollarSign size={18} />, section: "Partners" },
  { id: "users", label: "Users", icon: <Users size={18} />, section: "System" },
  { id: "activity", label: "Activity Log", icon: <Activity size={18} /> },
];

export default function Admin() {
  const { user, token, login, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
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
        services: "/api/admin/cms/services",
        testimonials: "/api/admin/cms/testimonials",
        team: "/api/admin/cms/team",
        faq: "/api/admin/cms/faq",
        blog: "/api/admin/cms/blog",
        contacts: "/api/admin/contacts",
        quotes: "/api/admin/quotes",
        proposals: "/api/admin/proposals",
        tickets: "/api/admin/tickets",
        partnerCommissions: "/api/admin/partner/commissions",
        users: "/api/admin/users",
        activity: "/api/admin/activity",
      };
      const res = await fetch(endpoints[tab], { headers: headers() });
      if (res.ok) {
        const result = await res.json();
        setData(prev => ({ ...prev, [tab]: result }));
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
        body: JSON.stringify({ email, password }),
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
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{loginError}</div>}
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
              {activeTab === "settings" && <SettingsTab data={data.settings} refresh={() => fetchData("settings")} headers={headers} />}
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
              {activeTab === "contacts" && <ContactsTab contacts={data.contacts || []} refresh={() => fetchData("contacts")} headers={headers} exportCSV={() => exportCSV("contacts")} />}
              {activeTab === "quotes" && <QuotesTab quotes={data.quotes || []} refresh={() => fetchData("quotes")} headers={headers} exportCSV={() => exportCSV("quotes")} />}
              {activeTab === "proposals" && <ProposalsTab proposals={data.proposals || []} refresh={() => fetchData("proposals")} headers={headers} />}
              {activeTab === "tickets" && <TicketsTab tickets={data.tickets || []} refresh={() => fetchData("tickets")} headers={headers} exportCSV={() => exportCSV("tickets")} />}
              {activeTab === "partnerCommissions" && <PartnerCommissionsTab commissions={data.partnerCommissions || []} refresh={() => fetchData("partnerCommissions")} headers={headers} />}
              {activeTab === "users" && <UsersTab users={data.users || []} refresh={() => fetchData("users")} headers={headers} currentUserId={user?.id} />}
              {activeTab === "activity" && <ActivityTab activities={data.activity || []} />}
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

function SettingsTab({ data, refresh, headers }: { data: any; refresh: () => void; headers: () => any }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Array.isArray(data)) {
      const m: Record<string, string> = {};
      data.forEach((s: any) => { m[s.key] = s.value; });
      setFormData(m);
    } else if (data && typeof data === "object") {
      setFormData(data);
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/settings", {
        method: "PUT", headers: headers(), body: JSON.stringify(formData),
      });
      if (res.ok) { toast({ title: "Settings saved" }); refresh(); }
      else toast({ title: "Failed to save", variant: "destructive" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const textareas = ["hero_description", "about_story", "zoom_partner_description"];
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
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
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
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

function ContactsTab({ contacts, refresh, headers, exportCSV }: { contacts: any[]; refresh: () => void; headers: () => any; exportCSV: () => void }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search) return contacts;
    const s = search.toLowerCase();
    return contacts.filter(c => c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || (c.company || "").toLowerCase().includes(s));
  }, [contacts, search]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete?")) return;
    try {
      await fetch(`/api/admin/contacts/${id}`, { method: "DELETE", headers: headers() });
      toast({ title: "Deleted" }); refresh();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1.5" />Export CSV</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Company</th>
                <th className="px-5 py-3 text-left">Service</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3">{c.email}</td>
                  <td className="px-5 py-3">{c.company || "-"}</td>
                  <td className="px-5 py-3">{c.service || "-"}</td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No contacts found.</div>}
        </div>
      </Card>
    </div>
  );
}

function QuotesTab({ quotes, refresh, headers, exportCSV }: { quotes: any[]; refresh: () => void; headers: () => any; exportCSV: () => void }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const filtered = useMemo(() => {
    if (!search) return quotes;
    const s = search.toLowerCase();
    return quotes.filter(q => q.company.toLowerCase().includes(s) || q.name.toLowerCase().includes(s) || q.email.toLowerCase().includes(s));
  }, [quotes, search]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/admin/quotes/${id}/status`, { method: "PUT", headers: headers(), body: JSON.stringify({ status }) });
      toast({ title: `Status updated to ${status}` }); refresh();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete?")) return;
    try {
      await fetch(`/api/admin/quotes/${id}`, { method: "DELETE", headers: headers() });
      toast({ title: "Deleted" }); refresh();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1.5" />Export CSV</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Company</th>
                <th className="px-5 py-3 text-left">Contact</th>
                <th className="px-5 py-3 text-left">Budget</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => setSelected(q)}>
                  <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-medium">{q.company}</td>
                  <td className="px-5 py-3">{q.name}</td>
                  <td className="px-5 py-3">{q.budget || "-"}</td>
                  <td className="px-5 py-3">
                    <select className="h-7 px-2 rounded border text-xs bg-background" value={q.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateStatus(q.id, e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="quoted">Quoted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(q.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No quotes found.</div>}
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Quote Request Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{selected.name}</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p>{selected.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p>{selected.phone || "-"}</p></div>
                <div><p className="text-xs text-muted-foreground">Company</p><p>{selected.company}</p></div>
                <div><p className="text-xs text-muted-foreground">Company Size</p><p>{selected.companySize || "-"}</p></div>
                <div><p className="text-xs text-muted-foreground">Budget</p><p>{selected.budget || "-"}</p></div>
                <div><p className="text-xs text-muted-foreground">Timeline</p><p>{selected.timeline || "-"}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge>{selected.status}</Badge></div>
              </div>
              <div><p className="text-xs text-muted-foreground">Services</p><div className="flex flex-wrap gap-1 mt-1">{(selected.services || []).map((s: string) => <Badge key={s} variant="outline">{s}</Badge>)}</div></div>
              {selected.details && <div><p className="text-xs text-muted-foreground">Details</p><p className="mt-1">{selected.details}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProposalsTab({ proposals, refresh, headers }: { proposals: any[]; refresh: () => void; headers: () => any }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({
    clientName: "", clientEmail: "", clientCompany: "", clientPhone: "", title: "",
    summary: "", discount: "0", discountType: "fixed", tax: "0", validUntil: "",
    terms: "Payment is due within 30 days of invoice.\nPrices are valid for the duration specified.\nAll services subject to the terms of our Master Service Agreement.",
    notes: "", lineItems: [{ name: "", description: "", quantity: 1, unitPrice: "", unit: "each", category: "service", recurring: false, recurringInterval: "" }],
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      clientName: "", clientEmail: "", clientCompany: "", clientPhone: "", title: "",
      summary: "", discount: "0", discountType: "fixed", tax: "0",
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      terms: "Payment is due within 30 days of invoice.\nPrices are valid for the duration specified.\nAll services subject to the terms of our Master Service Agreement.",
      notes: "", lineItems: [{ name: "", description: "", quantity: 1, unitPrice: "", unit: "each", category: "service", recurring: false, recurringInterval: "" }],
    });
    setOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      clientName: p.clientName, clientEmail: p.clientEmail, clientCompany: p.clientCompany,
      clientPhone: p.clientPhone || "", title: p.title, summary: p.summary || "",
      discount: p.discount || "0", discountType: p.discountType || "fixed", tax: p.tax || "0",
      validUntil: p.validUntil ? new Date(p.validUntil).toISOString().slice(0, 10) : "",
      terms: p.terms || "", notes: p.notes || "",
      lineItems: p.lineItems?.length > 0 ? p.lineItems : [{ name: "", description: "", quantity: 1, unitPrice: "", unit: "each", category: "service", recurring: false, recurringInterval: "" }],
    });
    setOpen(true);
  };

  const addLineItem = () => setForm((p: any) => ({
    ...p, lineItems: [...p.lineItems, { name: "", description: "", quantity: 1, unitPrice: "", unit: "each", category: "service", recurring: false, recurringInterval: "" }]
  }));

  const removeLineItem = (idx: number) => setForm((p: any) => ({
    ...p, lineItems: p.lineItems.filter((_: any, i: number) => i !== idx)
  }));

  const updateLineItem = (idx: number, field: string, value: any) => setForm((p: any) => ({
    ...p, lineItems: p.lineItems.map((item: any, i: number) => i === idx ? { ...item, [field]: value } : item)
  }));

  const subtotal = form.lineItems.reduce((sum: number, item: any) => sum + (parseFloat(item.unitPrice || "0") * (item.quantity || 1)), 0);

  const handleSave = async () => {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/admin/proposals/${editing.id}` : "/api/admin/proposals";
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
      if (res.ok) { toast({ title: "Proposal saved" }); setOpen(false); refresh(); }
      else { const d = await res.json(); toast({ title: d.message || "Failed", variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleSend = async (id: number) => {
    try {
      await fetch(`/api/admin/proposals/${id}/send`, { method: "PUT", headers: headers() });
      toast({ title: "Proposal marked as sent" }); refresh();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this proposal?")) return;
    try {
      await fetch(`/api/admin/proposals/${id}`, { method: "DELETE", headers: headers() });
      toast({ title: "Deleted" }); refresh();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const statusColor = (s: string) => {
    switch (s) { case "accepted": return "default"; case "sent": case "viewed": return "secondary"; case "rejected": case "expired": return "destructive"; default: return "outline"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1.5" />New Proposal</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Number</th>
                <th className="px-5 py-3 text-left">Client</th>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Total</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Valid Until</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p: any) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3 font-mono text-xs">{p.proposalNumber}</td>
                  <td className="px-5 py-3 font-medium">{p.clientCompany}</td>
                  <td className="px-5 py-3">{p.title}</td>
                  <td className="px-5 py-3 font-medium">${parseFloat(p.total || "0").toLocaleString()}</td>
                  <td className="px-5 py-3"><Badge variant={statusColor(p.status)}>{p.status}</Badge></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{p.validUntil ? new Date(p.validUntil).toLocaleDateString() : "-"}</td>
                  <td className="px-5 py-3 text-right space-x-1">
                    {p.status === "draft" && <Button variant="ghost" size="icon" onClick={() => handleSend(p.id)} title="Mark as Sent"><Send className="w-4 h-4" /></Button>}
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      const base = window.location.origin + (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
                      navigator.clipboard.writeText(`${base}/proposal/${p.proposalNumber}`);
                      toast({ title: "Link copied!" });
                    }}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {proposals.length === 0 && <div className="p-8 text-center text-muted-foreground">No proposals yet. Create one to get started.</div>}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Proposal" : "New Proposal"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Client Name *</Label><Input value={form.clientName} onChange={e => setForm((p: any) => ({ ...p, clientName: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Client Email *</Label><Input type="email" value={form.clientEmail} onChange={e => setForm((p: any) => ({ ...p, clientEmail: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Client Company *</Label><Input value={form.clientCompany} onChange={e => setForm((p: any) => ({ ...p, clientCompany: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Client Phone</Label><Input value={form.clientPhone} onChange={e => setForm((p: any) => ({ ...p, clientPhone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Proposal Title *</Label><Input value={form.title} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Valid Until</Label><Input type="date" value={form.validUntil} onChange={e => setForm((p: any) => ({ ...p, validUntil: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Summary</Label><Textarea value={form.summary} onChange={e => setForm((p: any) => ({ ...p, summary: e.target.value }))} className="min-h-[60px]" /></div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Line Items</Label>
                <Button size="sm" variant="outline" onClick={addLineItem}><Plus className="w-3 h-3 mr-1" />Add Item</Button>
              </div>
              {form.lineItems.map((item: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 space-y-1"><Label className="text-[10px]">Item Name</Label><Input value={item.name} onChange={e => updateLineItem(idx, "name", e.target.value)} /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[10px]">Qty</Label><Input type="number" min={1} value={item.quantity} onChange={e => updateLineItem(idx, "quantity", parseInt(e.target.value) || 1)} /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[10px]">Unit Price</Label><Input type="number" step="0.01" value={item.unitPrice} onChange={e => updateLineItem(idx, "unitPrice", e.target.value)} /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[10px]">Unit</Label>
                      <select className="h-9 w-full px-2 rounded-md border text-xs bg-background" value={item.unit} onChange={e => updateLineItem(idx, "unit", e.target.value)}>
                        <option value="each">Each</option><option value="hour">Hour</option><option value="month">Month</option><option value="year">Year</option><option value="license">License</option><option value="user">User</option>
                      </select>
                    </div>
                    <div className="col-span-1 space-y-1"><Label className="text-[10px]">Total</Label><p className="h-9 flex items-center text-sm font-medium">${((parseFloat(item.unitPrice || "0") * (item.quantity || 1))).toFixed(2)}</p></div>
                    <div className="col-span-1 flex items-end">
                      {form.lineItems.length > 1 && <Button variant="ghost" size="icon" className="text-destructive h-9" onClick={() => removeLineItem(idx)}><X className="w-3.5 h-3.5" /></Button>}
                    </div>
                  </div>
                  <Input placeholder="Description (optional)" className="text-xs" value={item.description || ""} onChange={e => updateLineItem(idx, "description", e.target.value)} />
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={item.recurring} onChange={e => updateLineItem(idx, "recurring", e.target.checked)} className="w-3.5 h-3.5" />Recurring
                    {item.recurring && (
                      <select className="h-7 px-2 rounded border text-xs bg-background ml-2" value={item.recurringInterval || ""} onChange={e => updateLineItem(idx, "recurringInterval", e.target.value)}>
                        <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annually">Annually</option>
                      </select>
                    )}
                  </label>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Discount</Label>
                <div className="flex gap-1">
                  <Input type="number" step="0.01" value={form.discount} onChange={e => setForm((p: any) => ({ ...p, discount: e.target.value }))} className="flex-1" />
                  <select className="h-9 px-2 rounded-md border text-xs bg-background" value={form.discountType} onChange={e => setForm((p: any) => ({ ...p, discountType: e.target.value }))}>
                    <option value="fixed">$</option><option value="percent">%</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Tax Rate (%)</Label><Input type="number" step="0.01" value={form.tax} onChange={e => setForm((p: any) => ({ ...p, tax: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Subtotal</Label><p className="h-9 flex items-center text-lg font-bold">${subtotal.toFixed(2)}</p></div>
            </div>

            <div className="space-y-1"><Label className="text-xs">Terms & Conditions</Label><Textarea value={form.terms} onChange={e => setForm((p: any) => ({ ...p, terms: e.target.value }))} className="min-h-[80px]" /></div>
            <div className="space-y-1"><Label className="text-xs">Internal Notes</Label><Textarea value={form.notes} onChange={e => setForm((p: any) => ({ ...p, notes: e.target.value }))} className="min-h-[60px]" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"} Proposal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TicketsTab({ tickets, refresh, headers, exportCSV }: { tickets: any[]; refresh: () => void; headers: () => any; exportCSV: () => void }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search) return tickets;
    const s = search.toLowerCase();
    return tickets.filter(t => t.subject.toLowerCase().includes(s));
  }, [tickets, search]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/admin/tickets/${id}/status`, { method: "PUT", headers: headers(), body: JSON.stringify({ status }) });
      toast({ title: `Status updated` }); refresh();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete?")) return;
    try {
      await fetch(`/api/admin/tickets/${id}`, { method: "DELETE", headers: headers() });
      toast({ title: "Deleted" }); refresh();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1.5" />Export CSV</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-5 py-3 text-left">Subject</th>
                <th className="px-5 py-3 text-left">Priority</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3 text-muted-foreground">#{t.id}</td>
                  <td className="px-5 py-3 font-medium">{t.subject}</td>
                  <td className="px-5 py-3">
                    <Badge variant={t.priority === "critical" ? "destructive" : t.priority === "high" ? "default" : "secondary"}>{t.priority}</Badge>
                  </td>
                  <td className="px-5 py-3">{t.category}</td>
                  <td className="px-5 py-3">
                    <select className="h-7 px-2 rounded border text-xs bg-background" value={t.status}
                      onChange={e => updateStatus(t.id, e.target.value)}>
                      <option value="open">Open</option><option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option><option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No tickets found.</div>}
        </div>
      </Card>
    </div>
  );
}

function UsersTab({ users, refresh, headers, currentUserId }: { users: any[]; refresh: () => void; headers: () => any; currentUserId?: number }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
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

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} />
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

function PartnerCommissionsTab({ commissions, refresh, headers }: { commissions: any[]; refresh: () => void; headers: () => Record<string, string> }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ partnerId: "", dealId: "", type: "deal", description: "", amount: "", rate: "10" });

  const filtered = useMemo(() => commissions.filter((c: any) => {
    const matchSearch = !search || [c.description, c.partnerCompany, c.partnerContact].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  }), [commissions, search, statusFilter]);

  const totals = useMemo(() => ({
    pending: commissions.filter((c: any) => c.status === "pending").reduce((s: number, c: any) => s + parseFloat(c.amount || 0), 0),
    approved: commissions.filter((c: any) => c.status === "approved").reduce((s: number, c: any) => s + parseFloat(c.amount || 0), 0),
    paid: commissions.filter((c: any) => c.status === "paid").reduce((s: number, c: any) => s + parseFloat(c.amount || 0), 0),
    total: commissions.reduce((s: number, c: any) => s + parseFloat(c.amount || 0), 0),
  }), [commissions]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/partner/commissions/${id}`, {
        method: "PUT", headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { toast({ title: `Commission ${status}` }); refresh(); }
      else { const err = await res.json().catch(() => ({})); toast({ title: err.message || "Failed to update commission", variant: "destructive" }); }
    } catch { toast({ title: "Error updating commission", variant: "destructive" }); }
  };

  const createCommission = async () => {
    try {
      const res = await fetch("/api/admin/partner/commissions", {
        method: "POST", headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, partnerId: parseInt(form.partnerId), dealId: form.dealId ? parseInt(form.dealId) : null }),
      });
      if (res.ok) { toast({ title: "Commission created" }); setCreateOpen(false); setForm({ partnerId: "", dealId: "", type: "deal", description: "", amount: "", rate: "10" }); refresh(); }
      else toast({ title: "Failed to create commission", variant: "destructive" });
    } catch { toast({ title: "Error creating commission", variant: "destructive" }); }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800", approved: "bg-blue-100 text-blue-800", paid: "bg-emerald-100 text-emerald-800", rejected: "bg-red-100 text-red-800" };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pending", value: fmt(totals.pending), color: "text-yellow-600" },
          { label: "Approved", value: fmt(totals.approved), color: "text-blue-600" },
          { label: "Paid", value: fmt(totals.paid), color: "text-emerald-600" },
          { label: "Total", value: fmt(totals.total), color: "text-primary" },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Partner Commissions</CardTitle>
            <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> New Commission</Button>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by partner or description..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="h-9 px-3 rounded-md border text-sm bg-background" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-5 py-3 text-left">Partner</th>
                  <th className="px-5 py-3 text-left">Description</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-right">Rate</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: any) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-5 py-3">
                      <div className="font-medium">{c.partnerCompany || "—"}</div>
                      <div className="text-xs text-muted-foreground">{c.partnerContact}</div>
                    </td>
                    <td className="px-5 py-3 max-w-[250px] truncate">{c.description}</td>
                    <td className="px-5 py-3 capitalize">{c.type}</td>
                    <td className="px-5 py-3 text-right">{c.rate ? `${c.rate}%` : "—"}</td>
                    <td className="px-5 py-3 text-right font-medium">{fmt(parseFloat(c.amount || 0))}</td>
                    <td className="px-5 py-3">{statusBadge(c.status)}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {c.status === "pending" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" title="Approve" onClick={() => updateStatus(c.id, "approved")}><Check className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" title="Reject" onClick={() => updateStatus(c.id, "rejected")}><X className="w-4 h-4" /></Button>
                          </>
                        )}
                        {c.status === "approved" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" title="Mark Paid" onClick={() => updateStatus(c.id, "paid")}><DollarSign className="w-4 h-4" /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No commissions found.</div>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent role="dialog" aria-modal="true">
          <DialogHeader><DialogTitle>Create Commission</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Partner ID</Label><Input type="number" value={form.partnerId} onChange={e => setForm(p => ({ ...p, partnerId: e.target.value }))} placeholder="Enter partner ID" /></div>
            <div><Label>Deal ID (optional)</Label><Input type="number" value={form.dealId} onChange={e => setForm(p => ({ ...p, dealId: e.target.value }))} placeholder="Associated deal ID" /></div>
            <div><Label>Type</Label>
              <select className="w-full h-9 px-3 rounded-md border text-sm bg-background" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="deal">Deal</option><option value="recurring">Recurring</option><option value="spiff">Spiff</option><option value="bonus">Bonus</option>
              </select>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Commission description" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount ($)</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" /></div>
              <div><Label>Rate (%)</Label><Input type="number" step="0.01" value={form.rate} onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} placeholder="10" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createCommission} disabled={!form.partnerId || !form.description || !form.amount}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
